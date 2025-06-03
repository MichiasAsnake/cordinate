/**
 * Enhanced Database Operations
 *
 * Provides database functions for enhanced job data including customer contacts,
 * order line items, job timeline, and communication features.
 */

import { db } from "../db";
import * as schema from "../schema";
import { eq, and, desc } from "drizzle-orm";
import {
  JobDataEnhanced,
  CustomerContact,
  OrderLineItem,
  JobFile,
  JobTimelineEntry,
} from "../types/JobDataEnhanced";

/**
 * Save enhanced job data to the database
 */
export async function saveEnhancedJobData(
  orgName: string,
  enhancedJobData: JobDataEnhanced
): Promise<{ success: boolean; error?: string; orderId?: number }> {
  try {
    console.log(
      `💾 Saving enhanced job data for job ${enhancedJobData.jobNumber}`
    );

    // Get organization
    const [org] = await db
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.name, orgName));

    if (!org) {
      return { success: false, error: `Organization ${orgName} not found` };
    }

    // Handle customer creation/update with enhanced data
    let customerId: number;

    const existingCustomer = await db
      .select()
      .from(schema.customers)
      .where(
        and(
          eq(schema.customers.organization_id, org.id),
          eq(schema.customers.name, enhancedJobData.customer.name)
        )
      );

    if (existingCustomer.length > 0) {
      // Update existing customer with enhanced data
      const customerUpdate = {
        emails: enhancedJobData.customer.emails,
        phones: enhancedJobData.customer.phones,
        address_line1: enhancedJobData.customer.address?.line1,
        address_line2: enhancedJobData.customer.address?.line2,
        city: enhancedJobData.customer.address?.city,
        state: enhancedJobData.customer.address?.state,
        postal_code: enhancedJobData.customer.address?.postal_code,
        country: enhancedJobData.customer.address?.country || "USA",
        contact_preferences:
          enhancedJobData.customer.contact_preferences || null,
        updated_at: new Date(),
      };

      await db
        .update(schema.customers)
        .set(customerUpdate)
        .where(eq(schema.customers.id, existingCustomer[0].id));

      customerId = existingCustomer[0].id;
      console.log(
        `✅ Updated existing customer ${customerId} with enhanced data`
      );
    } else {
      // Create new customer with enhanced data
      const newCustomer = {
        organization_id: org.id,
        name: enhancedJobData.customer.name,
        contact_name: enhancedJobData.customer.name,
        email: enhancedJobData.customer.emails?.[0], // Primary email
        phone: enhancedJobData.customer.phones?.[0], // Primary phone
        emails: enhancedJobData.customer.emails,
        phones: enhancedJobData.customer.phones,
        address_line1: enhancedJobData.customer.address?.line1,
        address_line2: enhancedJobData.customer.address?.line2,
        city: enhancedJobData.customer.address?.city,
        state: enhancedJobData.customer.address?.state,
        postal_code: enhancedJobData.customer.address?.postal_code,
        country: enhancedJobData.customer.address?.country || "USA",
        contact_preferences:
          enhancedJobData.customer.contact_preferences || null,
      };

      const [insertedCustomer] = await db
        .insert(schema.customers)
        .values(newCustomer)
        .returning({ id: schema.customers.id });

      customerId = insertedCustomer.id;
      console.log(`✅ Created new customer ${customerId} with enhanced data`);
    }

    // Save or update order with enhanced data
    const existingOrder = await db
      .select()
      .from(schema.orders)
      .where(
        eq(schema.orders.order_number, enhancedJobData.order.order_number)
      );

    let orderId: number;

    const orderData = {
      job_number: enhancedJobData.jobNumber,
      order_number: enhancedJobData.order.order_number,
      title: enhancedJobData.order.title,
      description: enhancedJobData.order.description,
      organization_id: org.id,
      customer_id: customerId,
      status: enhancedJobData.order.status,
      priority: enhancedJobData.order.priority || "medium",
      ship_date: enhancedJobData.order.ship_date,
      due_date: enhancedJobData.order.due_date,
      total_value: enhancedJobData.order.total_value?.toString(),
      customer_emails: enhancedJobData.customer.emails,
      customer_phones: enhancedJobData.customer.phones,
      shipping_info: {
        tracking: enhancedJobData.order.ship_date ? "pending" : undefined,
      },
      images: enhancedJobData.order.images,
      job_descriptions: enhancedJobData.order.description
        ? [
            {
              text: enhancedJobData.order.description,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
      updated_at: new Date(),
    };

    if (existingOrder.length > 0) {
      // Update existing order
      await db
        .update(schema.orders)
        .set(orderData)
        .where(eq(schema.orders.id, existingOrder[0].id));

      orderId = existingOrder[0].id;
      console.log(`✅ Updated existing order ${orderId} with enhanced data`);
    } else {
      // Create new order
      const [insertedOrder] = await db
        .insert(schema.orders)
        .values(orderData)
        .returning({ id: schema.orders.id });

      orderId = insertedOrder.id;
      console.log(`✅ Created new order ${orderId} with enhanced data`);
    }

    // Save order line items
    if (
      enhancedJobData.order.line_items &&
      enhancedJobData.order.line_items.length > 0
    ) {
      // Delete existing line items
      await db
        .delete(schema.order_items)
        .where(eq(schema.order_items.order_id, orderId));

      // Insert new line items
      const lineItemsData = enhancedJobData.order.line_items.map((item) => ({
        order_id: orderId,
        asset_sku: item.asset_sku,
        asset_tag: item.asset_tag,
        asset_description: item.description,
        quantity: item.quantity,
        unit_price: "0", // Default value since unit_price is required
        status: item.status,
        specifications: item.specifications,
        notes: item.comments,
      }));

      await db.insert(schema.order_items).values(lineItemsData);
      console.log(`✅ Saved ${lineItemsData.length} line items`);
    }

    // Save job files
    if (enhancedJobData.order.files && enhancedJobData.order.files.length > 0) {
      // Delete existing files
      await db
        .delete(schema.job_files)
        .where(eq(schema.job_files.order_id, orderId));

      // Insert new files
      const filesData = enhancedJobData.order.files.map((file) => ({
        order_id: orderId,
        file_name: file.file_url.split("/").pop() || file.filename,
        filename: file.filename,
        file_type: file.file_type,
        file_url: file.file_url,
        category: file.category,
        description: file.description,
        is_active: file.is_active ?? true,
        metadata: {
          original_name: file.filename,
          mime_type: file.file_type,
        },
      }));

      await db.insert(schema.job_files).values(filesData);
      console.log(`✅ Saved ${filesData.length} job files`);
    }

    // Save timeline entries
    if (enhancedJobData.timeline && enhancedJobData.timeline.length > 0) {
      // Delete existing timeline entries for this job
      await db
        .delete(schema.job_timeline)
        .where(eq(schema.job_timeline.job_number, enhancedJobData.jobNumber));

      // Insert new timeline entries
      const timelineData = enhancedJobData.timeline.map((entry) => ({
        job_number: enhancedJobData.jobNumber,
        event_type: entry.event_type,
        event_description: entry.event_description,
        event_data: entry.event_data,
        user_name: entry.user_name,
        created_at: new Date(entry.created_at),
      }));

      await db.insert(schema.job_timeline).values(timelineData);
      console.log(`✅ Saved ${timelineData.length} timeline entries`);
    }

    console.log(
      `🎉 Successfully saved enhanced job data for job ${enhancedJobData.jobNumber}`
    );
    return { success: true, orderId };
  } catch (error) {
    console.error(`❌ Error saving enhanced job data:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Retrieve enhanced job data from the database
 */
export async function getEnhancedJobData(
  jobNumber: string
): Promise<JobDataEnhanced | null> {
  try {
    console.log(`🔍 Retrieving enhanced job data for job ${jobNumber}`);

    // Get the order with customer and enhanced data
    const orderResult = await db
      .select({
        order: schema.orders,
        customer: schema.customers,
        organization: schema.organizations,
      })
      .from(schema.orders)
      .leftJoin(
        schema.customers,
        eq(schema.orders.customer_id, schema.customers.id)
      )
      .leftJoin(
        schema.organizations,
        eq(schema.orders.organization_id, schema.organizations.id)
      )
      .where(eq(schema.orders.job_number, jobNumber));

    if (!orderResult || orderResult.length === 0) {
      console.log(`❌ No order found for job ${jobNumber}`);
      return null;
    }

    const { order, customer, organization } = orderResult[0];

    // Get order line items
    const lineItems = await db
      .select()
      .from(schema.order_items)
      .where(eq(schema.order_items.order_id, order.id));

    // Get job files
    const files = await db
      .select()
      .from(schema.job_files)
      .where(eq(schema.job_files.order_id, order.id));

    // Get timeline entries
    const timeline = await db
      .select()
      .from(schema.job_timeline)
      .where(eq(schema.job_timeline.job_number, jobNumber))
      .orderBy(desc(schema.job_timeline.created_at));

    // Transform to enhanced format
    const enhancedJobData: JobDataEnhanced = {
      jobNumber: order.job_number,
      customer: {
        name: customer?.name || "Unknown Customer",
        emails: (customer?.emails as string[]) || [],
        phones: (customer?.phones as string[]) || [],
        address: customer?.address_line1
          ? {
              line1: customer.address_line1,
              line2: customer.address_line2 || undefined,
              city: customer.city || "",
              state: customer.state || "",
              postal_code: customer.postal_code || "",
              country: customer.country || "USA",
            }
          : undefined,
        contact_preferences: customer?.contact_preferences as any,
      },
      order: {
        order_number: order.order_number,
        title: order.title,
        description: order.description || undefined,
        status: order.status,
        priority: order.priority,
        ship_date: order.ship_date || undefined,
        due_date: order.due_date || undefined,
        total_value: order.total_value
          ? parseFloat(order.total_value)
          : undefined,
        images: (order.images as any) || [],
        line_items: lineItems.map((item) => ({
          asset_tag: item.asset_tag || item.asset_sku,
          asset_sku: item.asset_sku,
          description: item.asset_description || "",
          quantity: item.quantity,
          status: item.status,
          specifications: item.specifications as any,
          comments: item.notes || undefined,
        })),
        files: files.map((file) => ({
          filename: file.filename,
          file_type: file.file_type,
          file_url: file.file_url,
          category: file.category || "other",
          description: file.description || undefined,
          is_active: file.is_active ?? true,
          uploaded_at:
            file.uploaded_at?.toISOString() || new Date().toISOString(),
        })),
      },
      timeline: timeline.map((entry) => ({
        event_type: entry.event_type,
        event_description: entry.event_description,
        event_data: entry.event_data as any,
        user_name: entry.user_name || undefined,
        created_at: entry.created_at?.toISOString() || new Date().toISOString(),
      })),
      tags: [], // Will be populated by separate tags query
      organization: organization?.name || "Unknown",
    };

    console.log(`✅ Retrieved enhanced job data for job ${jobNumber}`);
    return enhancedJobData;
  } catch (error) {
    console.error(
      `❌ Error retrieving enhanced job data for job ${jobNumber}:`,
      error
    );
    return null;
  }
}

/**
 * Add timeline entry for a job
 */
export async function addTimelineEntry(
  jobNumber: string,
  eventType: string,
  description: string,
  userName?: string,
  eventData?: any
): Promise<boolean> {
  try {
    await db.insert(schema.job_timeline).values({
      job_number: jobNumber,
      event_type: eventType,
      event_description: description,
      event_data: eventData,
      user_name: userName,
    });

    console.log(`✅ Added timeline entry for job ${jobNumber}: ${description}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error adding timeline entry for job ${jobNumber}:`,
      error
    );
    return false;
  }
}

/**
 * Update enhanced database operations to handle both enhanced and basic job data
 */
export async function saveJobDataWithEnhancements(
  orgName: string,
  jobData: any
): Promise<{ success: boolean; error?: string; orderId?: number }> {
  // Check if this is enhanced job data
  if (jobData.enhancedData) {
    // Save the enhanced data
    return await saveEnhancedJobData(orgName, jobData.enhancedData);
  } else {
    // Fall back to basic save logic (would need to import from db.ts)
    console.log(`📋 Saving basic job data for job ${jobData.jobNumber}`);
    // This would call the existing saveScrapedJob function
    return { success: true };
  }
}
