import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { eq, and } from "drizzle-orm";
import { NeonQueryFunction } from "@neondatabase/serverless";
import { InferSelectModel } from "drizzle-orm";

// Define types for our data
type OrderStatus =
  | "approved"
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";
type TagCode =
  | "EM"
  | "HW"
  | "MISC"
  | "AP"
  | "PA"
  | "SW"
  | "CR"
  | "SC"
  | "DF"
  | "SEW"
  | "BAG";

interface ScrapedJob {
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
    images?: Array<{
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

// Validate environment variables
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  ORGANIZATION_NAME: process.env.ORGANIZATION_NAME,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL!) as NeonQueryFunction<
  boolean,
  boolean
>;
export const db = drizzle(sql, { schema });

// Status mapping for the initial organization
const STATUS_MAP: Record<string, OrderStatus> = {
  Approved: "approved",
  Pending: "pending",
  "In Progress": "in_progress",
  Completed: "completed",
  Cancelled: "cancelled",
};

// Tag mapping for the initial organization
const TAG_MAP: Record<string, string> = {
  EM: "Embroidery",
  HW: "Hardware",
  MISC: "Miscellaneous",
  AP: "Apparel",
  PA: "Patch Apply",
  SW: "Screen Print",
  CR: "Custom Run",
  SC: "Screen Print Color",
  DF: "Direct to Film",
  SEW: "Sewing",
  BAG: "Bag",
};

// Assign a specific color to each tag code
const TAG_COLOR_MAP: Record<TagCode, string> = {
  EM: "#3b82f6", // blue
  HW: "#10b981", // green
  MISC: "#f59e42", // orange
  AP: "#ef4444", // red
  PA: "#a21caf", // purple
  SW: "#fbbf24", // yellow
  CR: "#6366f1", // indigo
  SC: "#14b8a6", // teal
  DF: "#e11d48", // rose
  SEW: "#0ea5e9", // sky
  BAG: "#8b5cf6", // violet
};

// Modern, high-contrast color palette
const DEFAULT_TAG_COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e42", // orange-400
  "#ef4444", // red-500
  "#a21caf", // purple-700
  "#fbbf24", // yellow-400
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#e11d48", // rose-600
  "#0ea5e9", // sky-500
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Validate database connection
async function validateConnection() {
  try {
    await sql`SELECT 1`;
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Function to get organization
export async function ensureOrganization(name: string) {
  try {
    console.log("Looking for organization:", name);

    // Find the existing organization
    const [org] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.name, name));

    if (!org) {
      console.log("Organization not found:", name);
      return null;
    }

    console.log("Found organization:", org);
    return org;
  } catch (error) {
    console.error("Error finding organization:", error);
    throw error;
  }
}

// Function to check if a job already exists with current data
export async function checkJobExists(
  orgName: string,
  orderNumber: string,
  checkImages: boolean = true
): Promise<{
  exists: boolean;
  hasImages: boolean;
  order?: any;
}> {
  try {
    // Get organization
    const org = await ensureOrganization(orgName);
    if (!org) {
      return { exists: false, hasImages: false };
    }

    // Find the order
    const [existingOrder] = await db
      .select()
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.order_number, orderNumber),
          eq(schema.orders.organization_id, org.id)
        )
      );

    if (!existingOrder) {
      return { exists: false, hasImages: false };
    }

    // Check if it has images if requested
    let hasImages = false;
    if (checkImages && existingOrder.images) {
      const images = existingOrder.images as any[];
      hasImages = !!(images && images.length > 0 && images[0]?.thumbnail_url);
    }

    return {
      exists: true,
      hasImages,
      order: existingOrder,
    };
  } catch (error) {
    console.error(
      `Error checking if job exists for order ${orderNumber}:`,
      error
    );
    return { exists: false, hasImages: false };
  }
}

// Function to validate and sanitize scraped job data
function validateScrapedJob(jobData: ScrapedJob): {
  isValid: boolean;
  errors: string[];
  sanitizedData?: ScrapedJob;
} {
  const errors: string[] = [];
  const sanitizedData = { ...jobData };

  // Validate required fields
  if (!jobData.jobNumber || !jobData.jobNumber.trim()) {
    errors.push("Job number is required");
  }

  if (!jobData.customer?.name || !jobData.customer.name.trim()) {
    errors.push("Customer name is required");
  } else {
    // Sanitize customer name
    sanitizedData.customer.name = jobData.customer.name.trim();

    // Check length constraint
    if (sanitizedData.customer.name.length > 100) {
      console.warn(
        `Customer name too long (${sanitizedData.customer.name.length} chars), truncating`
      );
      sanitizedData.customer.name = sanitizedData.customer.name
        .substring(0, 100)
        .trim();
    }
  }

  if (!jobData.order?.order_number || !jobData.order.order_number.trim()) {
    errors.push("Order number is required");
  }

  if (!jobData.order?.title || !jobData.order.title.trim()) {
    errors.push("Order title is required");
  } else {
    // Sanitize order title
    sanitizedData.order.title = jobData.order.title.trim();

    // Check length constraint (assuming similar database limits)
    if (sanitizedData.order.title.length > 255) {
      console.warn(
        `Order title too long (${sanitizedData.order.title.length} chars), truncating`
      );
      sanitizedData.order.title = sanitizedData.order.title
        .substring(0, 255)
        .trim();
    }
  }

  // Validate dates
  if (jobData.order?.created_at) {
    try {
      new Date(jobData.order.created_at);
    } catch (error) {
      errors.push("Invalid created_at date format");
    }
  }

  if (jobData.order?.ship_date) {
    try {
      new Date(jobData.order.ship_date);
    } catch (error) {
      errors.push("Invalid ship_date format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

// Enhanced error handling for database constraint violations
function handleDatabaseError(
  error: any,
  context: string
): { message: string; isRetryable: boolean; category: string } {
  const errorInfo = {
    message: error.message || "Unknown database error",
    isRetryable: false,
    category: "unknown",
  };

  // Handle specific PostgreSQL error codes
  if (error.code) {
    switch (error.code) {
      case "22001": // String data right truncation
        errorInfo.message = "Data too long for database column";
        errorInfo.category = "validation";
        errorInfo.isRetryable = false;
        break;
      case "23505": // Unique violation
        errorInfo.message = "Duplicate record constraint violation";
        errorInfo.category = "constraint";
        errorInfo.isRetryable = false;
        break;
      case "23503": // Foreign key violation
        errorInfo.message = "Referenced record does not exist";
        errorInfo.category = "constraint";
        errorInfo.isRetryable = false;
        break;
      case "23502": // Not null violation
        errorInfo.message = "Required field is missing";
        errorInfo.category = "validation";
        errorInfo.isRetryable = false;
        break;
      case "08000": // Connection exception
      case "08003": // Connection does not exist
      case "08006": // Connection failure
        errorInfo.message = "Database connection error";
        errorInfo.category = "connection";
        errorInfo.isRetryable = true;
        break;
      case "53300": // Too many connections
        errorInfo.message = "Database connection pool exhausted";
        errorInfo.category = "connection";
        errorInfo.isRetryable = true;
        break;
      default:
        errorInfo.message = `Database error (${error.code}): ${error.message}`;
        errorInfo.category = "database";
        errorInfo.isRetryable = false;
    }
  }

  console.error(`Database error in ${context}:`, {
    code: error.code,
    message: errorInfo.message,
    category: errorInfo.category,
    isRetryable: errorInfo.isRetryable,
    originalError: error,
  });

  return errorInfo;
}

// Function to ensure customer exists
async function ensureCustomer(orgId: number, name: string) {
  try {
    const [customer] = await db
      .insert(schema.customers)
      .values({
        organization_id: orgId,
        name,
      })
      .onConflictDoNothing()
      .returning();

    if (customer) return customer;

    // If no insert happened, get the existing customer
    const [existingCustomer] = await db
      .select()
      .from(schema.customers)
      .where(
        and(
          eq(schema.customers.organization_id, orgId),
          eq(schema.customers.name, name)
        )
      );

    return existingCustomer;
  } catch (error) {
    const errorInfo = handleDatabaseError(
      error,
      `ensureCustomer for "${name}"`
    );

    // For certain errors, try to recover by finding existing customer
    if (
      errorInfo.category === "validation" ||
      errorInfo.category === "constraint"
    ) {
      console.warn(
        `Attempting to find existing customer after error: ${errorInfo.message}`
      );
      try {
        const [existingCustomer] = await db
          .select()
          .from(schema.customers)
          .where(
            and(
              eq(schema.customers.organization_id, orgId),
              eq(schema.customers.name, name)
            )
          );

        if (existingCustomer) {
          console.log(
            `Successfully found existing customer: ${existingCustomer.name}`
          );
          return existingCustomer;
        }
      } catch (recoveryError) {
        console.error(
          "Failed to recover by finding existing customer:",
          recoveryError
        );
      }
    }

    throw error;
  }
}

// Function to get tags for an organization
export async function ensureTags(orgId: number) {
  console.log("Fetching tags for organization ID:", orgId);

  try {
    // Get all tags for the organization
    const orgTags = await db
      .select()
      .from(schema.tags)
      .where(eq(schema.tags.organization_id, orgId));

    console.log("Retrieved organization tags:", orgTags);
    return orgTags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
}

// Function to save a scraped job
export async function saveScrapedJob(orgName: string, jobData: ScrapedJob) {
  try {
    console.log(
      `Processing job ${jobData.jobNumber || "unknown"} for ${orgName}`
    );

    // 1. Validate and sanitize input data
    const validation = validateScrapedJob(jobData);
    if (!validation.isValid) {
      const errorMsg = `Job validation failed: ${validation.errors.join(", ")}`;
      console.error(errorMsg, {
        jobNumber: jobData.jobNumber,
        errors: validation.errors,
      });
      throw new Error(errorMsg);
    }

    const sanitizedJobData = validation.sanitizedData!;
    console.log(`Job ${sanitizedJobData.jobNumber} passed validation`);

    // 2. Ensure organization exists
    const org = await ensureOrganization(orgName);

    // Handle case where organization is not found
    if (!org) {
      const errorMsg = `Organization '${orgName}' not found. Cannot save scraped job.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // 3. Ensure customer exists (with enhanced error handling)
    let customer;
    try {
      customer = await ensureCustomer(org.id, sanitizedJobData.customer.name);
      if (!customer) {
        throw new Error(
          `Failed to create or find customer: ${sanitizedJobData.customer.name}`
        );
      }
    } catch (error) {
      console.error(
        `Customer creation failed for job ${sanitizedJobData.jobNumber}:`,
        error
      );
      throw error;
    }

    // 4. Ensure tags exist and get their IDs
    const orgTags = await ensureTags(org.id);
    const tagMap = new Map(orgTags.map((tag) => [tag.code, tag.id]));

    console.log(
      "Scraped tags for job",
      sanitizedJobData.order.order_number,
      ":",
      sanitizedJobData.tags
    );

    // 5. Check if order exists
    let existingOrder;
    try {
      [existingOrder] = await db
        .select()
        .from(schema.orders)
        .where(
          eq(schema.orders.order_number, sanitizedJobData.order.order_number)
        );
    } catch (error) {
      console.warn(
        `Failed to check for existing order ${sanitizedJobData.order.order_number}:`,
        error
      );
      // Continue with insert operation
    }

    let order;
    if (existingOrder) {
      console.log(
        `Updating existing order: ${sanitizedJobData.order.order_number}`
      );
      // Update existing order
      try {
        // Prepare update data conditionally including created_at
        const updateData: any = {
          job_number: sanitizedJobData.jobNumber,
          title: sanitizedJobData.order.title,
          organization_id: org.id,
          customer_id: customer.id,
          status: STATUS_MAP[sanitizedJobData.order.status] || "pending",
          ship_date: sanitizedJobData.order.ship_date,
          updated_at: new Date(),
          images: sanitizedJobData.order.images || [],
          job_descriptions: sanitizedJobData.jobDescriptions || [],
        };

        // Only include created_at if provided (otherwise DB will use existing value)
        if (sanitizedJobData.order.created_at) {
          updateData.created_at = new Date(sanitizedJobData.order.created_at);
        }

        [order] = await db
          .update(schema.orders)
          .set(updateData)
          .where(eq(schema.orders.id, existingOrder.id))
          .returning();

        // Delete existing order tags
        await db
          .delete(schema.order_tags)
          .where(eq(schema.order_tags.order_id, existingOrder.id));
      } catch (error) {
        const errorInfo = handleDatabaseError(
          error,
          `update order ${sanitizedJobData.order.order_number}`
        );
        throw new Error(`Failed to update order: ${errorInfo.message}`);
      }
    } else {
      console.log(`Creating new order: ${sanitizedJobData.order.order_number}`);
      // Create new order
      try {
        // Prepare insert data conditionally including created_at
        const insertData: any = {
          job_number: sanitizedJobData.jobNumber,
          order_number: sanitizedJobData.order.order_number,
          title: sanitizedJobData.order.title,
          organization_id: org.id,
          customer_id: customer.id,
          status: STATUS_MAP[sanitizedJobData.order.status] || "pending",
          ship_date: sanitizedJobData.order.ship_date,
          images: sanitizedJobData.order.images || [],
          job_descriptions: sanitizedJobData.jobDescriptions || [],
        };

        // Only include created_at if provided (otherwise DB will use defaultNow())
        if (sanitizedJobData.order.created_at) {
          insertData.created_at = new Date(sanitizedJobData.order.created_at);
        }

        [order] = await db.insert(schema.orders).values(insertData).returning();
      } catch (error) {
        const errorInfo = handleDatabaseError(
          error,
          `create order ${sanitizedJobData.order.order_number}`
        );
        throw new Error(`Failed to create order: ${errorInfo.message}`);
      }
    }

    // 6. Create order tags with quantities
    const validTags = sanitizedJobData.tags.filter(
      (tag): tag is { code: keyof typeof TAG_MAP; quantity: number } =>
        tag.code.toUpperCase() in TAG_MAP && tagMap.has(tag.code.toUpperCase())
    );

    if (validTags.length > 0) {
      const orderTagValues = validTags.map((tag) => ({
        order_id: order.id,
        tag_id: tagMap.get(tag.code.toUpperCase())!,
        quantity: tag.quantity,
      }));

      try {
        await db.insert(schema.order_tags).values(orderTagValues);
        console.log(
          `Created ${orderTagValues.length} order tags for order ${sanitizedJobData.order.order_number}`
        );
      } catch (error) {
        console.warn(
          `Failed to create order tags for ${sanitizedJobData.order.order_number}:`,
          error
        );
        // Don't fail the entire operation for tag creation failures
      }
    } else {
      console.warn(
        `No valid tags found for order ${sanitizedJobData.order.order_number}`
      );
    }

    console.log(
      `✅ Successfully saved job ${sanitizedJobData.jobNumber} (order: ${sanitizedJobData.order.order_number})`
    );
    return order;
  } catch (error) {
    console.error(
      `❌ Error saving scraped job ${jobData.jobNumber || "unknown"}:`,
      error
    );
    throw error;
  }
}

// Function to save multiple scraped jobs
export async function saveScrapedJobs(orgName: string, jobs: ScrapedJob[]) {
  console.log(`Starting batch save of ${jobs.length} jobs for ${orgName}`);

  const results = [];
  const errors = [];
  const errorStats = {
    validation: 0,
    database: 0,
    constraint: 0,
    connection: 0,
    unknown: 0,
  };

  let processed = 0;
  const startTime = Date.now();

  for (const job of jobs) {
    processed++;
    try {
      console.log(
        `Processing job ${processed}/${jobs.length}: ${
          job.jobNumber || "unknown"
        }`
      );
      const result = await saveScrapedJob(orgName, job);
      results.push(result);

      // Log progress every 10 jobs
      if (processed % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = processed / elapsed;
        console.log(
          `Progress: ${processed}/${jobs.length} jobs (${rate.toFixed(
            2
          )} jobs/sec)`
        );
      }
    } catch (error: any) {
      console.error(`Failed to save job ${job.jobNumber || "unknown"}:`, error);

      // Categorize error for statistics
      let category = "unknown";
      if (error.message?.includes("validation failed")) {
        category = "validation";
      } else if (error.message?.includes("Data too long")) {
        category = "validation";
      } else if (error.message?.includes("constraint")) {
        category = "constraint";
      } else if (error.message?.includes("connection")) {
        category = "connection";
      } else if (error.code) {
        const errorInfo = handleDatabaseError(
          error,
          `save job ${job.jobNumber}`
        );
        category = errorInfo.category;
      }

      errorStats[category as keyof typeof errorStats]++;

      errors.push({
        job,
        error: {
          message: error.message || "Unknown error",
          code: error.code,
          category,
          stack: error.stack,
        },
      });
    }
  }

  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const successRate = (results.length / jobs.length) * 100;

  // Generate comprehensive summary
  console.log("\n📊 Batch Save Summary:");
  console.log(`⏱️  Total time: ${totalTime.toFixed(2)} seconds`);
  console.log(
    `📈 Success rate: ${successRate.toFixed(1)}% (${results.length}/${
      jobs.length
    })`
  );
  console.log(`✅ Successfully saved: ${results.length} jobs`);
  console.log(`❌ Failed to save: ${errors.length} jobs`);

  if (errors.length > 0) {
    console.log("\n🏷️  Error breakdown:");
    Object.entries(errorStats).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`   ${category}: ${count} errors`);
      }
    });

    // Show sample errors for troubleshooting
    console.log("\n🔍 Sample errors:");
    const sampleErrors = errors.slice(0, 3);
    sampleErrors.forEach((errItem, index) => {
      console.log(
        `   ${index + 1}. Job ${errItem.job.jobNumber}: ${
          errItem.error.message
        }`
      );
    });

    if (errors.length > 3) {
      console.log(`   ... and ${errors.length - 3} more errors`);
    }
  }

  return {
    success: results,
    errors,
    stats: {
      total: jobs.length,
      successful: results.length,
      failed: errors.length,
      successRate: successRate,
      totalTime: totalTime,
      errorBreakdown: errorStats,
    },
  };
}
