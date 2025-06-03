"use server";

import { db } from "@/lib/db";
import { orders, order_tags, tags } from "@/lib/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface DashboardStats {
  totalJobs: number;
  jobsDueToday: number;
  jobsDueTomorrow: number;
  jobsDueInTwoDays: number;
  overdueJobs: number;
  jobsByTag: Array<{
    tagName: string;
    tagColor: string;
    count: number;
  }>;
  jobsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export async function getDashboardStats(
  selectedTags: string[] = []
): Promise<DashboardStats> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Build base query with optional tag filter
    const buildQuery = (dateCondition?: any, statusCondition?: any) => {
      let query = db.select({ count: sql<number>`count(*)` }).from(orders);

      const conditions = [];

      if (dateCondition) conditions.push(dateCondition);
      if (statusCondition) conditions.push(statusCondition);

      // Add tag filter if selected tags exist
      if (selectedTags.length > 0) {
        conditions.push(
          sql`EXISTS (
            SELECT 1 FROM ${order_tags}
            INNER JOIN ${tags} ON ${tags.id} = ${order_tags.tag_id}
            WHERE ${order_tags.order_id} = ${orders.id}
            AND ${tags.name} = ANY(${selectedTags})
          )`
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return query;
    };

    // Get total jobs
    const totalJobsResult = await buildQuery();
    const totalJobs = totalJobsResult[0]?.count || 0;

    // Jobs due today
    const jobsDueTodayResult = await buildQuery(
      and(
        gte(orders.ship_date, today.toISOString()),
        lte(orders.ship_date, tomorrow.toISOString())
      )
    );
    const jobsDueToday = jobsDueTodayResult[0]?.count || 0;

    // Jobs due tomorrow
    const jobsDueTomorrowResult = await buildQuery(
      and(
        gte(orders.ship_date, tomorrow.toISOString()),
        lte(orders.ship_date, dayAfterTomorrow.toISOString())
      )
    );
    const jobsDueTomorrow = jobsDueTomorrowResult[0]?.count || 0;

    // Jobs due in 2 days
    const jobsDueInTwoDaysResult = await buildQuery(
      and(
        gte(orders.ship_date, dayAfterTomorrow.toISOString()),
        lte(orders.ship_date, threeDaysFromNow.toISOString())
      )
    );
    const jobsDueInTwoDays = jobsDueInTwoDaysResult[0]?.count || 0;

    // Overdue jobs (past due and not completed)
    const overdueJobsResult = await buildQuery(
      and(
        lte(orders.ship_date, today.toISOString()),
        sql`${orders.status} != 'completed'`
      )
    );
    const overdueJobs = overdueJobsResult[0]?.count || 0;

    // Jobs by tag (only if no specific tags selected)
    const jobsByTag =
      selectedTags.length === 0
        ? await db
            .select({
              tagName: tags.name,
              tagColor: tags.color,
              count: sql<number>`count(*)`,
            })
            .from(order_tags)
            .innerJoin(tags, eq(tags.id, order_tags.tag_id))
            .innerJoin(orders, eq(orders.id, order_tags.order_id))
            .groupBy(tags.name, tags.color)
            .orderBy(sql`count(*) DESC`)
            .limit(5)
        : [];

    // Jobs by status
    const jobsByStatus = await (() => {
      let query = db
        .select({
          status: orders.status,
          count: sql<number>`count(*)`,
        })
        .from(orders);

      if (selectedTags.length > 0) {
        query = query
          .innerJoin(order_tags, eq(order_tags.order_id, orders.id))
          .innerJoin(tags, eq(tags.id, order_tags.tag_id))
          .where(sql`${tags.name} = ANY(${selectedTags})`);
      }

      return query.groupBy(orders.status).orderBy(sql`count(*) DESC`);
    })();

    return {
      totalJobs,
      jobsDueToday,
      jobsDueTomorrow,
      jobsDueInTwoDays,
      overdueJobs,
      jobsByTag,
      jobsByStatus,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}
