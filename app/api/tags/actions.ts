import { db } from "../../../lib/db";
import { organizations, tags } from "../../../lib/schema";
import { eq } from "drizzle-orm";

export async function getTags() {
  try {
    // First check if the organization exists
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, "Deco Press"));

    if (!org) {
      throw new Error("Organization not found");
    }

    // Get tags for the existing organization
    const orgTags = await db
      .select()
      .from(tags)
      .where(eq(tags.organization_id, org.id));

    return orgTags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
}
