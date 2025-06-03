"use client";

import React from "react";
import { CheckCircle2, ListTodo } from "lucide-react";
import { ChecklistStats } from "@/lib/types/checklist";

interface ChecklistHeaderProps {
  stats: ChecklistStats;
  isLoading?: boolean;
}

export function ChecklistHeader({
  stats,
  isLoading = false,
}: ChecklistHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Daily Checklist</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <ListTodo className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Daily Checklist</h2>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>{stats.completed}</span>
        </div>
        <span>/</span>
        <span>{stats.total}</span>
        {stats.total > 0 && (
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {stats.completionPercentage}%
          </span>
        )}
      </div>
    </div>
  );
}
