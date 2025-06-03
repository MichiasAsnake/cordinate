"use client";

import React from "react";
import { Calendar, Clock, User, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobDataEnhanced } from "@/lib/types/JobDataEnhanced";

interface JobHeaderProps {
  jobData: JobDataEnhanced;
  loading?: boolean;
  className?: string;
}

// Status color mapping for badges
const STATUS_COLORS = {
  pending:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  in_progress:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  completed:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  on_hold:
    "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
  cancelled:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  shipped:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  approved:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
} as const;

// Priority color mapping
const PRIORITY_COLORS = {
  low: "text-gray-600 dark:text-gray-400",
  medium: "text-blue-600 dark:text-blue-400",
  high: "text-orange-600 dark:text-orange-400",
  urgent: "text-red-600 dark:text-red-400",
} as const;

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "No due date";

  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${
      Math.abs(diffDays) !== 1 ? "s" : ""
    }`;
  } else if (diffDays === 0) {
    return "Due today";
  } else if (diffDays === 1) {
    return "Due tomorrow";
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

function getDueDateStyle(dateString: string | null | undefined): string {
  if (!dateString) return "text-muted-foreground";

  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "text-red-600 dark:text-red-400 font-semibold";
  } else if (diffDays === 0) {
    return "text-orange-600 dark:text-orange-400 font-semibold";
  } else if (diffDays === 1) {
    return "text-yellow-600 dark:text-yellow-400 font-medium";
  } else {
    return "text-muted-foreground";
  }
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status
    .toLowerCase()
    .replace(/\s+/g, "_") as keyof typeof STATUS_COLORS;
  const statusColor = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.pending;

  return (
    <Badge
      variant="outline"
      className={`${statusColor} capitalize font-medium px-3 py-1`}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function JobHeader({
  jobData,
  loading = false,
  className,
}: JobHeaderProps) {
  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-6 bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const priorityColor =
    PRIORITY_COLORS[jobData.order.priority as keyof typeof PRIORITY_COLORS] ||
    PRIORITY_COLORS.medium;
  const dueDateText = formatDate(jobData.order.due_date);
  const dueDateStyle = getDueDateStyle(jobData.order.due_date);

  return (
    <Card className={`w-full border-l-4 border-l-primary ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side: Job identification */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Job #{jobData.jobNumber}
              </h1>
              <StatusBadge status={jobData.order.status} />
            </div>

            <h2 className="text-lg lg:text-xl font-semibold text-foreground mb-2 line-clamp-2">
              {jobData.order.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{jobData.customer.name}</span>
              </div>

              {jobData.order.priority && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className={`capitalize font-medium ${priorityColor}`}>
                    {jobData.order.priority} Priority
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Timeline and metadata */}
          <div className="flex flex-col lg:items-end gap-2 lg:min-w-0 lg:flex-shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className={dueDateStyle}>{dueDateText}</span>
            </div>

            {jobData.order.ship_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Ship:{" "}
                  {new Date(jobData.order.ship_date).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
            )}

            {jobData.order.total_value && (
              <div className="text-lg font-semibold text-foreground">
                $
                {jobData.order.total_value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            )}
          </div>
        </div>

        {/* Process Tags Row */}
        {jobData.tags && jobData.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {jobData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-full hover:bg-muted/30 transition-colors text-sm"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="font-medium">{tag.name}</span>
                  <Badge
                    variant={
                      tag.status === "in_progress" ? "default" : "secondary"
                    }
                    className="text-xs h-4"
                  >
                    {tag.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}

export default JobHeader;
