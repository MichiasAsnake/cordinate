import { NextResponse } from "next/server";
import { getTags } from "@/app/workflow/actions";

export async function GET() {
  try {
    const tags = await getTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// Add this to ensure the route is properly configured
export const dynamic = "force-dynamic";
export const revalidate = 0;
