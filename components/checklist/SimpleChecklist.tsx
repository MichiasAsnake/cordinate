"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  X,
  Calendar,
  User,
  Edit2,
  Check,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OrderForChecklist } from "@/lib/types/checklist";
import { getOrders, getTags } from "@/app/workflow/actions";

// Simplified checklist item with completion status
interface ChecklistItem extends OrderForChecklist {
  id: string;
  completed: boolean;
  addedAt: string;
  comment?: string;
}

// Named checklist
interface ChecklistData {
  name: string;
  items: ChecklistItem[];
  createdAt: string;
  lastModified: string;
}

// Mock orders for search
const MOCK_ORDERS = [
  {
    id: "1",
    jobNumber: "DP-2024-001",
    title: "Company Logo Embroidery",
    dueDate: "2025-02-01",
    status: "pending" as const,
    customerName: "ABC Corporation",
    tags: [
      { name: "Embroidery", color: "#3B82F6" },
      { name: "Apparel", color: "#10B981" },
    ],
  },
  {
    id: "2",
    jobNumber: "DP-2024-002",
    title: "Event T-Shirts Screen Print",
    dueDate: "2025-01-30",
    status: "in_progress" as const,
    customerName: "Event Planners LLC",
    tags: [
      { name: "Screen Print", color: "#F59E0B" },
      { name: "Apparel", color: "#10B981" },
    ],
  },
  {
    id: "3",
    jobNumber: "DP-2024-003",
    title: "Promotional Mugs",
    dueDate: null,
    status: "pending" as const,
    customerName: "Marketing Pro",
    tags: [{ name: "Promotional", color: "#8B5CF6" }],
  },
  {
    id: "4",
    jobNumber: "DP-2024-004",
    title: "Business Cards",
    dueDate: "2025-02-05",
    status: "review" as const,
    customerName: "Tech Startup Inc",
    tags: [{ name: "Print", color: "#EF4444" }],
  },
  {
    id: "5",
    jobNumber: "DP-2024-005",
    title: "Conference Banners",
    dueDate: "2025-01-28",
    status: "in_progress" as const,
    customerName: "Event Co",
    tags: [{ name: "Large Format", color: "#8B5CF6" }],
  },
];

const STORAGE_KEY = "simple-checklists";

export function SimpleChecklist() {
  const [mounted, setMounted] = useState(false);
  const [checklists, setChecklists] = useState<Record<string, ChecklistData>>(
    {}
  );
  const [currentListName, setCurrentListName] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentValue, setCommentValue] = useState("");
  const [availableOrders, setAvailableOrders] = useState<OrderForChecklist[]>(
    []
  );
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [availableTags, setAvailableTags] = useState<
    Array<{ name: string; color: string }>
  >([]);
  const [availableStatuses] = useState([
    "pending",
    "in_progress",
    "review",
    "completed",
    "cancelled",
  ]);

  // Load data only on client side to avoid SSR issues
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tags from API
        const tags = await getTags();
        setAvailableTags(
          tags.map((tag) => ({ name: tag.name, color: tag.color }))
        );
      } catch (error) {
        console.error("Error loading tags:", error);
        setAvailableTags([]);
      }

      const savedState = localStorage.getItem("simple-checklists");
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setChecklists(parsed);
          // Set current list to first available list
          const listNames = Object.keys(parsed);
          if (listNames.length > 0) {
            setCurrentListName(listNames[0]);
          }
        } catch (error) {
          console.error("Error parsing saved checklists:", error);
        }
      }
      setMounted(true);
    };

    loadData();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchOrders();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, tagFilter, showSearch]);

  const saveChecklists = (newChecklists: Record<string, ChecklistData>) => {
    setChecklists(newChecklists);
    try {
      localStorage.setItem("simple-checklists", JSON.stringify(newChecklists));
    } catch (error) {
      console.error("Error saving checklists:", error);
    }
  };

  const createNewList = () => {
    if (!newListName.trim()) return;

    const now = new Date().toISOString();
    const newList: ChecklistData = {
      name: newListName.trim(),
      items: [],
      createdAt: now,
      lastModified: now,
    };

    const newChecklists = { ...checklists, [newListName.trim()]: newList };
    saveChecklists(newChecklists);
    setCurrentListName(newListName.trim());
    setNewListName("");
    setIsCreatingList(false);
  };

  const addOrderToList = (order: OrderForChecklist) => {
    if (!currentListName || !checklists[currentListName]) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      ...order,
      completed: false,
      addedAt: new Date().toISOString(),
      comment: "",
    };

    const updatedList = { ...checklists[currentListName] };
    updatedList.items = [...updatedList.items, newItem];
    updatedList.lastModified = new Date().toISOString();

    const newChecklists = { ...checklists, [currentListName]: updatedList };
    saveChecklists(newChecklists);

    // Hide search after adding
    setSearch("");
    setShowSearch(false);
  };

  const toggleItemCompletion = (itemId: string) => {
    if (!currentListName || !checklists[currentListName]) return;

    const updatedList = { ...checklists[currentListName] };
    updatedList.items = updatedList.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updatedList.lastModified = new Date().toISOString();

    const newChecklists = { ...checklists, [currentListName]: updatedList };
    saveChecklists(newChecklists);
  };

  const removeItem = (itemId: string) => {
    if (!currentListName || !checklists[currentListName]) return;

    const updatedList = { ...checklists[currentListName] };
    updatedList.items = updatedList.items.filter((item) => item.id !== itemId);
    updatedList.lastModified = new Date().toISOString();

    const newChecklists = { ...checklists, [currentListName]: updatedList };
    saveChecklists(newChecklists);
  };

  const startEditingComment = (itemId: string, currentComment: string = "") => {
    setEditingComment(itemId);
    setCommentValue(currentComment);
  };

  const saveComment = (itemId: string) => {
    if (!currentListName || !checklists[currentListName]) return;

    const updatedList = { ...checklists[currentListName] };
    updatedList.items = updatedList.items.map((item) =>
      item.id === itemId
        ? { ...item, comment: commentValue.trim() || undefined }
        : item
    );
    updatedList.lastModified = new Date().toISOString();

    const newChecklists = { ...checklists, [currentListName]: updatedList };
    saveChecklists(newChecklists);
    setEditingComment(null);
    setCommentValue("");
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
    setCommentValue("");
  };

  // Filter orders for search
  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (!search) return false;
    const searchLower = search.toLowerCase();
    return (
      order.jobNumber.toLowerCase().includes(searchLower) ||
      order.title.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower)
    );
  });

  // Check if order is already in current list
  const isOrderInList = (jobNumber: string) => {
    if (!currentListName || !checklists[currentListName]) return false;
    return checklists[currentListName].items.some(
      (item) => item.jobNumber === jobNumber
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  const currentList = currentListName ? checklists[currentListName] : null;
  const completedCount =
    currentList?.items.filter((item) => item.completed).length || 0;
  const totalCount = currentList?.items.length || 0;

  // Real function to fetch orders from the workflow API
  const fetchOrders = async (filters: {
    search?: string;
    status?: string;
    tag?: string;
  }): Promise<OrderForChecklist[]> => {
    try {
      // Call the real getOrders function with our filters
      const ordersData = await getOrders({
        search: filters.search,
        status: filters.status === "all" ? undefined : filters.status,
        tags: filters.tag && filters.tag !== "all" ? [filters.tag] : undefined,
      });

      // Transform the data to match our OrderForChecklist interface
      return ordersData.map((order) => ({
        jobNumber: order.jobNumber,
        title: order.title,
        dueDate: order.dueDate,
        status: order.status,
        customerName: order.customerName,
        tags: order.tags,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Return empty array on error instead of failing
      return [];
    }
  };

  const searchOrders = async () => {
    if (!showSearch || search.length < 2) {
      setAvailableOrders([]);
      return;
    }

    setLoadingOrders(true);
    try {
      const orders = await fetchOrders({
        search: search.trim(),
        status: statusFilter === "all" ? undefined : statusFilter,
        tag: tagFilter === "all" ? undefined : tagFilter,
      });
      setAvailableOrders(orders);
    } catch (error) {
      console.error("Error searching orders:", error);
      setAvailableOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!mounted) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        {/* List Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {Object.keys(checklists).map((name) => (
              <button
                key={name}
                onClick={() => setCurrentListName(name)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  currentListName === name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {name}
                <span className="ml-2 text-xs opacity-75">
                  {
                    checklists[name].items.filter((item) => !item.completed)
                      .length
                  }
                </span>
              </button>
            ))}

            {!isCreatingList ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingList(true)}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                New List
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name..."
                  className="w-[120px] h-8"
                  onKeyDown={(e) => e.key === "Enter" && createNewList()}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={createNewList}
                  disabled={!newListName.trim()}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreatingList(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {currentList && (
            <div className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} completed
            </div>
          )}
        </div>

        {/* Add Items Section */}
        {currentListName && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders to add..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  onFocus={() => setShowSearch(true)}
                />
              </div>
              {search && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setShowSearch(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Results */}
            {showSearch && search && (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-muted/50">
                {loadingOrders ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Searching...
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {search.length < 2
                      ? "Type at least 2 characters to search"
                      : "No orders found"}
                  </div>
                ) : (
                  availableOrders.map((order) => {
                    const inList = isOrderInList(order.jobNumber);
                    return (
                      <div
                        key={order.jobNumber}
                        className={`p-2 border rounded text-sm space-y-1 ${
                          inList
                            ? "bg-muted opacity-60"
                            : "bg-background hover:bg-muted/50 cursor-pointer"
                        }`}
                        onClick={() => !inList && addOrderToList(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{order.jobNumber}</div>
                          {inList ? (
                            <Badge variant="secondary" className="text-xs">
                              Added
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                addOrderToList(order);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="text-muted-foreground">
                          {order.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span>{order.customerName || "No customer"}</span>
                          {order.dueDate && (
                            <>
                              <span>•</span>
                              <span>{formatDate(order.dueDate)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {order.tags.map((tag) => (
                            <Badge
                              key={tag.name}
                              variant="outline"
                              className="text-xs"
                              style={{
                                backgroundColor: tag.color + "20",
                                borderColor: tag.color,
                                color: tag.color,
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {!currentListName ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-lg mb-2">No lists yet</div>
            <div className="text-sm">Create a new checklist to get started</div>
          </div>
        ) : currentList?.items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-lg mb-2">Empty checklist</div>
            <div className="text-sm">Search and add orders above</div>
          </div>
        ) : (
          <div className="space-y-2">
            {currentList?.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 border rounded-lg transition-all ${
                  item.completed
                    ? "bg-muted/50 opacity-75"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                <button
                  onClick={() => toggleItemCompletion(item.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors mt-1"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>

                <div
                  className={`flex-1 space-y-1 ${
                    item.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.jobNumber}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.customerName && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.customerName}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.dueDate)}
                    </div>
                  </div>
                </div>

                {/* Comment Section - Right Aligned */}
                <div className="flex-shrink-0 w-40">
                  {editingComment === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={commentValue}
                        onChange={(e) => setCommentValue(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-2 text-xs border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => saveComment(item.id)}
                          className="h-5 px-2 text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditingComment}
                          className="h-5 px-2 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : item.comment ? (
                    <div
                      onClick={() => startEditingComment(item.id, item.comment)}
                      className="text-xs text-muted-foreground bg-muted/50 p-2 rounded cursor-pointer hover:bg-muted/70 transition-colors"
                      title="Click to edit comment"
                    >
                      {item.comment}
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditingComment(item.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      + Add comment
                    </button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
