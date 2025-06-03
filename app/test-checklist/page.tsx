"use client";

import React from "react";
import { SimpleChecklist } from "@/components/checklist/SimpleChecklist";

export default function TestChecklistPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Simple Checklist Test</h1>
        <p className="text-muted-foreground">
          Testing the unified checklist component with multiple named lists
        </p>
      </div>

      <div className="flex justify-center">
        <SimpleChecklist />
      </div>

      {/* Instructions */}
      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Test Instructions</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Create Lists:</strong> Click "New List" to create a named
            checklist
          </p>
          <p>
            • <strong>Switch Lists:</strong> Use the dropdown to switch between
            different lists
          </p>
          <p>
            • <strong>Add Orders:</strong> Search in the input field and click
            on results to add them
          </p>
          <p>
            • <strong>Check Off Items:</strong> Click the circle to mark items
            as completed (they'll be crossed out)
          </p>
          <p>
            • <strong>Remove Items:</strong> Click the X button to remove items
            from the list
          </p>
          <p>
            • <strong>Persistence:</strong> All lists and items are saved in
            localStorage
          </p>
          <p>
            • <strong>Smart Due Dates:</strong> See relative due date info
            (overdue, due today, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}
