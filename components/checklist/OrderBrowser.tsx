"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChecklist } from "@/lib/hooks/useChecklist";
import { OrderForChecklist } from "@/lib/types/checklist";

interface Order extends OrderForChecklist {
  id: string;
  orderId: number;
  assignedTo: string | null;
  images?: Array<{
    asset_tag: string;
    thumbnail_url: string;
    high_res_url: string;
  }> | null;
}

interface OrderBrowserProps {
  onOrderAdded?: (order: OrderForChecklist) => void;
}

const ORDER_STATUSES = [
  "pending",
  "in_progress",
  "review",
  "completed",
  "cancelled",
];

const DEFAULT_TAGS = [
  "Embroidery",
  "Screen Print",
  "Apparel",
  "Promotional",
  "Heat Transfer",
];

// Mock function to simulate order fetching - replace with actual API call
const mockGetOrders = async (filters: {
  search?: string;
  status?: string;
  tag?: string;
}): Promise<Order[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock data - replace with actual API call to getOrders
  const mockOrders: Order[] = [
    {
      id: "1",
      orderId: 1,
      jobNumber: "DP-2024-001",
      title: "Company Logo Embroidery",
      dueDate: "2025-02-01",
      status: "pending",
      customerName: "ABC Corporation",
      assignedTo: "John Doe",
      tags: [
        { name: "Embroidery", color: "#3B82F6" },
        { name: "Apparel", color: "#10B981" },
      ],
    },
    {
      id: "2",
      orderId: 2,
      jobNumber: "DP-2024-002",
      title: "Event T-Shirts Screen Print",
      dueDate: "2025-01-30",
      status: "in_progress",
      customerName: "Event Planners LLC",
      assignedTo: "Jane Smith",
      tags: [
        { name: "Screen Print", color: "#F59E0B" },
        { name: "Apparel", color: "#10B981" },
      ],
    },
    {
      id: "3",
      orderId: 3,
      jobNumber: "DP-2024-003",
      title: "Promotional Mugs",
      dueDate: null,
      status: "pending",
      customerName: "Marketing Pro",
      assignedTo: null,
      tags: [{ name: "Promotional", color: "#8B5CF6" }],
    },
  ];

  // Apply filters
  return mockOrders.filter((order) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        order.jobNumber.toLowerCase().includes(searchLower) ||
        order.title.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        false;
      if (!matchesSearch) return false;
    }

    if (filters.status && order.status !== filters.status) {
      return false;
    }

    if (filters.tag) {
      const hasTag = order.tags.some((tag) => tag.name === filters.tag);
      if (!hasTag) return false;
    }

    return true;
  });
};

export function OrderBrowser({ onOrderAdded }: OrderBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const { addOrder, isOrderInList } = useChecklist();

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, tagFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await mockGetOrders({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        tag: tagFilter === "all" ? undefined : tagFilter,
      });
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = (order: Order) => {
    const checklistOrder: OrderForChecklist = {
      jobNumber: order.jobNumber,
      title: order.title,
      dueDate: order.dueDate,
      status: order.status,
      customerName: order.customerName,
      tags: order.tags,
    };

    const added = addOrder(checklistOrder);
    if (added) {
      onOrderAdded?.(checklistOrder);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTagFilter("all");
  };

  const hasActiveFilters =
    search ||
    (statusFilter && statusFilter !== "all") ||
    (tagFilter && tagFilter !== "all");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      review: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="w-full max-w-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Add to Checklist</span>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {DEFAULT_TAGS.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <Filter className="h-3 w-3 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Orders List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No orders found
                </div>
              ) : (
                orders.map((order) => {
                  const isInChecklist = isOrderInList(order.jobNumber);

                  return (
                    <div
                      key={order.id}
                      className={`p-3 border rounded-lg space-y-2 ${
                        isInChecklist
                          ? "bg-muted opacity-60"
                          : "bg-background hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {order.jobNumber}
                            </span>
                            <Badge
                              className={`text-xs ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {order.title}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant={isInChecklist ? "secondary" : "default"}
                          onClick={() => handleAddOrder(order)}
                          disabled={isInChecklist}
                          className="ml-2 flex-shrink-0"
                        >
                          {isInChecklist ? "Added" : "Add"}
                        </Button>
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground gap-4">
                        {order.customerName && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.customerName}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.dueDate)}
                        </div>
                      </div>

                      {order.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {order.tags.map((tag) => (
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
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
