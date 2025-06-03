"use client";

import React from "react";
import { Plus, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChecklist } from "@/lib/hooks/useChecklist";
import { ChecklistHeader } from "./ChecklistHeader";
import { ChecklistItem } from "./ChecklistItem";

interface ChecklistProps {
  className?: string;
  onAddItemsClick?: () => void;
}

export function Checklist({ className = "", onAddItemsClick }: ChecklistProps) {
  const { checklist, stats, isLoading, removeItem } = useChecklist();

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <ChecklistHeader stats={stats} isLoading={true} />
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-3 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-6 w-16 bg-muted rounded"></div>
                </div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
                <div className="flex gap-2">
                  <div className="h-3 w-16 bg-muted rounded"></div>
                  <div className="h-3 w-20 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (checklist.items.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <ChecklistHeader stats={stats} />
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Your checklist is empty
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Add orders to your daily checklist to track your progress and stay
              organized.
            </p>
            {onAddItemsClick && (
              <Button onClick={onAddItemsClick} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Orders
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group items by completion status
  const incompleteItems = checklist.items.filter((item) => !item.completed);
  const completedItems = checklist.items.filter((item) => item.completed);

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <ChecklistHeader stats={stats} />

        <div className="space-y-4">
          {/* Incomplete items */}
          {incompleteItems.length > 0 && (
            <div className="space-y-3">
              {incompleteItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}

          {/* Completed items */}
          {completedItems.length > 0 && (
            <div className="space-y-3">
              {incompleteItems.length > 0 && (
                <div className="flex items-center gap-2 mt-6 mb-3">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs text-muted-foreground px-2">
                    Completed ({completedItems.length})
                  </span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
              )}
              {completedItems.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add items footer */}
        {onAddItemsClick && checklist.items.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onAddItemsClick}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add More Orders
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
