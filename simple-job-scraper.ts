import "./loadEnv.js";
import { chromium, Browser, Page } from "playwright";
import fs from "fs";

// Load credentials from existing scraper setup
const CONFIG_DIR = process.cwd() + "/.config";
const CREDENTIALS_FILE = CONFIG_DIR + "/credentials.json";

interface Credentials {
  accounts: Array<{
    username: string;
    password: string;
    isLastUsed: boolean;
  }>;
}

// Function to load saved credentials
async function loadCredentials(): Promise<Credentials> {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading credentials:", error);
  }
  return { accounts: [] };
}

// Main function to scrape job details page
async function scrapeJobDetailsPage(): Promise<void> {
  let browser: Browser | null = null;

  try {
    // Load credentials
    const credentials = await loadCredentials();
    const lastUsedAccount =
      credentials.accounts.find((a) => a.isLastUsed) || credentials.accounts[0];

    if (!lastUsedAccount) {
      throw new Error(
        "No saved credentials found. Please run the main scraper first."
      );
    }

    console.log(`Using account: ${lastUsedAccount.username}`);

    // Launch browser
    browser = await chromium.launch({
      headless: false,
      slowMo: 500,
    });

    const context = await browser.newContext({
      storageState: fs.existsSync(CONFIG_DIR + "/storage.json")
        ? CONFIG_DIR + "/storage.json"
        : undefined,
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();
    page.setDefaultTimeout(60000);

    // Login if needed
    console.log("Navigating to login page...");
    await page.goto("https://intranet.decopress.com/", {
      waitUntil: "networkidle",
    });

    const loginFormExists = await page.locator("#txt_Username").isVisible();

    if (loginFormExists) {
      console.log("Logging in...");
      await page.fill("#txt_Username", lastUsedAccount.username);
      await page.fill("#txt_Password", lastUsedAccount.password);

      // Click login button
      await page.click('input[type="button"], input[type="submit"]');
      await page.waitForLoadState("networkidle");
    }

    // Navigate to specific job details page
    console.log("Navigating to job details page...");
    await page.goto("https://intranet.decopress.com/Jobs/job.aspx?ID=50734", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log("✅ Job details page loaded successfully");

    // Get page title
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);

    // Extract visible text content
    const allText = await page.locator("body").textContent();
    console.log(`📝 Page text length: ${allText?.length || 0} characters`);

    // Take screenshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await page.screenshot({
      path: `job-details-screenshot-${timestamp}.png`,
      fullPage: true,
    });
    console.log(`📸 Screenshot saved: job-details-screenshot-${timestamp}.png`);

    // Save HTML source
    const html = await page.content();
    fs.writeFileSync(`job-details-html-${timestamp}.html`, html);
    console.log(`🌐 HTML source saved: job-details-html-${timestamp}.html`);

    // Extract specific elements using Playwright locators
    console.log("🔍 Extracting specific elements...");

    // Try to find job-related information
    const h1Text = await page
      .locator("h1")
      .first()
      .textContent()
      .catch(() => "");
    console.log(`📋 H1 text: "${h1Text}"`);

    // Extract all table data
    const tables = await page.locator("table").all();
    console.log(`📊 Found ${tables.length} tables`);

    const tableData = [];
    for (let i = 0; i < Math.min(tables.length, 3); i++) {
      const table = tables[i];
      const headers = await table.locator("th").allTextContents();
      const rows = await table.locator("tr").count();
      const className = (await table.getAttribute("class")) || "";

      tableData.push({
        index: i,
        className,
        headers,
        rowCount: rows,
      });

      console.log(
        `   Table ${i + 1}: ${
          headers.length
        } headers, ${rows} rows, class: "${className}"`
      );
    }

    // Extract image containers
    const imageContainers = await page
      .locator(".js-jobline-asset-image-container")
      .all();
    console.log(`🖼️  Found ${imageContainers.length} image containers`);

    const imageData = [];
    for (const container of imageContainers) {
      const assetTag = await container.getAttribute("data-asset-tag");
      const images = await container.locator("img").count();
      const links = await container.locator("a").count();

      imageData.push({
        assetTag,
        hasImages: images > 0,
        imageCount: images,
        linkCount: links,
      });

      console.log(`   Asset: ${assetTag}, Images: ${images}, Links: ${links}`);
    }

    // Try to extract contact information
    const emailMatches =
      allText?.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) ||
      [];
    const phoneMatches = allText?.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];

    console.log(`📧 Found ${emailMatches.length} email addresses`);
    console.log(`📞 Found ${phoneMatches.length} phone numbers`);

    // Save comprehensive reference data
    const referenceData = {
      timestamp,
      pageInfo: {
        title: pageTitle,
        url: "https://intranet.decopress.com/Jobs/job.aspx?ID=50734",
        textLength: allText?.length || 0,
      },
      elements: {
        h1Text,
        tables: tableData,
        images: imageData,
        contacts: {
          emails: emailMatches,
          phones: phoneMatches,
        },
      },
      sampleText: allText?.substring(0, 2000) || "",
    };

    fs.writeFileSync(
      `job-details-reference-${timestamp}.json`,
      JSON.stringify(referenceData, null, 2)
    );
    console.log(
      `📊 Reference data saved: job-details-reference-${timestamp}.json`
    );

    // Create comprehensive markdown reference
    const markdownContent = `# Job Details Page Reference

**Generated:** ${new Date().toISOString()}
**Page URL:** https://intranet.decopress.com/Jobs/job.aspx?ID=50734
**Job ID:** 50734

## Page Overview

- **Title:** ${pageTitle}
- **Main Heading:** ${h1Text || "Not found"}
- **Content Length:** ${allText?.length || 0} characters

## Contact Information Found

### Email Addresses (${emailMatches.length})
${emailMatches.map((email) => `- ${email}`).join("\n")}

### Phone Numbers (${phoneMatches.length})
${phoneMatches.map((phone) => `- ${phone}`).join("\n")}

## Page Structure

### Tables (${tableData.length} found)
${tableData
  .map(
    (table) => `
#### Table ${table.index + 1}
- **Class:** \`${table.className}\`
- **Headers:** ${table.headers.join(", ")}
- **Rows:** ${table.rowCount}
`
  )
  .join("")}

### Image Containers (${imageData.length} found)
${imageData
  .map(
    (img) => `
- **Asset Tag:** ${img.assetTag}
- **Has Images:** ${img.hasImages ? "✅" : "❌"} (${img.imageCount} images)
- **Links:** ${img.linkCount}
`
  )
  .join("")}

## Current vs Required Data

### Currently Available in Our Scraper ✅
- Job Number: ✅ (from list scraping)
- Customer Name: ✅ (from list scraping)  
- Order Number: ✅ (from list scraping)
- Ship Date: ✅ (from list scraping)
- Images: ✅ (via .js-jobline-asset-image-container)
- Process Tags: ✅ (from list scraping)

### Still Needed for Order Details Interface ❌

#### Left Column (Order Metadata)
- [ ] **Job Status/Pipeline Location** - Current status indicator
- [ ] **Customer Contact Details** - Email, phone, address
- [ ] **Order Items Details** - Quantity, cost, comments per item
- [ ] **Due Date** - When job needs to be completed
- [ ] **Files/Attachments** - Uploaded files, mockups, proofs

#### Right Column (Communication Thread)  
- [ ] **Internal Comments** - Team communication
- [ ] **Threaded Messages** - Conversation history
- [ ] **File Attachments** - Images, docs in messages
- [ ] **Mentions** - @teammate functionality
- [ ] **Timestamps** - When comments were made
- [ ] **Pinned Comments** - Important messages

## Implementation Strategy

### Phase 1: Enhance Data Extraction
1. **Extract customer details** from job details page
2. **Parse order line items** from table data
3. **Find status indicators** in page content
4. **Locate file/attachment sections**

### Phase 2: Build UI Components
1. **OrderDetails component** - Left column layout
2. **CommunicationThread component** - Right column
3. **Comment component** - Individual message display
4. **FileAttachment component** - File display/download

### Phase 3: Add Communication Features
1. **Comment system** - Add new comments
2. **File upload** - Attach files to comments  
3. **Mentions** - @teammate notifications
4. **Real-time updates** - Live comment updates

## Sample Page Content (First 1000 chars)

\`\`\`
${allText?.substring(0, 1000) || "No content extracted"}...
\`\`\`

## Files Generated
- Screenshot: job-details-screenshot-${timestamp}.png
- HTML Source: job-details-html-${timestamp}.html  
- Reference Data: job-details-reference-${timestamp}.json
`;

    fs.writeFileSync(`JOB_DETAILS_REFERENCE.md`, markdownContent);
    console.log(`📝 Markdown reference saved: JOB_DETAILS_REFERENCE.md`);

    console.log("\n🎉 Job details reference extraction complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Review the generated files");
    console.log("2. Identify additional data extraction needs");
    console.log("3. Update the main scraper to capture missing fields");
    console.log("4. Design and build the order details UI components");
  } catch (error) {
    console.error("❌ Error scraping job details:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the scraper
scrapeJobDetailsPage();
