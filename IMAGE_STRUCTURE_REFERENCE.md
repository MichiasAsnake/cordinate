# Image Structure Reference for DecoPress Job Detail Pages

## Overview

This document provides the definitive reference for how images are structured on DecoPress job detail pages, based on analysis of job 50772 on 2025-01-27.

## Key Findings

### 🏗️ **Container Structure**

**Primary Container**: `.js-jobline-asset-image-container`

- Each asset has its own container with `data-asset-tag` attribute
- **3 containers found on sample page**:
  1. `GSORT` - Empty (no images)
  2. `EM12989` - Contains 1 thumbnail and 1 high-res link
  3. `SETEM` - Empty (no images)

### 🖼️ **Image Structure**

#### **Thumbnail Images**

- **Location**: Inside `<img>` tags within `.js-jobline-asset-image-container`
- **Characteristics**:
  - Always contain `/thumbnails/` in URL or end with `_50.png`
  - Example: `https://decopressus.blob.core.windows.net/decopressus-private/assets/EM/12900/EM12989/thumbnails/504256/EM12989_50.png`
  - Class: `shadow-bounce`
  - Parent: `<a>` tag with high-res link

#### **High-Resolution Images**

- **Location**: In `href` attribute of `<a>` tags that wrap thumbnails
- **Characteristics**:
  - Full blob storage URLs without `/thumbnails/` or `_50.png`
  - Example: `https://decopressus.blob.core.windows.net/decopressus-private/assets/EM/12900/EM12989/EM12989.png`
  - Uses Fancybox gallery: `data-fancybox="gallery"`

### 📋 **Complete HTML Structure Example**

```html
<div class="js-jobline-asset-image-container" data-asset-tag="EM12989">
    <a href="https://decopressus.blob.core.windows.net/decopressus-private/assets/EM/12900/EM12989/EM12989.png?sv=..."
       data-fancybox="gallery"
       use-internal-previewer="true"
       class="d-inline-block"
       data-caption="<div class=\"asset-caption\"><h1>EM12989</h1><p>YATCH ROCK </p></div>">
        <img class="shadow-bounce"
             data-url="https://decopressus.blob.core.windows.net/decopressus-private/assets/EM/12900/EM12989/thumbnails/504256/EM12989_50.png?sv=..."
             src="https://decopressus.blob.core.windows.net/decopressus-private/assets/EM/12900/EM12989/thumbnails/504256/EM12989_50.png?sv=...">
    </a>
</div>
```

### 🔍 **Key Extraction Logic**

#### **Correct Approach**:

1. **Find containers**: `document.querySelectorAll('.js-jobline-asset-image-container')`
2. **Get asset tag**: `container.getAttribute('data-asset-tag')`
3. **Find thumbnail**: `container.querySelector('img[src]')`
4. **Find high-res link**: `container.querySelector('a[href]')`
5. **Extract URLs**:
   - Thumbnail: `img.src`
   - High-res: `a.href`

#### **Empty Containers**:

- Many containers exist but are empty (like `GSORT`, `SETEM`)
- These should be skipped gracefully
- Check: `container.querySelector('img')` returns null

### 🚫 **What NOT to Do**

1. **Don't click thumbnails unnecessarily** - The high-res URL is already available in the `href` attribute
2. **Don't use table row iteration** - Images are contained within `.js-jobline-asset-image-container`
3. **Don't limit to first 2 images** - Process all containers
4. **Don't look for modals on page load** - High-res URLs are directly accessible

### ✅ **Validated URLs**

#### **Thumbnail URL** (Always present when images exist):

```
https://decopressus.blob.core.windows.net/decopressus-private/assets/EM/12900/EM12989/thumbnails/504256/EM12989_50.png?sv=2021-10-04&spr=https&se=2025-06-02T06:56:29Z&sr=b&sp=r&sig=Rb7itfoeFl%2F%2B4NJEvu%2BfRY5eNfL68A37D7y4mfOQhCo%3D
```

#### **High-Res URL** (Always present when images exist):

```
https://decopressus.blob.core.windows.net/decopressus-private/assets/EM/12900/EM12989/EM12989.png?sv=2021-10-04&spr=https&se=2025-06-02T07:32:28Z&sr=b&sp=r&sig=i80rjsgXYczBQ%2BWu7asJ1c%2BXW2SCNOmN%2FqnFlB%2BcaBk%3D
```

### 🔧 **Implementation Guidelines**

#### **Correct extractImageData Function Logic**:

```javascript
async function extractImageData(page, jobNumber) {
  // 1. Find all image containers
  const containers = await page.$$(".js-jobline-asset-image-container");

  // 2. Process each container
  for (const container of containers) {
    const assetTag = await container.getAttribute("data-asset-tag");

    // 3. Check if container has images
    const img = await container.$("img[src]");
    const link = await container.$("a[href]");

    if (!img || !link) {
      continue; // Skip empty containers
    }

    // 4. Extract URLs directly
    const thumbnailUrl = await img.getAttribute("src");
    const highResUrl = await link.getAttribute("href");

    // 5. Validate and store
    if (thumbnailUrl && highResUrl) {
      // Process and store image data
    }
  }
}
```

### 📊 **Statistics from Sample Page**

- **Total containers**: 3
- **Containers with images**: 1 (33%)
- **Empty containers**: 2 (67%)
- **Images per populated container**: 1
- **Click behavior**: NOT required for URL extraction

### 🎯 **Critical Success Factors**

1. **Use `.js-jobline-asset-image-container` selector** - This is the primary container
2. **Extract URLs directly from DOM attributes** - No clicking needed
3. **Handle empty containers gracefully** - Many containers will be empty
4. **Process all containers** - Don't limit artificially
5. **Validate URLs properly** - Check for complete blob storage URLs

---

**Generated**: 2025-01-27  
**Source**: Job 50772 Analysis  
**Files**: `image-structure-analysis-1748821328308.json`, `job-50772-reference.html`
