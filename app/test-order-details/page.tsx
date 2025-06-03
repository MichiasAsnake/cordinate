"use client";

import React from "react";
import { JobHeader } from "@/app/components/order-details/JobHeader";
import { CustomerInfo } from "@/app/components/order-details/CustomerInfo";
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
        unit_cost: 45.0,
        total_cost: 1125.0,
        image_url: "/placeholder-hoodie-xl.jpg",
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
        unit_cost: 45.0,
        total_cost: 900.0,
        image_url: "/placeholder-hoodie-lg.jpg",
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
        unit_cost: 45.0,
        total_cost: 675.0,
        image_url: "/placeholder-hoodie-md.jpg",
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

function PlaceholderOrderItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Order Line Items
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {testJobData.order.line_items.length} items
            </Badge>
            <Badge variant="outline" className="text-xs">
              ${(testJobData.order.total_value || 0).toFixed(2)} total
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testJobData.order.line_items.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-xs text-center text-muted-foreground">
                    <div className="text-lg mb-1">👕</div>
                    <div>{item.specifications?.size || "IMG"}</div>
                  </div>
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-base">
                        {item.description}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {item.asset_sku} • Asset: {item.asset_tag}
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.status === "in_progress" ? "default" : "secondary"
                      }
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
                            <span className="font-medium text-muted-foreground">
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
                      <div>
                        <span className="text-muted-foreground">Unit:</span>
                        <span className="ml-1 font-medium">
                          ${item.unit_cost?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-1 font-semibold text-green-600">
                          ${item.total_cost?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  {item.comments && (
                    <div className="mt-3 text-xs bg-orange-50 dark:bg-orange-950/20 p-2 rounded border-l-2 border-orange-400">
                      <span className="font-medium">Note:</span> {item.comments}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Badge variant="outline" className="mt-4">
          Task 4-6: OrderItems Component
        </Badge>
      </CardContent>
    </Card>
  );
}

function PlaceholderFilesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Files & Assets
          <Badge variant="secondary" className="text-xs">
            {testJobData.order.files.length} files
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {testJobData.order.files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-xs font-mono uppercase">
                  {file.file_type.split("/")[1]?.slice(0, 3) || "FILE"}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{file.filename}</div>
                <div className="text-xs text-muted-foreground">
                  {file.description}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {file.category}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(file.uploaded_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Badge variant="outline" className="mt-4">
          Task 4-7: FilesSection Component
        </Badge>
      </CardContent>
    </Card>
  );
}

function PlaceholderCommunicationThread() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Communication Thread
          <Badge variant="secondary" className="text-xs">
            {testJobData.timeline.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Timeline Events */}
          {testJobData.timeline.map((event, index) => (
            <div key={index} className="flex gap-3 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">
                  {event.user_name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm">
                    {event.user_name || "System"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleDateString()}{" "}
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm">{event.description}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {event.event_type.replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))}

          {/* Sample Comments */}
          <div className="flex gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">S</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-sm">Sarah Johnson</div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>
              <div className="text-sm">
                Started production on XL hoodies. Logo placement looks great!
                The embroidery team is making excellent progress and should
                complete this batch by end of day.
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  production update
                </Badge>
                <Badge variant="outline" className="text-xs">
                  internal
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">D</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-sm">Derek Anderson</div>
                <div className="text-xs text-muted-foreground">1 day ago</div>
              </div>
              <div className="text-sm">
                Uploaded final logo files. Please confirm placement before
                starting production. The back graphic should be centered 4
                inches from the top seam.
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  customer message
                </Badge>
                <Badge variant="outline" className="text-xs">
                  file upload
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Composer Preview */}
        <div className="mt-6 p-4 border-2 border-dashed border-muted rounded-lg">
          <div className="text-sm text-muted-foreground italic text-center">
            Comment composer will be here...
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Badge variant="outline">Task 4-8: Comment Component</Badge>
          <Badge variant="outline">Task 4-9: CommentComposer Component</Badge>
          <Badge variant="outline">
            Task 4-10: CommunicationThread Component
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
      <div className="border-b bg-card px-4 py-4">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Order Details - Test Interface
              </h1>
              <p className="text-muted-foreground">
                Development preview • CustomerInfo component implemented
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              PBI 4: Order Details Interface
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="w-full px-4 py-6">
        {/* Top Row - Job Header with Process Tags and Customer Info */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Job Header with Process Tags (2/3 width) */}
          <div className="xl:col-span-2">
            <JobHeader jobData={testJobData} />
          </div>

          {/* Customer Info (1/3 width) */}
          <div className="xl:col-span-1">
            <CustomerInfo customer={testJobData.customer} />
          </div>
        </div>

        {/* Two Column Layout - Full Width */}
        <div className="grid grid-cols-1 xl:grid-cols-7 gap-6">
          {/* Left Column - Order Metadata (3/7 ≈ 43%) */}
          <div className="xl:col-span-3 space-y-6">
            <PlaceholderOrderItems />
            <PlaceholderFilesSection />
          </div>

          {/* Right Column - Communication Thread (4/7 ≈ 57%) */}
          <div className="xl:col-span-4">
            <PlaceholderCommunicationThread />
          </div>
        </div>

        {/* Development Progress - Full Width */}
        <div className="mt-8 p-6 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-4">
            Development Progress • CustomerInfo Component Implemented
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Completed</h4>
              <ul className="text-sm space-y-1">
                <li>• Task 4-1: Enhanced interfaces</li>
                <li>• Task 4-2: Data extraction</li>
                <li>• Task 4-3: Database migration</li>
                <li>• Task 4-4: JobHeader (with process tags)</li>
                <li>• Task 4-5: CustomerInfo (click-to-contact)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">🔄 In Progress</h4>
              <ul className="text-sm space-y-1">
                <li>• Task 4-6: OrderItems (with photos/prices)</li>
                <li>• Task 4-7: FilesSection</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">⏳ Upcoming</h4>
              <ul className="text-sm space-y-1">
                <li>• Task 4-8: Comment component</li>
                <li>• Task 4-9: CommentComposer</li>
                <li>• Task 4-10: CommunicationThread</li>
                <li>• Task 4-11: Comments schema</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-purple-600">🔮 Future</h4>
              <ul className="text-sm space-y-1">
                <li>• Task 4-12: Comment API</li>
                <li>• Task 4-13: Page layout</li>
                <li>• Task 4-14+: Advanced features</li>
                <li className="text-muted-foreground">
                  • Process tags: Integrated in JobHeader ✓
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
