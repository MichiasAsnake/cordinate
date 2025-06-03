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

// Main function to scrape job details page structure
async function scrapeJobDetailsStructure(): Promise<void> {
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
      slowMo: 100,
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

    const loginFormExists = await page.evaluate(() => {
      return !!document.querySelector("#txt_Username");
    });

    if (loginFormExists) {
      console.log("Logging in...");
      await page.fill("#txt_Username", lastUsedAccount.username);
      await page.fill("#txt_Password", lastUsedAccount.password);

      // Click login button
      const loginButton = await page.$(
        'input[type="button"], input[type="submit"]'
      );
      if (loginButton) {
        await loginButton.click();
      }

      await page.waitForLoadState("networkidle");
    }

    // Navigate to specific job details page
    console.log("Navigating to job details page...");
    await page.goto("https://intranet.decopress.com/Jobs/job.aspx?ID=50734", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log("Extracting page structure...");

    // Extract basic job data first
    const jobData = await page.evaluate(() => {
      const getText = (selector: string): string => {
        const element = document.querySelector(selector);
        return element?.textContent?.trim() || "";
      };

      return {
        pageTitle: document.title,
        pageUrl: window.location.href,
        allVisibleText: document.body.innerText?.substring(0, 3000) || "",

        // Try to find job number in various places
        jobNumber:
          getText("h1") ||
          getText(".job-number") ||
          getText("[data-job-number]"),

        // Extract emails and phones from page text
        pageText: document.body.textContent || "",
      };
    });

    // Extract contact information using regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const emails = jobData.pageText.match(emailRegex) || [];
    const phones = jobData.pageText.match(phoneRegex) || [];

    // Extract image containers
    const imageContainers = await page.$$eval(
      ".js-jobline-asset-image-container",
      (containers) => {
        return containers.map((container) => ({
          assetTag: container.getAttribute("data-asset-tag"),
          hasImages: container.querySelectorAll("img").length,
          hasLinks: container.querySelectorAll("a").length,
          innerHTML: container.innerHTML?.substring(0, 300) + "...",
        }));
      }
    );

    // Extract all tables
    const tables = await page.$$eval("table", (tables) => {
      return tables.map((table, index) => ({
        index,
        className: table.className,
        headers: Array.from(table.querySelectorAll("th")).map(
          (th) => th.textContent?.trim() || ""
        ),
        sampleRows: Array.from(table.querySelectorAll("tr"))
          .slice(0, 3)
          .map((row) =>
            Array.from(row.querySelectorAll("td")).map(
              (cell) => cell.textContent?.trim() || ""
            )
          ),
      }));
    });

    // Extract form inputs
    const formInputs = await page.$$eval(
      "input, select, textarea",
      (inputs) => {
        return inputs.map((input) => ({
          type: input.getAttribute("type") || input.tagName.toLowerCase(),
          name: input.getAttribute("name") || "",
          id: input.getAttribute("id") || "",
          value: (input as HTMLInputElement).value || "",
          placeholder: input.getAttribute("placeholder") || "",
        }));
      }
    );

    // Save extracted data to reference files
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const extractedData = {
      ...jobData,
      contactInfo: { emails, phones },
      imageContainers,
      tables,
      formInputs,
      timestamp,
    };

    // Save comprehensive data
    fs.writeFileSync(
      `job-details-data-${timestamp}.json`,
      JSON.stringify(extractedData, null, 2)
    );

    // Save page screenshot
    await page.screenshot({
      path: `job-details-screenshot-${timestamp}.png`,
      fullPage: true,
    });

    // Save HTML source
    const html = await page.content();
    fs.writeFileSync(`job-details-html-${timestamp}.html`, html);

    console.log(`✅ Reference files created:`);
    console.log(`   📊 job-details-data-${timestamp}.json`);
    console.log(`   📸 job-details-screenshot-${timestamp}.png`);
    console.log(`   🌐 job-details-html-${timestamp}.html`);

    // Create a comprehensive reference markdown file
    const markdownContent = `# Job Details Page Reference

**Generated:** ${new Date().toISOString()}
**Page URL:** https://intranet.decopress.com/Jobs/job.aspx?ID=50734

## Page Overview

- **Title:** ${extractedData.pageTitle}
- **Text Length:** ${extractedData.allVisibleText.length} characters

## Data Found

### Contact Information
- **Emails:** ${emails.length} found
  ${emails.map((email) => `  - ${email}`).join("\n")}
- **Phone Numbers:** ${phones.length} found
  ${phones.map((phone) => `  - ${phone}`).join("\n")}

### Image Containers
- **Total containers:** ${imageContainers.length}
- **Containers with images:** ${
      imageContainers.filter((c) => c.hasImages > 0).length
    }

Asset tags found:
${imageContainers
  .map((c) => `- ${c.assetTag} (${c.hasImages} images, ${c.hasLinks} links)`)
  .join("\n")}

### Tables Found
- **Total tables:** ${tables.length}

${tables
  .map(
    (table) => `
#### Table ${table.index + 1}
- **Class:** ${table.className}
- **Headers:** ${table.headers.join(", ")}
- **Sample data:** ${table.sampleRows.length} rows
`
  )
  .join("")}

### Form Inputs
- **Total inputs:** ${formInputs.length}
- **Types:** ${[...new Set(formInputs.map((i) => i.type))].join(", ")}

Named inputs:
${formInputs
  .filter((i) => i.name)
  .map((i) => `- ${i.name} (${i.type})`)
  .join("\n")}

## Sample Page Text (First 1000 chars)

\`\`\`
${extractedData.allVisibleText.substring(0, 1000)}...
\`\`\`

## Next Steps for Order Details Interface

### Left Column Requirements (Order Metadata)
Based on the scraped data, we need to extract:
- [ ] Job Number & Job Name (from page title/headers)
- [ ] Status Tags (look for status indicators)
- [ ] Process Tags (from existing process extraction)
- [ ] Customer Info (name, email, phone, address)
- [ ] Order Info (order number, quantity, items, comments)
- [ ] Files Section (uploaded files, mockups)

### Right Column Requirements (Communication Thread)
- [ ] Internal Notes/Comments section
- [ ] Threaded Communication
- [ ] Mentions (@teammate)
- [ ] Timestamps
- [ ] File Attachments
- [ ] Pinned Comments

### Current Scraper Enhancements Needed
1. **Extract customer details** from the visible text
2. **Parse job status** from status indicators
3. **Extract order items** from tables
4. **Find communication threads** (if they exist)
5. **Parse additional metadata** from form fields

## Files Generated
- Data JSON: job-details-data-${timestamp}.json
- Screenshot: job-details-screenshot-${timestamp}.png
- HTML Source: job-details-html-${timestamp}.html
`;

    fs.writeFileSync(`JOB_DETAILS_REFERENCE.md`, markdownContent);
    console.log(`   📝 JOB_DETAILS_REFERENCE.md`);
  } catch (error) {
    console.error("Error scraping job details:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the scraper
scrapeJobDetailsStructure();
