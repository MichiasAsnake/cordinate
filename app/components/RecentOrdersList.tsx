"use client";

import React from "react";
import { useRecentOrders } from "../../lib/hooks/useRecentOrders";
import Link from "next/link";

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800" },
  completed: { bg: "bg-green-100", text: "text-green-800" },
  cancelled: { bg: "bg-red-100", text: "text-red-800" },
  approved: { bg: "bg-purple-100", text: "text-purple-800" },
};

export default function RecentOrdersList() {
  const { recentOrders } = useRecentOrders();

  if (recentOrders.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-300">
      <h3 className="text-md font-semibold mb-3">Recent Orders</h3>
      <ul className="space-y-2">
        {recentOrders.map((order) => {
          const statusKey = order.status.toLowerCase().replace(" ", "_");
          const statusColor = statusColors[statusKey] || {
            bg: "bg-gray-100",
            text: "text-gray-800",
          };

          return (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="block p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusColor.bg} ${statusColor.text}`}
                  ></span>
                  <span className="text-sm font-medium">
                    {order.orderNumber}
                  </span>
                  {order.mainTag && (
                    <span className="text-xs text-gray-500">
                      ({order.mainTag})
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
