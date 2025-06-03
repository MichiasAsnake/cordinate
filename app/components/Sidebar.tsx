"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getTags } from "../workflow/actions";
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

export default function Sidebar() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse selected tags from URL on mount and when URL changes
  useEffect(() => {
    const urlTags = searchParams.get("tags");
    if (urlTags) {
      const parsedTags = urlTags.includes(",")
        ? urlTags.split(",").filter(Boolean)
        : [urlTags];
      setSelectedTags(parsedTags);
    } else {
      setSelectedTags([]);
    }
  }, [searchParams]);

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

  const handleTagClick = (tagName: string) => {
    let newSelectedTags: string[];

    if (selectedTags.includes(tagName)) {
      // Remove tag if already selected
      newSelectedTags = selectedTags.filter((tag) => tag !== tagName);
    } else {
      // Add tag if not selected
      newSelectedTags = [...selectedTags, tagName];
    }

    // Update URL with new tag selection
    const params = new URLSearchParams(searchParams.toString());

    if (newSelectedTags.length > 0) {
      params.set("tags", newSelectedTags.join(","));
    } else {
      params.delete("tags");
    }

    // Navigate to workflow page with updated parameters
    router.push(`/workflow?${params.toString()}`);
  };

  const handleAllOrdersClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    router.push(`/workflow?${params.toString()}`);
  };

  if (loading && !tags.length) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-destructive">Error: {error}</div>;
  }

  return (
    <div className="w-64 border-r bg-card h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Branding Section */}
        <div className="p-6 pb-0">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-75 transition-opacity"
          >
            {/* Space for logo */}
            <img
              src="/cordinate icon.png"
              alt="Cordinate"
              width={32}
              height={32}
            />
            <h1 className="text-lg font-medium text-foreground">Cordinate</h1>
          </Link>
        </div>

        <div className="px-6 space-y-6">
          {/* Workflow Section */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">
              Workflow
            </h2>
            <div className="space-y-1">
              <button
                onClick={handleAllOrdersClick}
                className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${
                  pathname === "/workflow" && selectedTags.length === 0
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">All Orders</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tags Section - Multi-select */}
          <div className="space-y-1">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);

              return (
                <button
                  key={tag.code}
                  onClick={() => handleTagClick(tag.name)}
                  className={`block w-full text-left py-2 px-3 rounded-md transition-all duration-200 ${
                    isSelected
                      ? "bg-accent text-accent-foreground shadow-sm border border-primary/20"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
                          : ""
                      }`}
                      style={{ backgroundColor: tag.color }}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "font-semibold" : ""
                      }`}
                    >
                      {tag.name}
                    </span>
                    {isSelected && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-xs px-1.5 py-0.5"
                      >
                        ✓
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Tags Summary */}
          {selectedTags.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">
                Active Filters ({selectedTags.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tagName) => {
                  const tag = tags.find((t) => t.name === tagName);
                  return (
                    <Badge
                      key={tagName}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => handleTagClick(tagName)}
                      title="Click to remove"
                    >
                      {tag?.code || tagName}
                      <span className="ml-1">×</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
