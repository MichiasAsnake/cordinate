/**
 * Enhanced Job Details Extraction Utilities
 *
 * Extracts detailed information from job details pages to populate
 * the enhanced JobData interface with customer contacts, shipping info,
 * and order line items.
 */

import { Page } from "playwright";
import {
  CustomerContact,
  OrderLineItem,
  JobFile,
  EnhancedOrder,
  JobTimelineEntry,
} from "../types/JobDataEnhanced.js";
import {
  extractEmailsFromText,
  extractPhonesFromText,
  createTimelineEntry,
} from "./jobDataTransform.js";

/**
 * Enhanced job details extraction result
 */
export interface EnhancedJobDetails {
  customerContact: Partial<CustomerContact>;
  orderDetails: Partial<EnhancedOrder>;
  lineItems: OrderLineItem[];
  files: JobFile[];
  timeline: JobTimelineEntry[];
  shippingInfo?: {
    address?: string;
    method?: string;
    tracking?: string;
  };
}

/**
 * Extract enhanced job details from job details page
 */
export async function extractEnhancedJobDetails(
  page: Page,
  jobNumber: string
): Promise<EnhancedJobDetails> {
  try {
    console.log(`🔍 Extracting enhanced details for job ${jobNumber}`);

    // Get page content for text analysis
    const pageContent = (await page.textContent("body")) || "";

    // Extract customer contact information
    const customerContact = await extractCustomerContact(page, pageContent);

    // Extract order line items
    const lineItems = await extractOrderLineItems(page);

    // Extract shipping information
    const shippingInfo = await extractShippingInfo(page, pageContent);

    // Extract job files and attachments
    const files = await extractJobFiles(page);

    // Extract timeline/history information
    const timeline = await extractJobTimeline(page, pageContent, jobNumber);

    // Extract additional order details
    const orderDetails = await extractOrderDetails(page, pageContent);

    const result: EnhancedJobDetails = {
      customerContact,
      orderDetails,
      lineItems,
      files,
      timeline,
      shippingInfo,
    };

    console.log(`✅ Enhanced extraction completed for job ${jobNumber}`);
    console.log(`   - Emails found: ${customerContact.emails?.length || 0}`);
    console.log(`   - Phones found: ${customerContact.phones?.length || 0}`);
    console.log(`   - Line items: ${lineItems.length}`);
    console.log(`   - Files: ${files.length}`);
    console.log(`   - Timeline entries: ${timeline.length}`);

    return result;
  } catch (error) {
    console.error(
      `❌ Error extracting enhanced details for job ${jobNumber}:`,
      error
    );

    // Return empty structure on error to maintain compatibility
    return {
      customerContact: {},
      orderDetails: {},
      lineItems: [],
      files: [],
      timeline: [],
    };
  }
}

/**
 * Extract customer contact information
 */
async function extractCustomerContact(
  page: Page,
  pageContent: string
): Promise<Partial<CustomerContact>> {
  try {
    // Extract emails and phones from page content
    const emails = extractEmailsFromText(pageContent);
    const phones = extractPhonesFromText(pageContent);

    // Clean and deduplicate contact information
    const uniqueEmails = Array.from(new Set(emails)).filter(
      (email) => email.length > 0 && email.includes("@")
    );

    const uniquePhones = Array.from(new Set(phones)).filter(
      (phone) => phone.length >= 10 && /\d/.test(phone)
    );

    // Try to extract customer name from specific selectors
    let customerName = "";
    try {
      // Look for customer information in common selectors
      const nameSelectors = [
        ".customer-name",
        ".client-name",
        '[data-field="customer"]',
        'td:contains("Customer")',
      ];

      for (const selector of nameSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            customerName = (await element.textContent()) || "";
            if (customerName.trim()) break;
          }
        } catch {
          // Continue to next selector
        }
      }
    } catch (error) {
      console.warn("Could not extract customer name:", error);
    }

    // Try to extract address information
    const address = await extractAddressInfo(page, pageContent);

    return {
      name: customerName || undefined,
      emails: uniqueEmails,
      phones: uniquePhones,
      address,
    };
  } catch (error) {
    console.error("Error extracting customer contact:", error);
    return {
      emails: [],
      phones: [],
    };
  }
}

/**
 * Extract address information from page content
 */
async function extractAddressInfo(
  page: Page,
  pageContent: string
): Promise<CustomerContact["address"] | undefined> {
  try {
    // Look for address patterns in page content
    const addressPatterns = [
      /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)[\s\S]*?\d{5}(?:-\d{4})?)/gi,
      /([A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?)/gi,
    ];

    for (const pattern of addressPatterns) {
      const matches = pageContent.match(pattern);
      if (matches && matches.length > 0) {
        const addressText = matches[0].trim();

        // Try to parse the address components
        const lines = addressText.split(/[,\n]/);
        if (lines.length >= 2) {
          return {
            line1: lines[0].trim(),
            city: lines.length > 2 ? lines[lines.length - 2].trim() : "",
            state: "",
            postal_code: "",
            country: "USA",
          };
        }
      }
    }

    return undefined;
  } catch (error) {
    console.error("Error extracting address info:", error);
    return undefined;
  }
}

/**
 * Extract order line items from job details table
 */
async function extractOrderLineItems(page: Page): Promise<OrderLineItem[]> {
  try {
    const lineItems: OrderLineItem[] = [];

    // Look for job lines table
    const tableSelectors = [
      ".job-joblines-list",
      ".order-items",
      ".line-items",
      'table[class*="job"]',
    ];

    for (const selector of tableSelectors) {
      try {
        const table = await page.$(selector);
        if (!table) continue;

        const rows = await table.$$("tr");

        for (let i = 1; i < rows.length; i++) {
          // Skip header row
          const row = rows[i];
          const cells = await row.$$("td");

          if (cells.length >= 3) {
            // Extract cell text content
            const cellTexts = await Promise.all(
              cells.map((cell) => cell.textContent())
            );

            // Try to identify asset tag, description, and quantity
            const assetTag = cellTexts[0]?.trim() || `ITEM-${i}`;
            const description = cellTexts[1]?.trim() || `Item ${assetTag}`;
            const quantityText = cellTexts[2]?.trim() || "1";
            const quantity = parseInt(quantityText) || 1;

            // Look for additional details in remaining cells
            const comments = cellTexts.slice(3).join(" ").trim();

            lineItems.push({
              asset_tag: assetTag,
              asset_sku: assetTag,
              description,
              quantity,
              status: "pending",
              comments: comments || undefined,
            });
          }
        }

        if (lineItems.length > 0) break; // Found items, stop looking
      } catch (error) {
        console.warn(`Error processing table ${selector}:`, error);
      }
    }

    return lineItems;
  } catch (error) {
    console.error("Error extracting order line items:", error);
    return [];
  }
}

/**
 * Extract shipping information
 */
async function extractShippingInfo(
  page: Page,
  pageContent: string
): Promise<
  { address?: string; method?: string; tracking?: string } | undefined
> {
  try {
    const shippingInfo: any = {};

    // Look for shipping-related text
    const shippingPatterns = [
      /shipping\s*(?:to|address):\s*([^\n]+)/gi,
      /ship\s*(?:to|date):\s*([^\n]+)/gi,
      /tracking\s*(?:number|#):\s*([A-Za-z0-9]+)/gi,
    ];

    for (const pattern of shippingPatterns) {
      const matches = pageContent.match(pattern);
      if (matches) {
        const match = matches[0];
        if (match.toLowerCase().includes("address")) {
          shippingInfo.address = match.split(":")[1]?.trim();
        } else if (match.toLowerCase().includes("tracking")) {
          shippingInfo.tracking = match.split(":")[1]?.trim();
        }
      }
    }

    return Object.keys(shippingInfo).length > 0 ? shippingInfo : undefined;
  } catch (error) {
    console.error("Error extracting shipping info:", error);
    return undefined;
  }
}

/**
 * Extract job files and attachments
 */
async function extractJobFiles(page: Page): Promise<JobFile[]> {
  try {
    const files: JobFile[] = [];

    // Look for file links and attachments
    const fileSelectors = [
      'a[href*=".pdf"]',
      'a[href*=".doc"]',
      'a[href*=".jpg"]',
      'a[href*=".png"]',
      'a[href*="download"]',
      ".file-attachment",
      ".document-link",
    ];

    for (const selector of fileSelectors) {
      try {
        const elements = await page.$$(selector);

        for (const element of elements) {
          const href = await element.getAttribute("href");
          const text = await element.textContent();

          if (href && text) {
            const filename = text.trim() || href.split("/").pop() || "unknown";
            const fileType = getFileTypeFromUrl(href);

            files.push({
              filename,
              file_type: fileType,
              file_url: href,
              uploaded_at: new Date().toISOString(),
              category: categorizeFile(filename, fileType),
              is_active: true,
              description: `File: ${filename}`,
            });
          }
        }
      } catch (error) {
        console.warn(`Error processing file selector ${selector}:`, error);
      }
    }

    return files;
  } catch (error) {
    console.error("Error extracting job files:", error);
    return [];
  }
}

/**
 * Extract job timeline and history
 */
async function extractJobTimeline(
  page: Page,
  pageContent: string,
  jobNumber: string
): Promise<JobTimelineEntry[]> {
  try {
    const timeline: JobTimelineEntry[] = [];

    // Add creation entry
    timeline.push(
      createTimelineEntry(
        "created",
        `Job ${jobNumber} details page accessed`,
        "System"
      )
    );

    // Look for status changes or history in the page
    const historyPatterns = [
      /(?:status|updated|changed|completed)[\s:]*([^\n]+)/gi,
      /(?:assigned|due|shipped)[\s:]*([^\n]+)/gi,
    ];

    for (const pattern of historyPatterns) {
      const matches = pageContent.match(pattern);
      if (matches) {
        for (const match of matches.slice(0, 5)) {
          // Limit to 5 entries
          timeline.push(
            createTimelineEntry("status_change", match.trim(), "System")
          );
        }
      }
    }

    return timeline;
  } catch (error) {
    console.error("Error extracting job timeline:", error);
    return [];
  }
}

/**
 * Extract additional order details
 */
async function extractOrderDetails(
  page: Page,
  pageContent: string
): Promise<Partial<EnhancedOrder>> {
  try {
    const details: Partial<EnhancedOrder> = {};

    // Look for due date information
    const dueDatePatterns = [
      /due\s*(?:date)?[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
      /delivery\s*(?:date)?[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
    ];

    for (const pattern of dueDatePatterns) {
      const match = pageContent.match(pattern);
      if (match && match[1]) {
        try {
          const date = new Date(match[1]);
          if (!isNaN(date.getTime())) {
            details.due_date = date.toISOString().split("T")[0];
            break;
          }
        } catch {
          // Invalid date, continue
        }
      }
    }

    // Look for priority indicators
    if (
      pageContent.toLowerCase().includes("urgent") ||
      pageContent.toLowerCase().includes("rush")
    ) {
      details.priority = "urgent";
    } else if (pageContent.toLowerCase().includes("high priority")) {
      details.priority = "high";
    }

    return details;
  } catch (error) {
    console.error("Error extracting order details:", error);
    return {};
  }
}

/**
 * Helper function to determine file type from URL
 */
function getFileTypeFromUrl(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase();

  const typeMap: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
  };

  return typeMap[extension || ""] || "application/octet-stream";
}

/**
 * Helper function to categorize files
 */
function categorizeFile(
  filename: string,
  fileType: string
): "design" | "proof" | "reference" | "shipping" | "other" {
  const name = filename.toLowerCase();

  if (
    name.includes("design") ||
    name.includes("artwork") ||
    fileType.startsWith("image/")
  ) {
    return "design";
  } else if (name.includes("proof") || name.includes("preview")) {
    return "proof";
  } else if (name.includes("shipping") || name.includes("tracking")) {
    return "shipping";
  } else if (name.includes("reference") || name.includes("spec")) {
    return "reference";
  }

  return "other";
}
