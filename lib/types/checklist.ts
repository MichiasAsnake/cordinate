// Checklist TypeScript interfaces and types

export interface ChecklistItem {
  /** Unique identifier for the checklist item */
  id: string;

  /** Order information */
  order: {
    jobNumber: string;
    title: string;
    dueDate: string | null;
    status: string;
    customerName: string | null;
    tags: Array<{
      name: string;
      color: string;
    }>;
  };

  /** Completion status */
  completed: boolean;

  /** User's personal notes for this item */
  notes: string;

  /** When this item was added to the checklist */
  createdAt: string;

  /** When this item was completed (if completed) */
  completedAt: string | null;

  /** When this item was last updated */
  updatedAt: string;
}

export interface ChecklistState {
  /** Array of all checklist items */
  items: ChecklistItem[];

  /** Last time the checklist was modified */
  lastModified: string;

  /** Version for potential future migrations */
  version: number;
}

export interface ChecklistStats {
  /** Total number of items in checklist */
  total: number;

  /** Number of completed items */
  completed: number;

  /** Number of remaining items */
  remaining: number;

  /** Completion percentage (0-100) */
  completionPercentage: number;
}

// Order type for adding to checklist (simplified from workflow table)
export interface OrderForChecklist {
  jobNumber: string;
  title: string;
  dueDate: string | null;
  status: string;
  customerName: string | null;
  tags: Array<{
    name: string;
    color: string;
  }>;
}

// Constants
export const CHECKLIST_VERSION = 1;
export const STORAGE_KEY = "cordinate-checklist";

// Default state
export const DEFAULT_CHECKLIST_STATE: ChecklistState = {
  items: [],
  lastModified: new Date().toISOString(),
  version: CHECKLIST_VERSION,
};
