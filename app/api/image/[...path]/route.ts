import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const imagePath = "/" + resolvedParams.path.join("/");

    // This endpoint serves as a fallback for expired images
    // The application now uses original Azure URLs directly
    console.log(`Serving placeholder for expired image: ${imagePath}`);

    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: "/placeholder-image.svg",
        "Cache-Control": "public, max-age=300",
        "X-Image-Status": "expired-sas-token",
        "X-Original-Path": imagePath,
      },
    });
  } catch (error) {
    console.error("Error in image proxy:", error);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: "/placeholder-image.svg",
        "X-Image-Status": "error",
      },
    });
  }
}
