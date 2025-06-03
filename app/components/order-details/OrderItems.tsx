"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderLineItem } from "@/lib/types/JobDataEnhanced";

interface OrderItemsProps {
  orderItems: OrderLineItem[];
  loading?: boolean;
  className?: string;
}

// Status color mapping
const STATUS_CONFIG = {
  pending: { variant: "secondary" as const, color: "text-yellow-600" },
  in_progress: { variant: "default" as const, color: "text-blue-600" },
  completed: { variant: "default" as const, color: "text-green-600" },
  on_hold: { variant: "destructive" as const, color: "text-red-600" },
} as const;

export function OrderItems({
  orderItems,
  loading = false,
  className,
}: OrderItemsProps) {
  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-40 mb-2"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-3 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total value
  const totalValue = orderItems.reduce(
    (sum, item) => sum + (item.total_cost || 0),
    0
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Order Line Items
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {orderItems.length} items
            </Badge>
            <Badge variant="outline" className="text-xs">
              ${totalValue.toFixed(2)} total
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {orderItems.map((item, index) => {
            const statusConfig =
              STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

            return (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                role="article"
                aria-labelledby={`item-${index}-title`}
              >
                <div className="flex gap-4">
                  {/* Product Image Placeholder */}
                  <div
                    className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0"
                    role="img"
                    aria-label={`Product image for ${item.description}`}
                  >
                    <div className="text-xs text-center text-muted-foreground">
                      <div className="text-lg mb-1">👕</div>
                      <div className="font-medium">
                        {item.specifications?.size || "SIZE"}
                      </div>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div
                          id={`item-${index}-title`}
                          className="font-medium text-base"
                        >
                          {item.description}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.asset_sku} • Asset: {item.asset_tag}
                        </div>
                      </div>
                      <Badge
                        variant={statusConfig.variant}
                        className="flex-shrink-0"
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>

                    {/* Specifications Grid */}
                    {item.specifications && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        {Object.entries(item.specifications).map(
                          ([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium text-muted-foreground capitalize">
                                {key}:
                              </span>
                              <span className="ml-1">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Pricing and Quantity */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Qty:</span>
                          <span className="ml-1 font-medium">
                            {item.quantity}
                          </span>
                        </div>
                        {item.unit_cost && (
                          <div>
                            <span className="text-muted-foreground">Unit:</span>
                            <span className="ml-1 font-medium">
                              ${item.unit_cost.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {item.total_cost && (
                          <div>
                            <span className="text-muted-foreground">
                              Total:
                            </span>
                            <span className="ml-1 font-semibold text-green-600 dark:text-green-400">
                              ${item.total_cost.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comments */}
                    {item.comments && (
                      <div className="mt-3 text-xs bg-orange-50 dark:bg-orange-950/20 p-2 rounded border-l-2 border-orange-400">
                        <span className="font-medium text-orange-900 dark:text-orange-100">
                          Note:
                        </span>
                        <span className="ml-1 text-orange-800 dark:text-orange-200">
                          {item.comments}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary footer */}
        {orderItems.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Total Quantity:{" "}
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                Order Total: ${totalValue.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OrderItems;
