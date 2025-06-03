// Checklist localStorage utilities

import {
  ChecklistState,
  ChecklistItem,
  OrderForChecklist,
  DEFAULT_CHECKLIST_STATE,
  STORAGE_KEY,
  CHECKLIST_VERSION,
} from "@/lib/types/checklist";

/**
 * Safely parse JSON with error handling
 */
function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.warn("Failed to parse JSON from localStorage:", error);
    return fallback;
  }
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn("localStorage is not available:", error);
    return false;
  }
}

/**
 * Load checklist state from localStorage
 */
export function loadChecklistState(): ChecklistState {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_CHECKLIST_STATE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_CHECKLIST_STATE;
    }

    const parsed = safeJsonParse(stored, DEFAULT_CHECKLIST_STATE);

    // Validate and migrate if necessary
    if (parsed.version !== CHECKLIST_VERSION) {
      console.log("Checklist version mismatch, using default state");
      return DEFAULT_CHECKLIST_STATE;
    }

    // Validate structure
    if (!Array.isArray(parsed.items)) {
      console.warn("Invalid checklist structure, using default state");
      return DEFAULT_CHECKLIST_STATE;
    }

    return parsed;
  } catch (error) {
    console.error("Error loading checklist state:", error);
    return DEFAULT_CHECKLIST_STATE;
  }
}

/**
 * Save checklist state to localStorage
 */
export function saveChecklistState(state: ChecklistState): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn("Cannot save checklist: localStorage not available");
    return false;
  }

  try {
    const stateToSave: ChecklistState = {
      ...state,
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    return true;
  } catch (error) {
    console.error("Error saving checklist state:", error);
    return false;
  }
}

/**
 * Generate unique ID for checklist items
 */
function generateId(): string {
  return `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add an order to the checklist
 */
export function addOrderToChecklist(
  order: OrderForChecklist
): ChecklistItem | null {
  try {
    const currentState = loadChecklistState();

    // Check if order is already in checklist
    const existingItem = currentState.items.find(
      (item) => item.order.jobNumber === order.jobNumber
    );

    if (existingItem) {
      console.warn("Order already exists in checklist:", order.jobNumber);
      return existingItem;
    }

    const newItem: ChecklistItem = {
      id: generateId(),
      order: { ...order },
      completed: false,
      notes: "",
      createdAt: new Date().toISOString(),
      completedAt: null,
      updatedAt: new Date().toISOString(),
    };

    const newState: ChecklistState = {
      ...currentState,
      items: [...currentState.items, newItem],
    };

    const saved = saveChecklistState(newState);
    return saved ? newItem : null;
  } catch (error) {
    console.error("Error adding order to checklist:", error);
    return null;
  }
}

/**
 * Remove an item from the checklist
 */
export function removeChecklistItem(itemId: string): boolean {
  try {
    const currentState = loadChecklistState();

    const newState: ChecklistState = {
      ...currentState,
      items: currentState.items.filter((item) => item.id !== itemId),
    };

    return saveChecklistState(newState);
  } catch (error) {
    console.error("Error removing checklist item:", error);
    return false;
  }
}

/**
 * Update checklist item completion status
 */
export function updateChecklistItemCompletion(
  itemId: string,
  completed: boolean
): boolean {
  try {
    const currentState = loadChecklistState();

    const newState: ChecklistState = {
      ...currentState,
      items: currentState.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed,
              completedAt: completed ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    };

    return saveChecklistState(newState);
  } catch (error) {
    console.error("Error updating checklist item completion:", error);
    return false;
  }
}

/**
 * Update checklist item notes
 */
export function updateChecklistItemNotes(
  itemId: string,
  notes: string
): boolean {
  try {
    const currentState = loadChecklistState();

    const newState: ChecklistState = {
      ...currentState,
      items: currentState.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              notes,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    };

    return saveChecklistState(newState);
  } catch (error) {
    console.error("Error updating checklist item notes:", error);
    return false;
  }
}

/**
 * Clear entire checklist
 */
export function clearChecklist(): boolean {
  try {
    return saveChecklistState(DEFAULT_CHECKLIST_STATE);
  } catch (error) {
    console.error("Error clearing checklist:", error);
    return false;
  }
}

/**
 * Check if an order is already in the checklist
 */
export function isOrderInChecklist(jobNumber: string): boolean {
  try {
    const currentState = loadChecklistState();
    return currentState.items.some(
      (item) => item.order.jobNumber === jobNumber
    );
  } catch (error) {
    console.error("Error checking if order is in checklist:", error);
    return false;
  }
}
