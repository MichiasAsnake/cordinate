"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = checkConnection;
exports.ensureTags = ensureTags;
exports.saveScrapedJob = saveScrapedJob;
exports.saveScrapedJobs = saveScrapedJobs;
const serverless_1 = require("@neondatabase/serverless");
const neon_http_1 = require("drizzle-orm/neon-http");
const schema = __importStar(require("./schema.js"));
const drizzle_orm_1 = require("drizzle-orm");
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
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}
// Get the database URL from environment variables
const sql = (0, serverless_1.neon)(process.env.DATABASE_URL);
const db = (0, neon_http_1.drizzle)(sql, { schema });
// Status mapping for the initial organization
const STATUS_MAP = {
    Approved: "approved",
    Pending: "pending",
    "In Progress": "in_progress",
    Completed: "completed",
    Cancelled: "cancelled",
};
// Tag mapping for the initial organization
const TAG_MAP = {
    EM: "EM",
    HW: "HW",
    Misc: "MISC",
    AP: "AP",
    PA: "PA",
    SW: "SW",
    CR: "CR",
    SC: "SC",
    DF: "DF",
    SEW: "SEW",
};
// Assign a specific color to each tag code
const TAG_COLOR_MAP = {
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
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
// Export a function to check database connection
async function checkConnection() {
    try {
        await sql `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error("Database connection error:", error);
        return false;
    }
}
// Function to ensure organization exists
async function ensureOrganization(name) {
    const [org] = await db
        .insert(schema.organizations)
        .values({ name })
        .onConflictDoNothing()
        .returning();
    if (org)
        return org;
    // If no insert happened, get the existing org
    const [existingOrg] = await db
        .select()
        .from(schema.organizations)
        .where((0, drizzle_orm_1.eq)(schema.organizations.name, name));
    return existingOrg;
}
// Function to ensure customer exists
async function ensureCustomer(orgId, name) {
    const [customer] = await db
        .insert(schema.customers)
        .values({
        organization_id: orgId,
        name,
    })
        .onConflictDoNothing()
        .returning();
    if (customer)
        return customer;
    // If no insert happened, get the existing customer
    const [existingCustomer] = await db
        .select()
        .from(schema.customers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.customers.organization_id, orgId), (0, drizzle_orm_1.eq)(schema.customers.name, name)));
    return existingCustomer;
}
// Function to ensure tags exist and get their IDs
async function ensureTags(orgId) {
    // Create tag values with explicit color mapping
    const tagValues = Object.entries(TAG_MAP).map(([code, name]) => ({
        organization_id: orgId,
        code,
        name,
        color: TAG_COLOR_MAP[name], // Explicitly map the color
    }));
    // Insert tags with all required fields including color
    await db.insert(schema.tags).values(tagValues).onConflictDoNothing();
    // Get all tags for the organization
    const orgTags = await db
        .select()
        .from(schema.tags)
        .where((0, drizzle_orm_1.eq)(schema.tags.organization_id, orgId));
    return orgTags;
}
// Function to save a scraped job
async function saveScrapedJob(orgName, jobData) {
    try {
        // 1. Ensure organization exists
        const org = await ensureOrganization(orgName);
        // 2. Ensure customer exists
        const customer = await ensureCustomer(org.id, jobData.customer.name);
        // 3. Ensure tags exist and get their IDs
        const orgTags = await ensureTags(org.id);
        const tagMap = new Map(orgTags.map((tag) => [tag.code, tag.id]));
        // 4. Check if order exists
        const [existingOrder] = await db
            .select()
            .from(schema.orders)
            .where((0, drizzle_orm_1.eq)(schema.orders.order_number, jobData.order.order_number));
        let order;
        if (existingOrder) {
            // Update existing order
            [order] = await db
                .update(schema.orders)
                .set({
                title: jobData.order.title,
                organization_id: org.id,
                customer_id: customer.id,
                status: STATUS_MAP[jobData.order.status] || "pending",
                ship_date: jobData.order.ship_date,
                created_at: new Date(jobData.order.created_at),
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.orders.id, existingOrder.id))
                .returning();
            // Delete existing order tags
            await db
                .delete(schema.order_tags)
                .where((0, drizzle_orm_1.eq)(schema.order_tags.order_id, existingOrder.id));
        }
        else {
            // Create new order
            [order] = await db
                .insert(schema.orders)
                .values({
                order_number: jobData.order.order_number,
                title: jobData.order.title,
                organization_id: org.id,
                customer_id: customer.id,
                status: STATUS_MAP[jobData.order.status] || "pending",
                ship_date: jobData.order.ship_date,
                created_at: new Date(jobData.order.created_at),
            })
                .returning();
        }
        // 5. Create order tags with quantities
        const orderTagValues = jobData.tags
            .filter((tag) => tag.code in TAG_MAP)
            .map((tag) => ({
            order_id: order.id,
            tag_id: tagMap.get(TAG_MAP[tag.code]),
            quantity: tag.quantity,
        }));
        if (orderTagValues.length > 0) {
            await db.insert(schema.order_tags).values(orderTagValues);
        }
        return order;
    }
    catch (error) {
        console.error("Error saving scraped job:", error);
        throw error;
    }
}
// Function to save multiple scraped jobs
async function saveScrapedJobs(orgName, jobs) {
    const results = [];
    const errors = [];
    for (const job of jobs) {
        try {
            const result = await saveScrapedJob(orgName, job);
            results.push(result);
        }
        catch (error) {
            errors.push({
                job,
                error,
            });
        }
    }
    return {
        success: results,
        errors,
    };
}
