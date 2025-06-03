import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, jobNumber } = body as {
      orderNumber?: string;
      jobNumber?: string;
    };

    if (!orderNumber && !jobNumber) {
      return NextResponse.json(
        { error: "Either orderNumber or jobNumber is required" },
        { status: 400 }
      );
    }

    // Find the order in the database
    let order;
    if (orderNumber) {
      [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.order_number, orderNumber))
        .limit(1);
    } else if (jobNumber) {
      [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.job_number, jobNumber))
        .limit(1);
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // TODO: Here you would trigger the scraping system to re-scrape this specific order
    // For now, we'll just log the request and return a success response

    console.log(
      `Re-scrape requested for order: ${order.order_number} (Job: ${order.job_number})`
    );

    // In a real implementation, you might:
    // 1. Call your scraping service with the specific job number
    // 2. Queue the job for re-scraping
    // 3. Update a status field to indicate re-scraping is in progress

    return NextResponse.json({
      success: true,
      message: `Re-scrape requested for order ${order.order_number}`,
      order: {
        id: order.id,
        order_number: order.order_number,
        job_number: order.job_number,
        title: order.title,
      },
      // TODO: Include actual re-scraping logic
      note: "Re-scraping logic not yet implemented - would trigger scraper here",
    });
  } catch (error) {
    console.error("Error in re-scrape request:", error);
    return NextResponse.json(
      {
        error: "Failed to process re-scrape request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check which orders might need re-scraping
export async function GET() {
  try {
    // Get orders with images that might be expired
    const ordersWithImages = await db
      .select({
        id: orders.id,
        order_number: orders.order_number,
        job_number: orders.job_number,
        title: orders.title,
        images: orders.images,
        updated_at: orders.updated_at,
      })
      .from(orders)
      .limit(50);

    const potentiallyExpired = ordersWithImages.filter((order) => {
      if (!order.images || order.images.length === 0) return false;

      // Check if any images might be expired based on the updated date
      const lastUpdated = new Date(order.updated_at || 0);
      const now = new Date();
      const daysSinceUpdate =
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

      // If images haven't been updated in 30+ days, they might be expired
      return daysSinceUpdate > 30;
    });

    return NextResponse.json({
      totalOrdersWithImages: ordersWithImages.length,
      potentiallyExpiredOrders: potentiallyExpired.length,
      orders: potentiallyExpired.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        job_number: order.job_number,
        title: order.title,
        imageCount: order.images?.length || 0,
        daysSinceUpdate: Math.round(
          (new Date().getTime() - new Date(order.updated_at || 0).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      })),
    });
  } catch (error) {
    console.error("Error checking orders for re-scraping:", error);
    return NextResponse.json(
      {
        error: "Failed to check orders",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
