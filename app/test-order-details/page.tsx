"use client";

import React from "react";
import { JobHeader } from "@/app/components/order-details/JobHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobDataEnhanced } from "@/lib/types/JobDataEnhanced";

// Comprehensive test data
const testJobData: JobDataEnhanced = {
  jobNumber: "50734",
  customer: {
    name: "Duds By Dudes",
    emails: ["derek@dudsbydudes.com", "orders@dudsbydudes.com"],
    phones: ["866.963.3837", "555.123.4567"],
    address: {
      line1: "123 Fashion Street",
      line2: "Suite 400",
      city: "Los Angeles",
      state: "CA",
      postal_code: "90210",
      country: "USA",
    },
    contact_preferences: {
      preferred_method: "email",
      notes: "Prefers email communication during business hours (9AM-5PM PST)",
    },
  },
  order: {
    order_number: "ORD-50734-2024",
    title: "Custom Embroidered Hoodies - Tech Company Retreat",
    description:
      "High-quality embroidered hoodies for annual company retreat. Logo placement on front left chest and large back graphic. Requires rush delivery for event date.",
    status: "in_progress",
    priority: "high",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    ship_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    total_value: 2750.0,
    images: [
      {
        asset_tag: "IMG-001",
        thumbnail_url: "/placeholder-thumb.jpg",
        high_res_url: "/placeholder-high.jpg",
        thumbnail_base_path: "/thumbs/",
        high_res_base_path: "/images/",
      },
    ],
    line_items: [
      {
        asset_tag: "AST-001",
        asset_sku: "HOODIE-XL-BLK",
        description: "Black XL Hoodie with Logo Embroidery",
        quantity: 25,
        status: "in_progress",
        specifications: {
          size: "XL",
          color: "Black",
          material: "Cotton/Poly Blend",
          placement: "Front Left Chest + Back",
        },
        comments: "Rush order - prioritize for weekend production",
      },
      {
        asset_tag: "AST-002",
        asset_sku: "HOODIE-LG-BLK",
        description: "Black Large Hoodie with Logo Embroidery",
        quantity: 20,
        status: "pending",
        specifications: {
          size: "Large",
          color: "Black",
          material: "Cotton/Poly Blend",
          placement: "Front Left Chest + Back",
        },
      },
      {
        asset_tag: "AST-003",
        asset_sku: "HOODIE-MD-BLK",
        description: "Black Medium Hoodie with Logo Embroidery",
        quantity: 15,
        status: "pending",
        specifications: {
          size: "Medium",
          color: "Black",
          material: "Cotton/Poly Blend",
          placement: "Front Left Chest + Back",
        },
      },
    ],
    files: [
      {
        filename: "logo-vector.ai",
        file_type: "application/illustrator",
        file_url: "/files/logo-vector.ai",
        category: "design",
        description: "Primary logo file for embroidery",
        is_active: true,
        uploaded_at: new Date().toISOString(),
      },
      {
        filename: "color-reference.jpg",
        file_type: "image/jpeg",
        file_url: "/files/color-reference.jpg",
        category: "reference",
        description: "Brand color reference guide",
        is_active: true,
        uploaded_at: new Date().toISOString(),
      },
    ],
  },
  timeline: [
    {
      event_type: "created",
      description: "Order created and assigned to production team",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user_name: "Sarah Johnson",
    },
    {
      event_type: "file_upload",
      description: "Logo design files uploaded by customer",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user_name: "Derek Anderson",
    },
    {
      event_type: "status_change",
      description: "Status changed from pending to in_progress",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      user_name: "Mike Chen",
    },
  ],
  tags: [
    {
      code: "EMB",
      name: "Embroidery",
      quantity: 1,
      color: "#3B82F6",
      status: "in_progress",
      priority: 1,
      estimated_time: 180, // 3 hours
    },
    {
      code: "QC",
      name: "Quality Check",
      quantity: 1,
      color: "#10B981",
      status: "pending",
      priority: 2,
      estimated_time: 60, // 1 hour
    },
    {
      code: "PACK",
      name: "Packaging",
      quantity: 1,
      color: "#F59E0B",
      status: "pending",
      priority: 3,
      estimated_time: 45, // 45 minutes
    },
  ],
  jobDescriptions: [
    {
      text: "Corporate branding order for tech company annual retreat",
      timestamp: new Date().toISOString(),
      author: "Sales Team",
    },
  ],
};

// Placeholder components for future implementation
function PlaceholderCustomerInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Name:</strong> {testJobData.customer.name}
          </div>
          <div>
            <strong>Email:</strong> {testJobData.customer.emails.join(", ")}
          </div>
          <div>
            <strong>Phone:</strong> {testJobData.customer.phones.join(", ")}
          </div>
          {testJobData.customer.address && (
            <div>
              <strong>Address:</strong>
              <br />
              {testJobData.customer.address.line1}
              <br />
              {testJobData.customer.address.line2 && (
                <>
                  {testJobData.customer.address.line2}
                  <br />
                </>
              )}
              {testJobData.customer.address.city},{" "}
              {testJobData.customer.address.state}{" "}
              {testJobData.customer.address.postal_code}
            </div>
          )}
        </div>
        <Badge variant="outline" className="mt-3">
          Task 4-5: CustomerInfo Component
        </Badge>
      </CardContent>
    </Card>
  );
}

function PlaceholderOrderItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {testJobData.order.line_items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-start p-3 border rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium">{item.description}</div>
                <div className="text-sm text-muted-foreground">
                  {item.asset_sku} • Qty: {item.quantity}
                </div>
                {item.specifications && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Badge
                variant={
                  item.status === "in_progress" ? "default" : "secondary"
                }
              >
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
        <Badge variant="outline" className="mt-3">
          Task 4-6: OrderItems Component
        </Badge>
      </CardContent>
    </Card>
  );
}

function PlaceholderProcessTags() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Process Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {testJobData.tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 border rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              ></div>
              <span className="text-sm font-medium">{tag.name}</span>
              <Badge
                variant={tag.status === "in_progress" ? "default" : "secondary"}
                className="text-xs"
              >
                {tag.status}
              </Badge>
            </div>
          ))}
        </div>
        <Badge variant="outline" className="mt-3">
          Task 4-7: ProcessTags Component
        </Badge>
      </CardContent>
    </Card>
  );
}

function PlaceholderFilesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Files & Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {testJobData.order.files.map((file, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="font-medium text-sm">{file.filename}</div>
              <div className="text-xs text-muted-foreground">
                {file.category}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {file.description}
              </div>
            </div>
          ))}
        </div>
        <Badge variant="outline" className="mt-3">
          Task 4-8: FilesSection Component
        </Badge>
      </CardContent>
    </Card>
  );
}

function PlaceholderCommunicationThread() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Communication Thread</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-sm">Sarah Johnson</div>
              <div className="text-xs text-muted-foreground">2 hours ago</div>
            </div>
            <div className="text-sm">
              Started production on XL hoodies. Logo placement looks great!
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-sm">Derek Anderson</div>
              <div className="text-xs text-muted-foreground">1 day ago</div>
            </div>
            <div className="text-sm">
              Uploaded final logo files. Please confirm placement before
              starting production.
            </div>
          </div>

          <div className="p-3 border rounded-lg bg-muted">
            <div className="text-sm text-muted-foreground italic">
              Timeline events and communication will be displayed here...
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Badge variant="outline">Task 4-11: Comment Component</Badge>
          <Badge variant="outline">Task 4-12: CommentComposer Component</Badge>
          <Badge variant="outline">
            Task 4-13: CommunicationThread Component
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestOrderDetailsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Order Details - Test Interface
              </h1>
              <p className="text-muted-foreground">
                Development preview of PBI 4 components
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              PBI 4: Order Details Interface
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Job Header - Completed ✅ */}
        <div className="mb-6">
          <JobHeader jobData={testJobData} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Order Metadata (40-45%) */}
          <div className="lg:col-span-2 space-y-6">
            <PlaceholderCustomerInfo />
            <PlaceholderOrderItems />
            <PlaceholderProcessTags />
            <PlaceholderFilesSection />
          </div>

          {/* Right Column - Communication Thread (55-60%) */}
          <div className="lg:col-span-3">
            <PlaceholderCommunicationThread />
          </div>
        </div>

        {/* Development Progress */}
        <div className="mt-8 p-6 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-4">Development Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Completed</h4>
              <ul className="text-sm space-y-1">
                <li>• Task 4-1: Enhanced interfaces</li>
                <li>• Task 4-2: Data extraction</li>
                <li>• Task 4-3: Database migration</li>
                <li>• Task 4-4: JobHeader component</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">🔄 In Progress</h4>
              <ul className="text-sm space-y-1">
                <li>• Task 4-5: CustomerInfo</li>
                <li>• Task 4-6: OrderItems</li>
                <li>• Task 4-7: ProcessTags</li>
                <li>• Task 4-8: FilesSection</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">⏳ Upcoming</h4>
              <ul className="text-sm space-y-1">
                <li>• Task 4-9: OrderDetailsCard</li>
                <li>• Task 4-10: Comments schema</li>
                <li>• Task 4-11: Comment component</li>
                <li>• Task 4-12: CommentComposer</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">🔮 Future</h4>
              <ul className="text-sm space-y-1">
                <li>• Task 4-13: CommunicationThread</li>
                <li>• Task 4-14: Comment API</li>
                <li>• Task 4-15: Page layout</li>
                <li>• Task 4-16+: Advanced features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
