import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, isNotNull } from "drizzle-orm";
import {
  needsImageRefresh,
  refreshImageObject,
} from "@/lib/utils/image-refresh";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds } = body as { orderIds?: number[] };

    let refreshedCount = 0;
    let checkedCount = 0;

    if (orderIds && orderIds.length > 0) {
      // Refresh specific orders
      for (const orderId of orderIds) {
        const refreshed = await refreshOrderImages(orderId);
        if (refreshed) refreshedCount++;
        checkedCount++;
      }
    } else {
      // Refresh all orders with expired images
      const allOrders = await db
        .select({
          id: orders.id,
          images: orders.images,
        })
        .from(orders)
        .where(isNotNull(orders.images)); // Only orders with images

      for (const order of allOrders) {
        checkedCount++;
        if (order.images && needsImageRefresh(order.images)) {
          const refreshed = await refreshOrderImages(order.id);
          if (refreshed) refreshedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${checkedCount} orders, refreshed ${refreshedCount} orders with expired images`,
      refreshedCount,
      checkedCount,
    });
  } catch (error) {
    console.error("Error refreshing images:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh images",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

async function refreshOrderImages(orderId: number): Promise<boolean> {
  try {
    // Get current order images
    const [order] = await db
      .select({
        images: orders.images,
      })
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order || !order.images) {
      return false;
    }

    // Refresh the image URLs
    const refreshedImages = order.images.map(refreshImageObject);

    // Update the database
    await db
      .update(orders)
      .set({
        images: refreshedImages,
        updated_at: new Date(),
      })
      .where(eq(orders.id, orderId));

    console.log(`Refreshed images for order ${orderId}`);
    return true;
  } catch (error) {
    console.error(`Error refreshing images for order ${orderId}:`, error);
    return false;
  }
}

// GET endpoint to check which orders need image refresh
export async function GET() {
  try {
    const ordersNeedingRefresh = await db
      .select({
        id: orders.id,
        order_number: orders.order_number,
        title: orders.title,
        images: orders.images,
      })
      .from(orders)
      .where(isNotNull(orders.images)); // Only orders with images

    const needsRefresh = ordersNeedingRefresh.filter(
      (order) => order.images && needsImageRefresh(order.images)
    );

    return NextResponse.json({
      totalOrdersWithImages: ordersNeedingRefresh.length,
      ordersNeedingRefresh: needsRefresh.length,
      orders: needsRefresh.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        title: order.title,
        imageCount: order.images?.length || 0,
      })),
    });
  } catch (error) {
    console.error("Error checking image refresh status:", error);
    return NextResponse.json(
      {
        error: "Failed to check image refresh status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
