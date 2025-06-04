"use client";

import React from "react";
import { JobHeader } from "@/app/components/order-details/JobHeader";
import { CustomerInfo } from "@/app/components/order-details/CustomerInfo";
import { OrderItems } from "@/app/components/order-details/OrderItems";
import { Comment } from "@/app/components/order-details/Comment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobDataEnhanced } from "@/lib/types/JobDataEnhanced";
import { CommentWithThread } from "@/lib/types/Comments";

// Comprehensive test data
const testJobData: JobDataEnhanced = {
  jobNumber: "50734",
  customer: {
    name: "Duds By Dudes",
    contact_name: "Derek Anderson",
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

// Mock comment data for testing Comment component
const mockComments: CommentWithThread[] = [
  {
    id: 1,
    job_number: "50734",
    order_id: 1,
    user_id: 1,
    content:
      "Hi team! I've uploaded the logo files for this project. The client wants the embroidery on the front left chest to be exactly 3 inches wide. Please make sure to use the vector file for the best quality.\n\nLet me know if you need any clarification on the placement or sizing!",
    content_type: "text",
    comment_type: "comment",
    is_pinned: false,
    is_internal: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@decopress.com",
      role: "Project Manager",
    },
    reply_count: 2,
    attachments: [
      {
        id: 1,
        comment_id: 1,
        file_name: "company-logo-vector.ai",
        filename: "company-logo-vector.ai",
        file_type: "application/illustrator",
        file_url: "/files/company-logo-vector.ai",
        file_size: 245760, // 240KB
        is_active: true,
        uploaded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        comment_id: 1,
        file_name: "placement-reference.jpg",
        filename: "placement-reference.jpg",
        file_type: "image/jpeg",
        file_url: "/files/placement-reference.jpg",
        thumbnail_url: "/files/thumbnails/placement-reference.jpg",
        file_size: 156672, // 153KB
        is_active: true,
        uploaded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    reactions: [
      {
        id: 1,
        comment_id: 1,
        user_id: 2,
        reaction_type: "thumbs_up",
        created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        user: { id: 2, name: "Mike Chen", email: "mike@decopress.com" },
      },
      {
        id: 2,
        comment_id: 1,
        user_id: 3,
        reaction_type: "thumbs_up",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        user: { id: 3, name: "Lisa Rodriguez", email: "lisa@decopress.com" },
      },
    ],
    reaction_counts: {
      like: 0,
      thumbs_up: 2,
      thumbs_down: 0,
      heart: 0,
      laugh: 0,
    },
  },
  {
    id: 2,
    job_number: "50734",
    order_id: 1,
    user_id: 2,
    content:
      "Got it! I'll start with the XL hoodies first since those are priority. The logo specs look perfect.",
    content_type: "text",
    comment_type: "comment",
    parent_comment_id: 1,
    is_pinned: false,
    is_internal: true,
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
    updated_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    author: {
      id: 2,
      name: "Mike Chen",
      email: "mike@decopress.com",
      role: "Production Lead",
    },
    reply_count: 0,
  },
  {
    id: 3,
    job_number: "50734",
    order_id: 1,
    user_id: 4,
    content:
      "Status update: All XL hoodies have been embroidered and are ready for quality check. Moving to medium sizes next.",
    content_type: "text",
    comment_type: "status_update",
    is_pinned: true,
    is_internal: true,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    author: {
      id: 4,
      name: "Alex Thompson",
      email: "alex@decopress.com",
      role: "Embroidery Specialist",
    },
    reply_count: 0,
    reactions: [
      {
        id: 3,
        comment_id: 3,
        user_id: 1,
        reaction_type: "heart",
        created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        user: { id: 1, name: "Sarah Johnson", email: "sarah@decopress.com" },
      },
    ],
    reaction_counts: {
      like: 0,
      thumbs_up: 0,
      thumbs_down: 0,
      heart: 1,
      laugh: 0,
    },
  },
  {
    id: 4,
    job_number: "50734",
    order_id: 1,
    user_id: 3,
    content:
      "Perfect timing! I'll have these quality checked and packaged by end of day.",
    content_type: "text",
    comment_type: "comment",
    parent_comment_id: 1,
    is_pinned: false,
    is_internal: true,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    author: {
      id: 3,
      name: "Lisa Rodriguez",
      email: "lisa@decopress.com",
      role: "Quality Control",
    },
    reply_count: 0,
  },
];

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

function CommunicationThreadPreview() {
  const currentUserId = 1; // Simulate logged-in user

  const handleReply = (commentId: number) => {
    console.log("Reply to comment:", commentId);
  };

  const handleEdit = (commentId: number) => {
    console.log("Edit comment:", commentId);
  };

  const handleDelete = (commentId: number) => {
    console.log("Delete comment:", commentId);
  };

  const handlePin = (commentId: number) => {
    console.log("Toggle pin comment:", commentId);
  };

  const handleReaction = (commentId: number, reactionType: any) => {
    console.log("Add reaction:", commentId, reactionType);
  };

  // Separate parent comments from replies
  const parentComments = mockComments.filter(
    (comment) => !comment.parent_comment_id
  );
  const replyComments = mockComments.filter(
    (comment) => comment.parent_comment_id
  );

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Communication Thread</CardTitle>
        <p className="text-sm text-muted-foreground">
          Internal team discussion and updates
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {parentComments.map((comment) => {
            const replies = replyComments.filter(
              (reply) => reply.parent_comment_id === comment.id
            );

            return (
              <div key={comment.id} className="space-y-3">
                {/* Parent Comment */}
                <Comment
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  onReaction={handleReaction}
                />

                {/* Replies */}
                {replies.map((reply) => (
                  <Comment
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    isThreaded={true}
                    threadLevel={1}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPin={handlePin}
                    onReaction={handleReaction}
                  />
                ))}
              </div>
            );
          })}

          {/* Placeholder for comment composer */}
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              💬 Comment composer component will be implemented in task 4-12
            </p>
          </div>
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
                Development preview • OrderItems component implemented
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
            <OrderItems orderItems={testJobData.order.line_items} />
            <PlaceholderFilesSection />
          </div>

          {/* Right Column - Communication Thread (4/7 ≈ 57%) */}
          <div className="xl:col-span-4">
            <CommunicationThreadPreview />
          </div>
        </div>

        {/* Development Progress - Full Width */}
        <div className="mt-8 p-6 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-4">
            Development Progress • OrderItems Component Implemented
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
                <li>• Task 4-6: OrderItems (with photos/prices)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">🔄 In Progress</h4>
              <ul className="text-sm space-y-1">
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
