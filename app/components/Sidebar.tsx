"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getTags } from "../workflow/actions";
import { useRecentOrders } from "@/lib/hooks/useRecentOrders";
import { Badge } from "@/components/ui/badge";

interface Tag {
  code: string;
  name: string;
  color: string;
}

// Mapping of tag names to their abbreviations
const tagAbbreviations: Record<string, string> = {
  Apparel: "AP",
  "Patch Apply": "PA",
  Embroidery: "EM",
  Headwear: "HW",
  "Sew Down": "SW",
  Crafter: "CR",
  Supacolor: "SC",
  "Direct to Film": "DF",
  Sewing: "SEW",
  Miscellaneous: "MISC",
};

interface RecentOrder {
  id: number;
  orderNumber: string;
  status: string;
  mainTag?: string;
  title?: string;
}

export default function Sidebar() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { recentOrders } = useRecentOrders();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsData = await getTags();
        // Update the code field with abbreviations
        const tagsWithAbbreviations = tagsData.map((tag: Tag) => ({
          ...tag,
          code: tagAbbreviations[tag.name] || tag.name,
        }));
        setTags(tagsWithAbbreviations);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setError("Failed to fetch tags");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading && !tags.length) {
    return <div className="p-4 text-muted-foreground">Loading tags...</div>;
  }

  if (error) {
    return <div className="p-4 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="w-64 border-r bg-card p-6 flex flex-col justify-between h-full overflow-y-auto">
      <div className="space-y-8">
        {/* Workflow Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Workflow
          </h2>
          <div className="space-y-2">
            <Link
              href="/workflow"
              className={`block w-full text-left ${
                pathname === "/workflow" && !searchParams.get("tag")
                  ? "text-primary"
                  : "text-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">All</span>
                <Badge variant="secondary" className="text-sm">
                  {recentOrders.length}
                </Badge>
              </div>
            </Link>
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Tags
          </h2>
          <div className="space-y-3">
            {tags.map((tag) => (
              <Link
                key={tag.code}
                href={`/workflow?tag=${tag.name}`}
                className={`block w-full text-left ${
                  pathname === "/workflow" &&
                  searchParams.get("tag") === tag.name
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-lg font-medium">{tag.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/workflow?tag=${order.mainTag}`}
                  className="block w-full text-left text-foreground"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-500"
                            : order.status === "in_progress"
                            ? "bg-blue-500"
                            : order.status === "completed"
                            ? "bg-green-500"
                            : order.status === "cancelled"
                            ? "bg-red-500"
                            : "bg-muted"
                        }`}
                      />
                      <span className="text-lg font-medium">
                        #{order.orderNumber}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent orders.</p>
            )}
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="flex items-center gap-2 border-t pt-4 mt-8">
        <div className="w-8 h-8 bg-muted rounded-full"></div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            Alex Turner
          </div>
          <div className="text-xs text-muted-foreground">Production Lead</div>
        </div>
        <div className="ml-auto">
          <svg
            className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
