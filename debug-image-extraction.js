import { chromium } from "playwright";
import fs from "fs";

async function debugImageExtraction() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: ".config/storage.json", // Use existing auth
  });
  const page = await context.newPage();

  try {
    // Navigate to a specific job detail page
    console.log("🔗 Navigating to job detail page...");
    await page.goto("https://intranet.decopress.com/Jobs/job.aspx?ID=50682", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log("📄 Page loaded, checking for image containers...");

    // Debug: Check what containers exist on the page
    const containers = await page.evaluate(() => {
      const containers = [
        ".job-joblines-container",
        ".js-jobline-asset-image-container",
        ".joblines",
        ".job-container",
        ".asset-container",
        "[data-asset-tag]",
      ];

      const results = {};
      containers.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        results[selector] = {
          count: elements.length,
          exists: elements.length > 0,
          content:
            elements.length > 0
              ? elements[0].innerHTML.substring(0, 200) + "..."
              : null,
        };
      });

      // Also check if there are any image-related elements
      const allImages = document.querySelectorAll("img[src]");
      const allLinks = document.querySelectorAll('a[href*="asset"]');

      results["debug_info"] = {
        total_images: allImages.length,
        asset_links: allLinks.length,
        page_title: document.title,
        body_classes: document.body.className,
      };

      return results;
    });

    console.log("🔍 Container analysis:", JSON.stringify(containers, null, 2));

    // Save the page for manual inspection
    await page.screenshot({ path: "debug-job-detail.png", fullPage: true });
    const html = await page.content();
    fs.writeFileSync("debug-job-detail.html", html);
    console.log("💾 Saved debug-job-detail.png and debug-job-detail.html");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await browser.close();
  }
}

debugImageExtraction();
