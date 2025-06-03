"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "./ImageGallery";

interface Tag {
  name: string;
  color: string;
  code?: string;
}

interface WorkflowTableProps {
  orders: Array<{
    jobNumber: string;
    customerName: string;
    title: string;
    status: string;
    assignedTo: string | null;
    dueDate: string | null;
    tags: Tag[];
    images?: Array<{
      asset_tag: string;
      thumbnail_url: string;
      high_res_url: string;
      thumbnail_base_path: string;
      high_res_base_path: string;
    }> | null;
  }>;
}

// Status color mapping
const statusColors: Record<string, { bg: string; text: string }> = {
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-200",
  },
  in_progress: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-200",
  },
  completed: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-200",
  },
  cancelled: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-200",
  },
  approved: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-200",
  },
};

// Status icon mapping
const statusIcons: Record<string, string> = {
  pending: "⏳",
  in_progress: "🔄",
  completed: "✅",
  cancelled: "❌",
  approved: "✓",
};

// Due date status icons
const dueDateIcons: Record<string, { icon: string; color: string }> = {
  overdue: { icon: "⚠️", color: "text-red-600 dark:text-red-400" },
  today: { icon: "📅", color: "text-yellow-600 dark:text-yellow-400" },
  upcoming: { icon: "📆", color: "text-green-600 dark:text-green-400" },
  no_date: { icon: "❓", color: "text-gray-600 dark:text-gray-400" },
};

// Tag abbreviations mapping
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

export function WorkflowTable({ orders }: WorkflowTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  );

  const getStatusStyle = (status: string) => {
    const statusKey = status.toLowerCase().replace(" ", "_");
    const colors = statusColors[statusKey] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
    };
    const icon = statusIcons[statusKey] || "•";

    return {
      className: `inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${colors.bg} ${colors.text}`,
      icon,
    };
  };

  const getTagStyle = (color: string) => {
    // Convert hex color to RGB for background opacity
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    return {
      background: `rgba(${r}, ${g}, ${b}, 0.1)`,
      color: color,
    };
  };

  const handleTagClick = (tagName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tag", tagName);
    router.push(`/workflow?${params.toString()}`);
  };

  const handleDueDateSort = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newDirection);
    router.push(`/workflow?${params.toString()}`);
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return { days: null, status: "no_date" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { days: Math.abs(diffDays), status: "overdue" };
    if (diffDays === 0) return { days: 0, status: "today" };
    return { days: diffDays, status: "upcoming" };
  };

  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [orders, sortDirection]);

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-5 px-6 w-[100px]">Job #</TableHead>
              <TableHead className="py-5 px-6 w-[140px]">
                Customer Name
              </TableHead>
              <TableHead className="py-5 px-6 w-[120px]">Images</TableHead>
              <TableHead className="py-5 px-6">Title</TableHead>
              <TableHead className="py-5 px-6 w-[130px]">Status</TableHead>
              <TableHead className="py-5 px-6 w-[120px]">Assigned To</TableHead>
              <TableHead className="py-5 px-6 w-[140px]">
                <Button
                  variant="ghost"
                  onClick={handleDueDateSort}
                  className="flex items-center gap-1"
                >
                  Due Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="py-5 px-6 w-[150px]">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const dueInfo = getDaysUntilDue(order.dueDate);
              const dueIcon = dueDateIcons[dueInfo.status];

              return (
                <TableRow key={order.jobNumber} className="hover:bg-muted/50">
                  <TableCell className="py-6 px-6 font-medium">
                    {order.jobNumber}
                  </TableCell>
                  <TableCell className="py-6 px-6 font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="py-6 px-6">
                    {order.images && order.images.length > 0 ? (
                      <ImageGallery images={order.images} />
                    ) : (
                      <span className="text-muted-foreground">No images</span>
                    )}
                  </TableCell>
                  <TableCell className="py-6 px-6">{order.title}</TableCell>
                  <TableCell className="py-6 px-6">
                    <Badge
                      variant="secondary"
                      className={statusStyle.className}
                    >
                      <span className="text-base mr-1">{statusStyle.icon}</span>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 px-6">
                    {order.assignedTo || "Unassigned"}
                  </TableCell>
                  <TableCell className="py-6 px-6">
                    {order.dueDate ? (
                      <div className="flex items-center gap-2">
                        <span className={dueIcon.color}>{dueIcon.icon}</span>
                        <span className="text-sm">
                          {dueInfo.days === 0
                            ? "Today"
                            : dueInfo.status === "overdue"
                            ? `${dueInfo.days} days overdue`
                            : `in ${dueInfo.days} days`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No due date
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-6 px-6 max-w-[150px]">
                    <div className="flex flex-wrap gap-1.5 max-w-full">
                      {order.tags.map((tag) => (
                        <Badge
                          key={tag.name}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent text-xs px-2 py-1 whitespace-nowrap"
                          style={getTagStyle(tag.color)}
                          onClick={() => handleTagClick(tag.name)}
                        >
                          {tagAbbreviations[tag.name] || tag.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
