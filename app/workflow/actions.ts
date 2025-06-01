"use server";

import { db } from "@/lib/db";
import { orders, users, order_tags, tags } from "@/lib/schema";
import { desc, eq, and, gte, lte, sql } from "drizzle-orm";

interface OrderFilters {
  tag?: string;
  status?: string;
  priority?: string;
  dateRange?: string;
  sort?: string;
  search?: string;
}

export async function getOrders(filters: OrderFilters = {}) {
  try {
    // Start with base query
    const baseQuery = db
      .select({
        id: orders.order_number,
        orderId: orders.id,
        title: orders.title,
        status: orders.status,
        assignedTo: users.name,
        dueDate: orders.ship_date,
        images: orders.images,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.assigned_to));

    // Build where conditions
    const whereConditions = [];

    // Apply search filter
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      whereConditions.push(
        sql`(${orders.order_number} ILIKE ${searchTerm} OR ${orders.title} ILIKE ${searchTerm})`
      );
    }

    // Apply tag filter
    if (filters.tag) {
      whereConditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${order_tags}
          INNER JOIN ${tags} ON ${tags.id} = ${order_tags.tag_id}
          WHERE ${order_tags.order_id} = ${orders.id}
          AND ${tags.name} = ${filters.tag}
        )`
      );
    }

    // Apply status filter
    if (filters.status) {
      whereConditions.push(eq(orders.status, filters.status));
    }

    // Apply date range filter
    if (filters.dateRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filters.dateRange) {
        case "today":
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          whereConditions.push(
            and(
              gte(orders.ship_date, today.toISOString()),
              lte(orders.ship_date, tomorrow.toISOString())
            )
          );
          break;
        case "week":
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          whereConditions.push(
            and(
              gte(orders.ship_date, today.toISOString()),
              lte(orders.ship_date, nextWeek.toISOString())
            )
          );
          break;
        case "month":
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          whereConditions.push(
            and(
              gte(orders.ship_date, today.toISOString()),
              lte(orders.ship_date, nextMonth.toISOString())
            )
          );
          break;
        case "overdue":
          whereConditions.push(
            and(
              lte(orders.ship_date, today.toISOString()),
              sql`${orders.status} != 'completed'`
            )
          );
          break;
      }
    }

    // Apply all where conditions
    const query =
      whereConditions.length > 0
        ? baseQuery.where(and(...whereConditions))
        : baseQuery;

    // Apply sorting
    const ordersData = await query.orderBy(
      filters.sort === "asc" ? orders.created_at : desc(orders.created_at)
    );

    // Get tags for each order
    const ordersWithTags = await Promise.all(
      ordersData.map(async (order) => {
        const orderTags = await db
          .select({
            name: tags.name,
            color: tags.color,
          })
          .from(order_tags)
          .innerJoin(tags, eq(tags.id, order_tags.tag_id))
          .where(eq(order_tags.order_id, order.orderId));

        return {
          ...order,
          tags: orderTags.map((tag) => ({
            name: tag.name,
            color: tag.color,
          })),
        };
      })
    );

    return ordersWithTags;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

export async function getTags() {
  try {
    const tagsData = await db
      .select({
        name: tags.name,
        color: tags.color,
      })
      .from(tags)
      .orderBy(tags.name);

    // Map of abbreviations to full names
    const tagAbbreviations: { [key: string]: string } = {
      AP: "Apparel",
      PA: "Patch Apply",
      EM: "Embroidery",
      HW: "Headwear",
      SW: "Sew Down",
      CR: "Crafter",
      SC: "Supacolor",
      DF: "Direct to Film",
      SEW: "Sewing",
      MISC: "Miscellaneous",
    };

    // Return tags with both abbreviations and full names
    return tagsData.map((tag) => {
      // Find the abbreviation for this tag name
      const abbreviation =
        Object.entries(tagAbbreviations).find(
          ([_, fullName]) => fullName === tag.name
        )?.[0] || tag.name; // Fallback to full name if no abbreviation found

      return {
        code: abbreviation, // Use the abbreviation as code
        name: tag.name, // Keep the full name
        color: tag.color,
      };
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw new Error("Failed to fetch tags");
  }
}
