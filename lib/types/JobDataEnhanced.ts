/**
 * Enhanced JobData Interface for Order Details
 *
 * This extends the current JobData interface from scrape.ts to support
 * the comprehensive order details interface with customer contact details,
 * order line items, file attachments, and communication foundation.
 */

// Base types from current scrape.ts
interface BaseJobData {
  jobNumber: string;
  customer: {
    name: string;
  };
  order: {
    order_number: string;
    title: string;
    status: string;
    created_at?: string;
    ship_date: string | null;
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
}

// Enhanced customer contact information
export interface CustomerContact {
  name: string; // Company/organization name
  contact_name?: string; // Individual contact person name
  emails: string[];
  phones: string[];
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  contact_preferences?: {
    preferred_method: "email" | "phone" | "text";
    notes?: string;
  };
}

// Enhanced order line item information
export interface OrderLineItem {
  id?: number;
  asset_tag: string;
  asset_sku: string;
  description: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  garment_type?: string;
  comments?: string;
  status: "pending" | "in_progress" | "completed" | "on_hold";
  image_url?: string;
  specifications?: {
    size?: string;
    color?: string;
    material?: string;
    placement?: string;
  };
}

// File attachment information beyond images
export interface JobFile {
  id?: number;
  filename: string;
  file_type: string;
  file_url: string;
  file_size?: number;
  thumbnail_url?: string;
  uploaded_at: string;
  uploaded_by?: string;
  description?: string;
  category: "design" | "proof" | "reference" | "shipping" | "other";
  version?: number;
  is_active: boolean;
}

// Process/tag information with enhanced details
export interface ProcessTag {
  id?: number;
  code: string;
  name: string;
  quantity: number;
  color: string;
  priority?: number;
  estimated_time?: number; // in minutes
  status: "pending" | "in_progress" | "completed";
  assigned_to?: string;
  notes?: string;
}

// Job timeline and history tracking
export interface JobTimelineEntry {
  id?: number;
  event_type:
    | "created"
    | "status_change"
    | "assignment"
    | "comment"
    | "file_upload"
    | "tag_update";
  description: string;
  timestamp: string;
  user_id?: number;
  user_name?: string;
  metadata?: Record<string, any>;
}

// Enhanced order information
export interface EnhancedOrder {
  order_number: string;
  title: string;
  description?: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  created_at?: string;
  ship_date: string | null;
  due_date?: string | null;
  estimated_completion?: string | null;

  // Enhanced data
  line_items: OrderLineItem[];
  total_value?: number;
  currency?: string;

  // Existing image data
  images: Array<{
    asset_tag: string;
    thumbnail_url: string;
    high_res_url: string;
    thumbnail_base_path: string;
    high_res_base_path: string;
  }>;

  // File attachments
  files: JobFile[];

  // Shipping information
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

// Main enhanced JobData interface
export interface JobDataEnhanced
  extends Omit<BaseJobData, "customer" | "order" | "tags"> {
  jobNumber: string;

  // Enhanced customer information
  customer: CustomerContact;

  // Enhanced order information
  order: EnhancedOrder;

  // Enhanced process tags
  tags: ProcessTag[];

  // Job timeline and history (includes existing jobDescriptions)
  timeline: JobTimelineEntry[];

  // Legacy job descriptions (for backward compatibility)
  jobDescriptions: Array<{
    text: string;
    timestamp: string;
    author?: string;
  }>;

  // Metadata and tracking
  metadata?: {
    last_updated: string;
    last_updated_by?: string;
    version: number;
    data_source: "scraper" | "manual" | "import";
    scraper_version?: string;
  };
}

// Type for partial updates (when not all data is available)
export type PartialJobDataEnhanced = Partial<JobDataEnhanced> & {
  jobNumber: string; // Always required
};

// Type for creating new enhanced job data from base data
export type JobDataTransition = BaseJobData & {
  // Optional enhanced fields that can be populated later
  customer_emails?: string[];
  customer_phones?: string[];
  customer_address?: CustomerContact["address"];
  line_items?: OrderLineItem[];
  files?: JobFile[];
  timeline?: JobTimelineEntry[];
};

// Export the base type for backward compatibility
export type { BaseJobData };

// Utility type for API responses
export interface JobDataResponse {
  success: boolean;
  data?: JobDataEnhanced;
  error?: string;
  metadata?: {
    source: string;
    timestamp: string;
    version: string;
  };
}

// Constants for validation and UI
export const JOB_STATUS_OPTIONS = [
  "pending",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
  "shipped",
] as const;

export const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const;

export const FILE_CATEGORIES = [
  "design",
  "proof",
  "reference",
  "shipping",
  "other",
] as const;

export const CONTACT_METHODS = ["email", "phone", "text"] as const;

export type JobStatus = (typeof JOB_STATUS_OPTIONS)[number];
export type Priority = (typeof PRIORITY_OPTIONS)[number];
export type FileCategory = (typeof FILE_CATEGORIES)[number];
export type ContactMethod = (typeof CONTACT_METHODS)[number];
