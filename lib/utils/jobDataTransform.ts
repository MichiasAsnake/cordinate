/**
 * JobData Transformation Utilities
 *
 * Handles conversion between current JobData interface and enhanced version,
 * ensuring backward compatibility and smooth data migration.
 */

import {
  JobDataEnhanced,
  BaseJobData,
  CustomerContact,
  OrderLineItem,
  ProcessTag,
  JobTimelineEntry,
  EnhancedOrder,
  JobFile,
  JobDataTransition,
} from "../types/JobDataEnhanced";

/**
 * Constants for default values and validation
 */
export const DEFAULT_CUSTOMER_EMAILS: string[] = [];
export const DEFAULT_CUSTOMER_PHONES: string[] = [];
export const DEFAULT_PRIORITY = "medium" as const;
export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_FILE_CATEGORY = "other" as const;

/**
 * Extract email addresses from text content
 */
export function extractEmailsFromText(text: string): string[] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Extract phone numbers from text content
 */
export function extractPhonesFromText(text: string): string[] {
  const phoneRegex =
    /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g;
  const matches = text.match(phoneRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Transform current JobData to enhanced version
 */
export function transformToEnhanced(
  baseData: BaseJobData,
  additionalData?: Partial<JobDataTransition>
): JobDataEnhanced {
  // Extract contact information from existing data if not provided
  const allText = [
    baseData.customer.name,
    baseData.order.title,
    ...baseData.jobDescriptions.map((jd) => jd.text),
  ].join(" ");

  const extractedEmails =
    additionalData?.customer_emails || extractEmailsFromText(allText);
  const extractedPhones =
    additionalData?.customer_phones || extractPhonesFromText(allText);

  // Transform customer data
  const customer: CustomerContact = {
    name: baseData.customer.name,
    emails: extractedEmails,
    phones: extractedPhones,
    address: additionalData?.customer_address,
  };

  // Transform process tags
  const tags: ProcessTag[] = baseData.tags.map((tag) => ({
    code: tag.code,
    name: tag.code, // Will need to be enhanced with actual tag names
    quantity: tag.quantity,
    color: "#6B7280", // Default color, should be mapped from tag data
    status: "pending",
  }));

  // Transform to timeline entries
  const timeline: JobTimelineEntry[] = [
    // Add creation entry
    {
      event_type: "created",
      description: "Job created",
      timestamp: baseData.order.created_at || new Date().toISOString(),
      user_name: "System",
    },
    // Convert job descriptions to timeline entries
    ...baseData.jobDescriptions.map((jd) => ({
      event_type: "comment" as const,
      description: jd.text,
      timestamp: jd.timestamp,
      user_name: jd.author || "Unknown",
    })),
    // Add additional timeline entries if provided
    ...(additionalData?.timeline || []),
  ];

  // Transform order data
  const order: EnhancedOrder = {
    order_number: baseData.order.order_number,
    title: baseData.order.title,
    status: baseData.order.status,
    priority: DEFAULT_PRIORITY,
    created_at: baseData.order.created_at,
    ship_date: baseData.order.ship_date,
    images: baseData.order.images,
    line_items: additionalData?.line_items || [],
    files: additionalData?.files || [],
    currency: DEFAULT_CURRENCY,
  };

  // Create enhanced job data
  const enhanced: JobDataEnhanced = {
    jobNumber: baseData.jobNumber,
    customer,
    order,
    tags,
    timeline,
    jobDescriptions: baseData.jobDescriptions, // Keep for backward compatibility
    metadata: {
      last_updated: new Date().toISOString(),
      version: 1,
      data_source: "scraper",
    },
  };

  return enhanced;
}

/**
 * Transform enhanced JobData back to base format for backward compatibility
 */
export function transformToBase(enhanced: JobDataEnhanced): BaseJobData {
  return {
    jobNumber: enhanced.jobNumber,
    customer: {
      name: enhanced.customer.name,
    },
    order: {
      order_number: enhanced.order.order_number,
      title: enhanced.order.title,
      status: enhanced.order.status,
      created_at: enhanced.order.created_at,
      ship_date: enhanced.order.ship_date,
      images: enhanced.order.images,
    },
    tags: enhanced.tags.map((tag) => ({
      code: tag.code,
      quantity: tag.quantity,
    })),
    jobDescriptions: enhanced.jobDescriptions,
  };
}

/**
 * Create order line items from asset tags in images
 */
export function createLineItemsFromImages(
  images: Array<{
    asset_tag: string;
    thumbnail_url: string;
    high_res_url: string;
    thumbnail_base_path: string;
    high_res_base_path: string;
  }>
): OrderLineItem[] {
  return images.map((image) => ({
    asset_tag: image.asset_tag,
    asset_sku: image.asset_tag,
    description: `Item ${image.asset_tag}`,
    quantity: 1, // Default quantity
    status: "pending",
    image_url: image.thumbnail_url,
  }));
}

/**
 * Transform images to job files
 */
export function transformImagesToFiles(
  images: Array<{
    asset_tag: string;
    thumbnail_url: string;
    high_res_url: string;
    thumbnail_base_path: string;
    high_res_base_path: string;
  }>
): JobFile[] {
  return images.map((image) => ({
    filename: `${image.asset_tag}_image.jpg`,
    file_type: "image/jpeg",
    file_url: image.high_res_url,
    thumbnail_url: image.thumbnail_url,
    uploaded_at: new Date().toISOString(),
    category: "design",
    is_active: true,
    description: `Image for asset ${image.asset_tag}`,
  }));
}

/**
 * Validate enhanced job data structure
 */
export function validateEnhancedJobData(data: Partial<JobDataEnhanced>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.jobNumber) {
    errors.push("Job number is required");
  }

  if (!data.customer?.name) {
    errors.push("Customer name is required");
  }

  if (!data.order?.order_number) {
    errors.push("Order number is required");
  }

  if (!data.order?.title) {
    errors.push("Order title is required");
  }

  if (data.customer?.emails) {
    const invalidEmails = data.customer.emails.filter(
      (email) =>
        !email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/)
    );
    if (invalidEmails.length > 0) {
      errors.push(`Invalid email addresses: ${invalidEmails.join(", ")}`);
    }
  }

  if (data.order?.line_items) {
    data.order.line_items.forEach((item, index) => {
      if (!item.asset_tag) {
        errors.push(`Line item ${index + 1}: Asset tag is required`);
      }
      if (!item.description) {
        errors.push(`Line item ${index + 1}: Description is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Merge partial enhanced data with existing data
 */
export function mergeEnhancedJobData(
  existing: JobDataEnhanced,
  updates: Partial<JobDataEnhanced>
): JobDataEnhanced {
  const merged: JobDataEnhanced = {
    ...existing,
    ...updates,
    customer: {
      ...existing.customer,
      ...updates.customer,
    },
    order: {
      ...existing.order,
      ...updates.order,
      line_items: updates.order?.line_items || existing.order.line_items,
      files: updates.order?.files || existing.order.files,
    },
    tags: updates.tags || existing.tags,
    timeline: updates.timeline || existing.timeline,
    metadata: {
      ...existing.metadata,
      ...updates.metadata,
      last_updated: new Date().toISOString(),
      version: (existing.metadata?.version || 0) + 1,
      data_source:
        updates.metadata?.data_source ||
        existing.metadata?.data_source ||
        "manual",
    },
  };

  return merged;
}

/**
 * Extract contact information from job details page data
 */
export function extractContactFromPageData(pageData: {
  emails?: string[];
  phones?: string[];
  customerName?: string;
}): Partial<CustomerContact> {
  return {
    emails: pageData.emails || [],
    phones: pageData.phones || [],
  };
}

/**
 * Create a timeline entry
 */
export function createTimelineEntry(
  eventType: JobTimelineEntry["event_type"],
  description: string,
  userName?: string,
  metadata?: Record<string, any>
): JobTimelineEntry {
  return {
    event_type: eventType,
    description,
    timestamp: new Date().toISOString(),
    user_name: userName,
    metadata,
  };
}

/**
 * Calculate order total value from line items
 */
export function calculateOrderTotal(lineItems: OrderLineItem[]): number {
  return lineItems.reduce((total, item) => {
    return total + (item.total_cost || (item.unit_cost || 0) * item.quantity);
  }, 0);
}

/**
 * Format enhanced job data for API response
 */
export function formatForApiResponse(data: JobDataEnhanced) {
  return {
    ...data,
    order: {
      ...data.order,
      total_value:
        data.order.total_value || calculateOrderTotal(data.order.line_items),
    },
  };
}

/**
 * Check if enhanced features are available for a job
 */
export function hasEnhancedFeatures(data: JobDataEnhanced): {
  hasContactInfo: boolean;
  hasLineItems: boolean;
  hasFiles: boolean;
  hasTimeline: boolean;
  enhancementLevel: "basic" | "partial" | "full";
} {
  const hasContactInfo =
    data.customer.emails.length > 0 || data.customer.phones.length > 0;
  const hasLineItems = data.order.line_items.length > 0;
  const hasFiles = data.order.files.length > 0;
  const hasTimeline = data.timeline.length > 1; // More than just creation entry

  const features = [hasContactInfo, hasLineItems, hasFiles, hasTimeline];
  const enhancedCount = features.filter(Boolean).length;

  let enhancementLevel: "basic" | "partial" | "full";
  if (enhancedCount === 0) {
    enhancementLevel = "basic";
  } else if (enhancedCount < 3) {
    enhancementLevel = "partial";
  } else {
    enhancementLevel = "full";
  }

  return {
    hasContactInfo,
    hasLineItems,
    hasFiles,
    hasTimeline,
    enhancementLevel,
  };
}
