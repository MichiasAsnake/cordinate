# Jobs List Structure Reference for DecoPress JobStatusList Page

## Overview

This document provides the definitive reference for how the jobs list page is structured on DecoPress, based on analysis on 2025-06-01. This analysis reveals critical issues with the current scraper implementation.

## Key Findings

### 🚨 **Critical Issues Discovered**

1. **✅ RESOLVED - All Filter Required**: The scraper now successfully finds and clicks the "All" filter using selector `a:has-text("All")` - this was the root cause of only seeing 3 jobs instead of ~81
2. **Browser Crashes**: `Target page, context or browser has been closed` errors indicate memory or timeout issues
3. **✅ RESOLVED - getCellAttribute Bug**: `ReferenceError: attribute is not defined` - closure scope issue has been fixed

### 📊 **Table Structure**

#### **Table Container**: `#jobStatusListResults`

**Headers** (9 columns):

1. Job Number (`sortable`)
2. Customer (`sortable`)
3. Description (`sortable`)
4. Job Status (`sortable`)
5. Order# (`sortable`)
6. Date In (`text-center sortable`)
7. Ship Date (`text-center sortable`)
8. Days (`text-right sortable sorted asc`)
9. (empty column) (`text-center`)

#### **Job Rows**: `tr.js-jobstatus-row`

**Row Attributes**:

- `id`: `jobStatusListRow_{jobNumber}`
- `class`: `js-jobstatus-row`
- `data-jobnumber`: `{jobNumber}` (e.g., "50751")

### 🔍 **Cell-by-Cell Analysis**

#### **Cell 1 - Job Number**

```html
<td>
  <a
    href="https://intranet.decopress.com/Jobs/job.aspx?ID=50751"
    target="_blank"
    >50751</a
  >
</td>
```

- **Job Link Selector**: `a[href*="job.aspx?ID="]`
- **Job Number**: Available in `data-jobnumber` attribute on row

#### **Cell 2 - Customer**

```html
<td>
  Colosseum USA
  <div
    class="jobtag-container js-jobtag-container tag-container js-tag-container"
    data-id="50751"
    data-tag-type="JOB"
  >
    <ul>
      <li>
        <span
          class="jobtag tag showtag mine"
          data-tag="@laser"
          data-when-entered-utc="..."
          data-tooltip="..."
        >
          <span class="tag-text">@laser</span>
        </span>
      </li>
    </ul>
  </div>
</td>
```

- **Customer Name**: Text nodes NOT inside `.jobtag-container`
- **Job Tags**: `.jobtag-container .tag-text` elements
- **Tag Metadata**: `data-when-entered-utc`, `data-tooltip` on parent span

#### **Cell 3 - Description**

```html
<td>
  NLL - BFBDT
  <div class="ew-badge-container process-codes">
    <div
      class="ew-badge static"
      style=""
      data-code="EM"
      data-jobnumber="50751"
      data-id="50751_badge_EM"
    >
      EM<span class="process-qty">216</span>
    </div>
    <div
      class="ew-badge static"
      style=""
      data-code="HW"
      data-jobnumber="50751"
      data-id="50751_badge_HW"
    >
      HW<span class="process-qty">216</span>
    </div>
  </div>
</td>
```

- **Description**: Text nodes NOT inside `.ew-badge-container`
- **Process Codes**: `.ew-badge.static` elements
- **Code Data**: `data-code` attribute (e.g., "EM", "HW")
- **Quantities**: `.process-qty` text content

#### **Cell 4 - Job Status**

```html
<td class="js-jobstatus-container">
  <div class="cw--job-list-job-status-line">
    <span class="cw--master-status-pill jobstatus_5">Approved</span> -
    <span class="cw--stock-status-pill stockstatus_2">Stock Complete</span>
  </div>
</td>
```

- **Status Selector**: `.cw--master-status-pill`
- **Stock Status**: `.cw--stock-status-pill`

#### **Cell 5 - Order Number**

```html
<td>Sampler Stores (PO#NLL CHAMP)</td>
```

- **Simple Text Content**: Use `.textContent.trim()`

#### **Cell 6 - Date In**

```html
<td class="text-center">
  <span
    data-tz-utc="2025-05-27T08:25:09-07:00"
    data-tz-format="L"
    class="js-tz-aware"
    title="America/Los_Angeles -07:00"
  >
    05/27/2025
  </span>
</td>
```

- **Date Selector**: `td:nth-child(6) .js-tz-aware`
- **UTC Data**: `data-tz-utc` attribute
- **Display Text**: `.textContent` (formatted date)

#### **Cell 7 - Ship Date**

```html
<td class="text-center">
  <span class=" warning ">
    <span
      data-tz-utc="2025-06-02T15:00:00-07:00"
      data-tz-format="L"
      class="js-tz-aware"
      title="America/Los_Angeles -07:00"
    >
      06/02/2025
    </span>
  </span>
  <div class="ship-method">GND</div>
  <div class="ship-priority">MUST</div>
</td>
```

- **Date Selector**: `td:nth-child(7) .js-tz-aware`
- **UTC Data**: `data-tz-utc` attribute
- **Extra Text**: Ship method and priority info

### 📄 **Pagination Analysis**

**🚨 CRITICAL FINDING**: **NO PAGINATION DETECTED**

```json
"pagination": {
  "exists": false
}
```

**Implications**:

- Current scraper sees only **3 jobs** instead of expected ~81 jobs
- Pagination selectors `.pagination li.page-item[data-lp]` return **0 results**
- The scraper is NOT accessing the full job dataset

**Possible Causes**:

1. **Login State**: May not be fully logged in
2. **URL Issue**: Wrong URL or missing parameters
3. **JavaScript Loading**: Pagination loads via AJAX after initial page load
4. **Filtering**: Some filter is applied limiting results

### ⚠️ **Error-Prone Selectors Analysis**

#### **Working Selectors** ✅

- `#jobStatusListResults tr.js-jobstatus-row` → **3 found**
- `td:nth-child(6) .js-tz-aware` → **3 found** (Date In)
- `td:nth-child(7) .js-tz-aware` → **3 found** (Ship Date)
- `.jobtag-container .tag-text` → **3 found**
- `.ew-badge.static` → **4 found**

#### **Missing Selectors** ❌

- `.pagination li.page-item[data-lp]` → **0 found**
- `.pagination li.page-item.active[data-lp]` → **0 found**
- `.loading-indicator` → **0 found**

#### **getAttribute Testing Results**

- `data-jobnumber` on job rows: ✅ **Works** (e.g., "50751")
- `data-tz-utc` on date elements: ✅ **Works** (e.g., "2025-05-27T08:25:09-07:00")
- `data-code` on badges: ✅ **Works** (e.g., "EM")

### 🐛 **Code Issues Found**

#### **1. getCellAttribute Closure Bug**

**Current Broken Code**:

```javascript
const getCellAttribute = async (
  selector: string,
  attribute: string
): Promise<string> => {
  try {
    return await row.$eval(
      selector,
      (el: Element) => el.getAttribute(attribute) || "" // ❌ attribute not in scope
    );
  } catch (error) {
    console.warn(
      `Failed to get cell attribute ${attribute} for ${selector}:`,
      error
    );
    return "";
  }
};
```

**Fixed Code**:

```javascript
const getCellAttribute = async (
  selector: string,
  attribute: string
): Promise<string> => {
  try {
    return await row.$eval(
      selector,
      (el: Element, attr: string) => el.getAttribute(attr) || "",
      attribute // ✅ Pass attribute as parameter
    );
  } catch (error) {
    console.warn(
      `Failed to get cell attribute ${attribute} for ${selector}:`,
      error
    );
    return "";
  }
};
```

### 🔧 **Recommended Fixes**

#### **1. Fix getAttribute Function**

Pass the `attribute` parameter correctly to the browser context.

#### **2. Investigate Pagination Issue**

- Check if logged in properly
- Try different URL variations
- Wait for AJAX loading to complete
- Check for JavaScript errors in browser console

#### **3. Add Browser Stability**

- Increase timeouts
- Add better error handling
- Implement browser restart logic
- Add memory management

#### **4. Improve Date Extraction**

Current analysis shows dates work correctly:

```json
"data-tz-utc_test": {
  "value": "2025-05-27T08:25:09-07:00",
  "success": true
}
```

### 📋 **Correct Extraction Patterns**

#### **Job Row Processing**:

```javascript
const jobRows = await page.$$("#jobStatusListResults tr.js-jobstatus-row");
for (const row of jobRows) {
  const jobNumber = await row.getAttribute("data-jobnumber");
  // ... process row
}
```

#### **Date Extraction**:

```javascript
const dateInUtc = await row.$eval(
  "td:nth-child(6) .js-tz-aware",
  (el: Element, attr: string) => el.getAttribute(attr) || "",
  "data-tz-utc"
);
```

#### **Process Codes**:

```javascript
const badges = await row.$$(".ew-badge.static");
for (const badge of badges) {
  const code = await badge.getAttribute("data-code");
  const qty = await badge.$eval(
    ".process-qty",
    (el) => el.textContent?.trim() || "0"
  );
}
```

### 🎯 **Priority Actions**

1. **🔥 HIGH**: Fix `getCellAttribute` function - immediate crash fix
2. **🔥 HIGH**: Investigate pagination issue - only 3 vs 81 jobs
3. **🟡 MEDIUM**: Add browser stability improvements
4. **🟢 LOW**: Optimize selectors based on analysis

### 🔧 **All Filter Solution**

**✅ IMPLEMENTED**: The scraper now automatically:

1. **Finds the "All" filter** using multiple selector strategies
2. **Clicks the filter** to show all jobs
3. **Waits for page update** with extended timeout for AJAX
4. **Verifies job count increase** (should go from 3 to ~81 jobs)
5. **Confirms pagination availability** after filter application

**Successful Selector**: `a:has-text("All")` - This consistently finds and clicks the All filter

**Code Pattern**:

```javascript
// Look for common filter selectors that might contain an "All" option
const filterSelectors = [
  '.filter-container .filter-option[data-filter="all"]',
  ".process-filter .filter-all",
  ".filters .all-filter",
  'button:has-text("All")',
  'a:has-text("All")', // ✅ This one works!
  ".filter-buttons .all",
  '[data-filter-value="all"]',
  ".process-filters .all",
];
```

---

**Generated**: 2025-06-01  
**Source**: Jobs List Analysis  
**Files**: `jobs-list-analysis-1748821848981.json`, `jobs-list-reference-1748821848981.html`
