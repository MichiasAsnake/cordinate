"use client";

import React from "react";
import { JobHeader } from "./JobHeader";
import { JobDataEnhanced } from "@/lib/types/JobDataEnhanced";

// Example job data for demo purposes
const exampleJobData: JobDataEnhanced = {
  jobNumber: "50734",
  customer: {
    name: "Duds By Dudes",
    emails: ["derek@dudsbydudes.com"],
    phones: ["866.963.3837"],
    contact_preferences: {
      preferred_method: "email",
      notes: "Prefers email communication during business hours",
    },
  },
  order: {
    order_number: "ORD-50734",
    title: "Custom Embroidered Hoodies - Corporate Branding",
    description:
      "High-quality embroidered hoodies for corporate branding event",
    status: "in_progress",
    priority: "high",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    ship_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    total_value: 1250.0,
    images: [],
    line_items: [
      {
        asset_tag: "AST-001",
        asset_sku: "HOODIE-XL-BLK",
        description: "Black XL Hoodie with Logo",
        quantity: 25,
        status: "pending",
        specifications: {
          size: "XL",
          color: "Black",
          material: "Cotton Blend",
        },
      },
      {
        asset_tag: "AST-002",
        asset_sku: "HOODIE-LG-BLK",
        description: "Black Large Hoodie with Logo",
        quantity: 15,
        status: "in_progress",
        specifications: {
          size: "Large",
          color: "Black",
          material: "Cotton Blend",
        },
      },
    ],
    files: [],
  },
  timeline: [],
  tags: [
    {
      code: "EMB",
      name: "Embroidery",
      quantity: 1,
      color: "#3B82F6",
      status: "pending",
    },
    {
      code: "QC",
      name: "Quality Check",
      quantity: 1,
      color: "#10B981",
      status: "pending",
    },
  ],
  jobDescriptions: [
    {
      text: "Corporate branding order for tech company retreat",
      timestamp: new Date().toISOString(),
      author: "Sales Team",
    },
  ],
};

const overdueJobData: JobDataEnhanced = {
  ...exampleJobData,
  jobNumber: "50720",
  order: {
    ...exampleJobData.order,
    order_number: "ORD-50720",
    title: "Urgent T-Shirt Order - Trade Show",
    status: "pending",
    priority: "urgent",
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
    total_value: 750.0,
  },
};

export function JobHeaderExample() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">JobHeader Component Demo</h1>
        <p className="text-muted-foreground mb-6">
          Examples of the JobHeader component with different states and data.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Standard Job (In Progress)
          </h2>
          <JobHeader jobData={exampleJobData} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Overdue Job</h2>
          <JobHeader jobData={overdueJobData} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Loading State</h2>
          <JobHeader jobData={exampleJobData} loading={true} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Job without Due Date</h2>
          <JobHeader
            jobData={{
              ...exampleJobData,
              order: {
                ...exampleJobData.order,
                due_date: null,
                total_value: undefined,
              },
            }}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Completed Job</h2>
          <JobHeader
            jobData={{
              ...exampleJobData,
              order: {
                ...exampleJobData.order,
                status: "completed",
                priority: "medium",
                due_date: new Date(
                  Date.now() - 3 * 24 * 60 * 60 * 1000
                ).toISOString(),
              },
            }}
          />
        </section>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Component Features:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Responsive design with mobile-first approach</li>
          <li>• Status badges with color-coded states</li>
          <li>• Due date urgency indicators (overdue, today, tomorrow)</li>
          <li>• Loading state with skeleton animation</li>
          <li>• Graceful handling of missing data</li>
          <li>• Dark mode support</li>
          <li>• Accessibility features with proper ARIA labels</li>
        </ul>
      </div>
    </div>
  );
}

export default JobHeaderExample;
