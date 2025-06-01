"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface FilterBarProps {
  selectedStatus?: string;
  selectedPriority?: string;
  selectedDateRange?: string;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "⏳ Pending" },
  { value: "in_progress", label: "🔄 In Progress" },
  { value: "completed", label: "✅ Completed" },
  { value: "cancelled", label: "❌ Cancelled" },
  { value: "approved", label: "✓ Approved" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "🔴 High" },
  { value: "medium", label: "🟡 Medium" },
  { value: "low", label: "🟢 Low" },
];

const dateRangeOptions = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "📅 Today" },
  { value: "week", label: "📆 This Week" },
  { value: "month", label: "📅 This Month" },
  { value: "overdue", label: "⚠️ Overdue" },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const tagsData = await response.json();
        // Update the code field with abbreviations
        const tagsWithAbbreviations = tagsData.map((tag: Tag) => ({
          ...tag,
          code: tagAbbreviations[tag.name] || tag.name,
        }));
        setTags(tagsWithAbbreviations);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={searchParams.get("tag") || "all"}
          onValueChange={(value) => handleFilterChange("tag", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.code} value={tag.name}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("dateRange") || "all"}
          onValueChange={(value) => handleFilterChange("dateRange", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Dates" />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("sort") || "all"}
          onValueChange={(value) => handleFilterChange("sort", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sort By</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
            <SelectItem value="desc">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
