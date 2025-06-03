# Order Details Interface Implementation Plan

**Based on Job Details Page Analysis**
**Generated:** 2025-06-03
**Reference Job:** 50734 (https://intranet.decopress.com/Jobs/job.aspx?ID=50734)

## 🎯 Project Overview

Creating a modern, two-column order details interface that serves as the **command center** for each job, combining structured order metadata with threaded internal communication.

### 🧱 Target Layout

- **Left Column (40-45%):** Order metadata and details
- **Right Column (55-60%):** Communication thread and collaboration tools

---

## 📊 Current Data Availability Analysis

### ✅ **Already Captured by Our Scraper**

From the main job list scraping (`scrape.ts`):

| Data Field       | Status | Source                                           | Notes                             |
| ---------------- | ------ | ------------------------------------------------ | --------------------------------- |
| Job Number       | ✅     | List row `data-jobnumber`                        | Primary identifier                |
| Customer Name    | ✅     | List row customer cell                           | Extracted and cleaned             |
| Order Number     | ✅     | List row order cell                              | Available                         |
| Ship Date        | ✅     | List row date cell                               | Formatted as ISO date             |
| Job Status       | ✅     | List row status pill                             | Current status                    |
| Process Tags     | ✅     | List row `.ew-badge.static`                      | Process codes + quantities        |
| Job Descriptions | ✅     | List row `.jobtag-container`                     | Internal comments with timestamps |
| Images           | ✅     | Details page `.js-jobline-asset-image-container` | Asset tags + URLs                 |

### 📋 **Available on Details Page (Needs Extraction)**

From job details page analysis:

| Data Field       | Found | Location                            | Implementation Needed      |
| ---------------- | ----- | ----------------------------------- | -------------------------- |
| Customer Email   | ✅    | Page text: `derek@dudsbydudes.com`  | Parse from page content    |
| Customer Phone   | ✅    | Page text: `866.963.8337`           | Parse from page content    |
| Order Line Items | ✅    | Table: `job-joblines-list` (6 rows) | Parse table data           |
| Asset Details    | ✅    | Image containers: 4 assets found    | Already partially captured |
| Job Timeline     | ⚠️    | May be in page content              | Needs investigation        |
| File Attachments | ⚠️    | Need to identify section            | Needs investigation        |

### ❌ **Missing/Needs Development**

Communication features that don't exist yet:

| Feature                  | Status | Implementation Required |
| ------------------------ | ------ | ----------------------- |
| Internal Comments System | ❌     | New feature development |
| Threaded Conversations   | ❌     | New feature development |
| @Mentions                | ❌     | New feature development |
| File Upload to Comments  | ❌     | New feature development |
| Comment Pinning          | ❌     | New feature development |
| Real-time Updates        | ❌     | New feature development |

---

## 🏗️ Implementation Phases

### **Phase 1: Enhanced Data Extraction** (Week 1-2)

#### 1.1 Extend JobData Interface

Update the `JobData` interface in `scrape.ts`:

```typescript
interface JobDataEnhanced {
  jobNumber: string;
  customer: {
    name: string;
    email: string[];
    phone: string[];
    address?: string;
  };
  order: {
    order_number: string;
    title: string;
    status: string;
    created_at?: string;
    ship_date: string | null;
    due_date?: string;
    line_items: Array<{
      asset_tag: string;
      description: string;
      quantity: number;
      cost?: number;
      comments?: string;
    }>;
    images: Array<{
      asset_tag: string;
      thumbnail_url: string;
      high_res_url: string;
      thumbnail_base_path: string;
      high_res_base_path: string;
    }>;
  };
  tags: Array<{
    code: string;
    quantity: number;
  }>;
  jobDescriptions: Array<{
    text: string;
    timestamp: string;
    author?: string;
  }>;
  files?: Array<{
    name: string;
    url: string;
    type: string;
    uploaded_at: string;
  }>;
}
```

#### 1.2 Enhanced Details Page Extraction

Create `extractDetailedJobData()` function to supplement existing extraction:

```typescript
async function extractDetailedJobData(
  page: Page,
  basicJobData: JobData
): Promise<JobDataEnhanced> {
  // Extract customer contact details
  const pageText = await page.locator("body").textContent();
  const emails =
    pageText?.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) ||
    [];
  const phones = pageText?.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [];

  // Extract order line items from job-joblines-list table
  const lineItems = await extractLineItems(page);

  // Extract additional files/attachments
  const attachments = await extractAttachments(page);

  return {
    ...basicJobData,
    customer: {
      ...basicJobData.customer,
      email: [...new Set(emails)], // Remove duplicates
      phone: [...new Set(phones)],
    },
    order: {
      ...basicJobData.order,
      line_items: lineItems,
    },
    files: attachments,
  };
}
```

#### 1.3 Database Schema Updates

Extend database schema to support new fields:

```sql
-- Add customer contact fields
ALTER TABLE orders ADD COLUMN customer_email TEXT[];
ALTER TABLE orders ADD COLUMN customer_phone TEXT[];

-- Create order_line_items table
CREATE TABLE order_line_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  asset_tag TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  cost DECIMAL(10,2),
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create job_files table
CREATE TABLE job_files (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  filename TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### **Phase 2: UI Components Development** (Week 3-4)

#### 2.1 Left Column Components

**OrderDetailsCard Component:**

```tsx
interface OrderDetailsCardProps {
  job: JobDataEnhanced;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ job }) => {
  return (
    <div className="space-y-6">
      {/* Job Header */}
      <JobHeader
        jobNumber={job.jobNumber}
        title={job.order.title}
        status={job.order.status}
      />

      {/* Process Tags */}
      <ProcessTags tags={job.tags} />

      {/* Customer Info */}
      <CustomerInfo customer={job.customer} />

      {/* Order Items */}
      <OrderItems items={job.order.line_items} />

      {/* Files Section */}
      <FilesSection files={job.files} images={job.order.images} />
    </div>
  );
};
```

**Subcomponents:**

- `JobHeader` - Job number, title, status badge, due date
- `ProcessTags` - Visual tags for processes (Embroidery, Patches, etc.)
- `CustomerInfo` - Name, email, phone, address in card format
- `OrderItems` - Table of line items with quantities and costs
- `FilesSection` - Grid of images and file attachments

#### 2.2 Right Column Components

**CommunicationThread Component:**

```tsx
interface CommunicationThreadProps {
  jobNumber: string;
  comments: Comment[];
  onAddComment: (comment: string, files?: File[]) => void;
}

const CommunicationThread: React.FC<CommunicationThreadProps> = ({
  jobNumber,
  comments,
  onAddComment,
}) => {
  return (
    <div className="flex flex-col h-full">
      <ThreadHeader title="Job Thread" jobNumber={jobNumber} />
      <CommentsList comments={comments} />
      <CommentComposer onSubmit={onAddComment} />
    </div>
  );
};
```

**Subcomponents:**

- `ThreadHeader` - Title with job context
- `CommentsList` - Scrollable list of comments
- `Comment` - Individual comment with timestamp, author, content
- `CommentComposer` - Input area with file upload and mentions
- `FileAttachment` - Display attached files in comments

### **Phase 3: Communication System Backend** (Week 5-6)

#### 3.1 Database Schema for Comments

```sql
CREATE TABLE job_comments (
  id SERIAL PRIMARY KEY,
  job_number TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  parent_comment_id INTEGER REFERENCES job_comments(id), -- For threading
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comment_files (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES job_comments(id),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comment_mentions (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES job_comments(id),
  mentioned_user TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.2 API Endpoints

```typescript
// /api/jobs/[jobNumber]/comments
GET    - Fetch all comments for a job
POST   - Add new comment
PUT    - Update comment (edit)
DELETE - Delete comment

// /api/jobs/[jobNumber]/comments/[commentId]/pin
POST   - Pin/unpin comment

// /api/jobs/[jobNumber]/files
POST   - Upload file to job (independent of comments)
```

#### 3.3 Real-time Updates

Implement WebSocket or Server-Sent Events for live comment updates:

```typescript
// useJobComments hook
const useJobComments = (jobNumber: string) => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/jobs/${jobNumber}/comments/stream`
    );

    eventSource.onmessage = (event) => {
      const newComment = JSON.parse(event.data);
      setComments((prev) => [...prev, newComment]);
    };

    return () => eventSource.close();
  }, [jobNumber]);

  return { comments, addComment, updateComment };
};
```

### **Phase 4: Advanced Features** (Week 7-8)

#### 4.1 Mentions System

- @ autocomplete for team members
- Notification system for mentioned users
- Highlight mentioned users in comments

#### 4.2 File Management

- Drag & drop file upload
- Image preview and lightbox
- File versioning for document updates
- Integration with existing image system

#### 4.3 Search and Filtering

- Search within job comments
- Filter by author, date range
- Tag-based organization

---

## 🎨 Design Considerations

### Visual Hierarchy

- **Sticky Header:** Job number and status always visible
- **Card-based Layout:** Group related information visually
- **Color Coding:** Status badges, process tags, priority indicators
- **Icons:** Consistent iconography for actions and content types

### Responsive Design

- **Desktop First:** Optimized for 1280px+ screens
- **Mobile Adaptation:** Stack columns vertically on mobile
- **Tablet View:** Adjust column ratios for tablet screens

### User Experience

- **Loading States:** Skeleton loaders for async content
- **Error Handling:** Graceful fallbacks for missing data
- **Accessibility:** ARIA labels, keyboard navigation
- **Performance:** Virtualized comment lists for large threads

---

## 🧪 Testing Strategy

### Unit Tests

- Component rendering with mock data
- Data extraction functions
- API endpoint functionality

### Integration Tests

- Full job details page flow
- Comment creation and display
- File upload and attachment

### End-to-End Tests

- Complete user workflow: view job → add comment → upload file
- Cross-browser compatibility
- Performance under load

---

## 📈 Success Metrics

### User Adoption

- **Time spent on job details page** (increase expected)
- **Comment activity** (new feature metric)
- **File attachment usage** (new feature metric)

### Efficiency Gains

- **Reduced support tickets** (better internal communication)
- **Faster job completion** (better coordination)
- **Less email usage** (move communication into system)

### Technical Performance

- **Page load time** (<2 seconds for job details)
- **Comment posting speed** (<1 second)
- **File upload success rate** (>99%)

---

## 🚀 Next Immediate Steps

1. **Review generated reference files:**

   - `JOB_DETAILS_REFERENCE.md`
   - `job-details-reference-*.json`
   - `job-details-screenshot-*.png`

2. **Update main scraper** to extract additional fields identified

3. **Design UI mockups** based on the two-column layout requirements

4. **Set up development database** with extended schema

5. **Create component library** starting with the basic left column components

---

This implementation plan provides a clear roadmap from the current scraping capabilities to a fully-featured order details interface that will serve as the command center for job management and team collaboration.
