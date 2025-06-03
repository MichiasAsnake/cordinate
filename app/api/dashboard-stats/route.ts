import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats } from "../../actions/dashboard";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedTags = [] } = body;

    const stats = await getDashboardStats(selectedTags);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
