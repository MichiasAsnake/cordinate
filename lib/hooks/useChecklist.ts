"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChecklistState,
  ChecklistItem,
  ChecklistStats,
  OrderForChecklist,
} from "@/lib/types/checklist";
import {
  loadChecklistState,
  addOrderToChecklist,
  removeChecklistItem,
  updateChecklistItemCompletion,
  updateChecklistItemNotes,
  clearChecklist,
  isOrderInChecklist,
} from "@/lib/utils/checklist-storage";

export interface UseChecklistReturn {
  /** Current checklist state */
  checklist: ChecklistState;

  /** Checklist statistics */
  stats: ChecklistStats;

  /** Loading state for initial load */
  isLoading: boolean;

  /** Add an order to the checklist */
  addOrder: (order: OrderForChecklist) => ChecklistItem | null;

  /** Remove an item from the checklist */
  removeItem: (itemId: string) => boolean;

  /** Toggle completion status of an item */
  toggleCompletion: (itemId: string) => boolean;

  /** Update notes for an item */
  updateNotes: (itemId: string, notes: string) => boolean;

  /** Clear entire checklist */
  clear: () => boolean;

  /** Check if an order is already in checklist */
  isOrderInList: (jobNumber: string) => boolean;

  /** Refresh checklist from localStorage */
  refresh: () => void;
}

/**
 * Calculate checklist statistics
 */
function calculateStats(items: ChecklistItem[]): ChecklistStats {
  const total = items.length;
  const completed = items.filter((item) => item.completed).length;
  const remaining = total - completed;
  const completionPercentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    remaining,
    completionPercentage,
  };
}

/**
 * Custom hook for checklist management
 */
export function useChecklist(): UseChecklistReturn {
  const [checklist, setChecklist] = useState<ChecklistState>(() =>
    loadChecklistState()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    try {
      const initialState = loadChecklistState();
      setChecklist(initialState);
    } catch (error) {
      console.error("Error loading initial checklist state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate stats whenever checklist changes
  const stats = calculateStats(checklist.items);

  // Refresh checklist from localStorage
  const refresh = useCallback(() => {
    try {
      const freshState = loadChecklistState();
      setChecklist(freshState);
    } catch (error) {
      console.error("Error refreshing checklist:", error);
    }
  }, []);

  // Add order to checklist
  const addOrder = useCallback(
    (order: OrderForChecklist): ChecklistItem | null => {
      try {
        const newItem = addOrderToChecklist(order);
        if (newItem) {
          refresh(); // Refresh state from localStorage
        }
        return newItem;
      } catch (error) {
        console.error("Error adding order:", error);
        return null;
      }
    },
    [refresh]
  );

  // Remove item from checklist
  const removeItem = useCallback(
    (itemId: string): boolean => {
      try {
        const success = removeChecklistItem(itemId);
        if (success) {
          refresh(); // Refresh state from localStorage
        }
        return success;
      } catch (error) {
        console.error("Error removing item:", error);
        return false;
      }
    },
    [refresh]
  );

  // Toggle completion status
  const toggleCompletion = useCallback(
    (itemId: string): boolean => {
      try {
        const item = checklist.items.find((item) => item.id === itemId);
        if (!item) {
          console.warn("Item not found:", itemId);
          return false;
        }

        const success = updateChecklistItemCompletion(itemId, !item.completed);
        if (success) {
          refresh(); // Refresh state from localStorage
        }
        return success;
      } catch (error) {
        console.error("Error toggling completion:", error);
        return false;
      }
    },
    [checklist.items, refresh]
  );

  // Update notes
  const updateNotes = useCallback(
    (itemId: string, notes: string): boolean => {
      try {
        const success = updateChecklistItemNotes(itemId, notes);
        if (success) {
          refresh(); // Refresh state from localStorage
        }
        return success;
      } catch (error) {
        console.error("Error updating notes:", error);
        return false;
      }
    },
    [refresh]
  );

  // Clear entire checklist
  const clear = useCallback((): boolean => {
    try {
      const success = clearChecklist();
      if (success) {
        refresh(); // Refresh state from localStorage
      }
      return success;
    } catch (error) {
      console.error("Error clearing checklist:", error);
      return false;
    }
  }, [refresh]);

  // Check if order is in checklist
  const isOrderInList = useCallback((jobNumber: string): boolean => {
    try {
      return isOrderInChecklist(jobNumber);
    } catch (error) {
      console.error("Error checking if order is in checklist:", error);
      return false;
    }
  }, []);

  return {
    checklist,
    stats,
    isLoading,
    addOrder,
    removeItem,
    toggleCompletion,
    updateNotes,
    clear,
    isOrderInList,
    refresh,
  };
}
