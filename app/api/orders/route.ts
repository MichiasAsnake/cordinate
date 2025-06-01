import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { orders, order_tags, tags, organizations } from "../../../lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagCode = searchParams.get("tag");
    const orgName = searchParams.get("org") || "Deco Press";

    if (!tagCode) {
      return NextResponse.json(
        { error: "Tag code is required" },
        { status: 400 }
      );
    }

    // Get the organization
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, orgName));

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get orders with this tag
    const ordersWithTag = await db
      .select({
        id: orders.id,
        order_number: orders.order_number,
        title: orders.title,
        status: orders.status,
        ship_date: orders.ship_date,
        created_at: orders.created_at,
        updated_at: orders.updated_at,
      })
      .from(order_tags)
      .innerJoin(orders, eq(order_tags.order_id, orders.id))
      .innerJoin(tags, eq(order_tags.tag_id, tags.id))
      .where(
        and(
          eq(tags.code, tagCode),
          eq(tags.organization_id, org.id),
          eq(orders.organization_id, org.id)
        )
      )
      .orderBy(orders.created_at);

    return NextResponse.json(ordersWithTag);
  } catch (error) {
    console.error("Error fetching orders by tag:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Add this to ensure the route is properly configured
export const dynamic = "force-dynamic";
export const revalidate = 0;
