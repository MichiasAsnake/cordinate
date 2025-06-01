import { chromium } from "playwright";
import fs from "fs";

async function analyzeImageStructure() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: ".config/storage.json", // Use existing auth
  });
  const page = await context.newPage();

  try {
    // Navigate to the specific job detail page
    console.log("🔗 Navigating to job 50772 details page...");
    await page.goto("https://intranet.decopress.com/Jobs/job.aspx?ID=50772", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log("📄 Page loaded, analyzing image structure...");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000); // Give extra time for any JS to load

    // Analyze the complete image structure
    const imageAnalysis = await page.evaluate(() => {
      const analysis = {
        allImageContainers: [],
        allImages: [],
        allLinks: [],
        joblineContainers: [],
        assetContainers: [],
        pageStructure: {},
      };

      // Find all potential image-related containers
      const containers = [
        ".js-jobline-asset-image-container",
        ".jobline-asset-image-container",
        "[data-asset-tag]",
        ".job-joblines-container",
        ".joblines-container",
        ".asset-container",
        ".image-container",
      ];

      containers.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          analysis.pageStructure[selector] = {
            count: elements.length,
            elements: Array.from(elements).map((el, index) => ({
              index,
              tagName: el.tagName,
              className: el.className,
              dataAttributes: Object.fromEntries(
                Array.from(el.attributes)
                  .filter((attr) => attr.name.startsWith("data-"))
                  .map((attr) => [attr.name, attr.value])
              ),
              innerHTML: el.innerHTML.substring(0, 500) + "...",
              hasImages: el.querySelectorAll("img").length,
              hasLinks: el.querySelectorAll("a").length,
            })),
          };
        }
      });

      // Find ALL images on the page
      const allImgs = document.querySelectorAll("img[src]");
      analysis.allImages = Array.from(allImgs).map((img, index) => ({
        index,
        src: img.src,
        alt: img.alt || "",
        className: img.className,
        parentElement: {
          tagName: img.parentElement?.tagName,
          className: img.parentElement?.className,
          dataAttributes: img.parentElement
            ? Object.fromEntries(
                Array.from(img.parentElement.attributes)
                  .filter((attr) => attr.name.startsWith("data-"))
                  .map((attr) => [attr.name, attr.value])
              )
            : {},
        },
        isThumbnail:
          img.src.includes("/thumbnails/") || img.src.includes("_50."),
        isBlob: img.src.includes("blob.core.windows.net"),
      }));

      // Find ALL links that might be image-related
      const allLinks = document.querySelectorAll("a[href]");
      analysis.allLinks = Array.from(allLinks)
        .filter(
          (link) =>
            link.href.includes("blob.core.windows.net") ||
            link.href.includes("/asset/") ||
            link.querySelector("img") ||
            link.closest("[data-asset-tag]")
        )
        .map((link, index) => ({
          index,
          href: link.href,
          text: link.textContent?.trim() || "",
          hasImage: !!link.querySelector("img"),
          parentAssetTag: link
            .closest("[data-asset-tag]")
            ?.getAttribute("data-asset-tag"),
          innerHTML: link.innerHTML.substring(0, 200) + "...",
        }));

      // Specific analysis of .js-jobline-asset-image-container
      const joblineContainers = document.querySelectorAll(
        ".js-jobline-asset-image-container"
      );
      analysis.joblineContainers = Array.from(joblineContainers).map(
        (container, index) => ({
          index,
          assetTag: container.getAttribute("data-asset-tag"),
          images: Array.from(container.querySelectorAll("img")).map((img) => ({
            src: img.src,
            isThumbnail:
              img.src.includes("/thumbnails/") || img.src.includes("_50."),
          })),
          links: Array.from(container.querySelectorAll("a[href]")).map(
            (link) => ({
              href: link.href,
              hasImage: !!link.querySelector("img"),
            })
          ),
          fullHTML: container.outerHTML,
        })
      );

      return analysis;
    });

    // Save the complete analysis
    const analysisFile = `image-structure-analysis-${Date.now()}.json`;
    fs.writeFileSync(analysisFile, JSON.stringify(imageAnalysis, null, 2));
    console.log(`💾 Saved complete image analysis to: ${analysisFile}`);

    // Save the full page HTML for reference
    const htmlFile = `job-50772-reference.html`;
    const html = await page.content();
    fs.writeFileSync(htmlFile, html);
    console.log(`💾 Saved full page HTML to: ${htmlFile}`);

    // Take a screenshot
    await page.screenshot({ path: "job-50772-screenshot.png", fullPage: true });
    console.log("💾 Saved screenshot: job-50772-screenshot.png");

    // Print summary to console
    console.log("\n📊 ANALYSIS SUMMARY:");
    console.log("===================");

    console.log(`\n🖼️ Total Images Found: ${imageAnalysis.allImages.length}`);
    imageAnalysis.allImages.forEach((img, i) => {
      console.log(
        `  ${i + 1}. ${
          img.isThumbnail ? "📷 THUMBNAIL" : "🖼️ IMAGE"
        }: ${img.src.substring(0, 80)}...`
      );
      console.log(
        `     Parent: ${img.parentElement.tagName}.${img.parentElement.className}`
      );
      if (img.parentElement.dataAttributes["data-asset-tag"]) {
        console.log(
          `     Asset Tag: ${img.parentElement.dataAttributes["data-asset-tag"]}`
        );
      }
    });

    console.log(
      `\n🔗 Image-Related Links Found: ${imageAnalysis.allLinks.length}`
    );
    imageAnalysis.allLinks.forEach((link, i) => {
      console.log(
        `  ${i + 1}. ${
          link.hasImage ? "🖼️ HAS IMG" : "🔗 LINK"
        }: ${link.href.substring(0, 80)}...`
      );
      if (link.parentAssetTag) {
        console.log(`     Asset Tag: ${link.parentAssetTag}`);
      }
    });

    console.log(
      `\n📦 .js-jobline-asset-image-container Found: ${imageAnalysis.joblineContainers.length}`
    );
    imageAnalysis.joblineContainers.forEach((container, i) => {
      console.log(`  ${i + 1}. Asset Tag: ${container.assetTag}`);
      console.log(
        `     Images: ${container.images.length} (${
          container.images.filter((img) => img.isThumbnail).length
        } thumbnails)`
      );
      console.log(`     Links: ${container.links.length}`);
    });

    // Now test clicking a thumbnail to see high-res behavior
    console.log("\n🖱️ TESTING THUMBNAIL CLICK BEHAVIOR:");
    console.log("====================================");

    if (imageAnalysis.joblineContainers.length > 0) {
      const firstContainer = imageAnalysis.joblineContainers[0];
      console.log(`Testing with asset tag: ${firstContainer.assetTag}`);

      try {
        // Find the first clickable image link
        const imageLink = await page.$(
          `[data-asset-tag="${firstContainer.assetTag}"] a[href]`
        );
        if (imageLink) {
          console.log("🖱️ Clicking thumbnail link...");
          await imageLink.click();
          await page.waitForTimeout(2000); // Wait for modal/overlay

          // Check what appeared after clicking
          const afterClick = await page.evaluate(() => {
            // Look for common modal/overlay patterns
            const modals = [
              ".fancybox-content img",
              ".fancybox-slide img",
              ".fancybox-image",
              "[data-fancybox] img",
              ".modal img",
              ".overlay img",
              ".lightbox img",
            ];

            const results = {};
            modals.forEach((selector) => {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                results[selector] = Array.from(elements).map((el) => ({
                  src: el.src,
                  visible: el.offsetWidth > 0 && el.offsetHeight > 0,
                }));
              }
            });
            return results;
          });

          console.log("🎯 High-res images found after click:", afterClick);

          // Close modal
          await page.keyboard.press("Escape");
          await page.waitForTimeout(1000);
          console.log("🔒 Closed modal");
        }
      } catch (error) {
        console.log("❌ Error testing click behavior:", error.message);
      }
    }

    console.log(
      "\n✅ Analysis complete! Check the generated files for detailed structure."
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await browser.close();
  }
}

analyzeImageStructure();
