"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageRefreshButtonProps {
  orderIds?: number[];
  onRefreshComplete?: (result: {
    refreshedCount: number;
    checkedCount: number;
  }) => void;
}

export function ImageRefreshButton({
  orderIds,
  onRefreshComplete,
}: ImageRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<string>("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setStatus("Checking for expired images...");

    try {
      const response = await fetch("/api/refresh-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus(`✅ ${result.message}`);
        onRefreshComplete?.(result);
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error refreshing images:", error);
      setStatus("❌ Failed to refresh images");
    } finally {
      setIsRefreshing(false);

      // Clear status after 5 seconds
      setTimeout(() => setStatus(""), 5000);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/refresh-images");
      const result = await response.json();

      if (result.ordersNeedingRefresh > 0) {
        setStatus(
          `⚠️ ${result.ordersNeedingRefresh} orders have expired images`
        );
      } else {
        setStatus(
          `✅ All images are current (${result.totalOrdersWithImages} orders checked)`
        );
      }
    } catch (error) {
      console.error("Error checking image status:", error);
      setStatus("❌ Failed to check image status");
    }

    // Clear status after 5 seconds
    setTimeout(() => setStatus(""), 5000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Images"}
        </Button>

        <Button
          onClick={checkStatus}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          Check Status
        </Button>
      </div>

      {status && (
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
          {status}
        </div>
      )}
    </div>
  );
}
