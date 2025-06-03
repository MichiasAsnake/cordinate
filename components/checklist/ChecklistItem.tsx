"use client";

import React from "react";
import { Calendar, User, Building, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChecklistItem as ChecklistItemType } from "@/lib/types/checklist";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onRemove?: (itemId: string) => void;
}

export function ChecklistItem({ item, onRemove }: ChecklistItemProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      review: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
    if (diffDays <= 3) return { days: diffDays, status: "urgent" };
    return { days: diffDays, status: "upcoming" };
  };

  const dueInfo = getDaysUntilDue(item.order.dueDate);

  return (
    <div
      className={`p-4 border rounded-lg space-y-3 transition-colors ${
        item.completed
          ? "bg-muted/30 border-muted"
          : "bg-background hover:bg-muted/20 border-border"
      }`}
    >
      {/* Header with job number and remove button */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-medium text-sm ${
                item.completed ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {item.order.jobNumber}
            </span>
            <Badge className={`text-xs ${getStatusColor(item.order.status)}`}>
              {item.order.status.replace("_", " ")}
            </Badge>
            {dueInfo.status === "overdue" && (
              <Badge variant="destructive" className="text-xs">
                {dueInfo.days} days overdue
              </Badge>
            )}
            {dueInfo.status === "today" && (
              <Badge
                variant="secondary"
                className="text-xs bg-orange-100 text-orange-800"
              >
                Due today
              </Badge>
            )}
            {dueInfo.status === "urgent" &&
              dueInfo.days &&
              dueInfo.days <= 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-amber-100 text-amber-800"
                >
                  Due in {dueInfo.days} day{dueInfo.days !== 1 ? "s" : ""}
                </Badge>
              )}
          </div>
        </div>

        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Title */}
      <div>
        <h3
          className={`text-sm font-medium leading-tight ${
            item.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {item.order.title}
        </h3>
      </div>

      {/* Details row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        {item.order.customerName && (
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            <span className="truncate max-w-24">{item.order.customerName}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(item.order.dueDate)}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Added:</span>
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tags */}
      {item.order.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.order.tags.map((tag) => (
            <Badge
              key={tag.name}
              variant="outline"
              className="text-xs"
              style={{
                borderColor: tag.color,
                color: tag.color,
                backgroundColor: `${tag.color}10`,
              }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Notes preview */}
      {item.notes && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-primary/20">
          <span className="font-medium">Note: </span>
          <span className={item.completed ? "line-through" : ""}>
            {item.notes}
          </span>
        </div>
      )}
    </div>
  );
}
