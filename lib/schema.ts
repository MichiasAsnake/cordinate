import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  date,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  organization_id: integer("organization_id").references(
    () => organizations.id,
    { onDelete: "cascade" }
  ),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  organization_id: integer("organization_id").references(
    () => organizations.id,
    { onDelete: "cascade" }
  ),
  name: varchar("name", { length: 255 }).notNull(),
  contact_name: varchar("contact_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  emails: jsonb("emails").$type<string[]>(),
  phones: jsonb("phones").$type<string[]>(),
  address_line1: varchar("address_line1", { length: 255 }),
  address_line2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postal_code: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("USA"),
  contact_preferences: jsonb("contact_preferences").$type<{
    preferred_method?: "email" | "phone" | "both";
    notes?: string;
  }>(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    job_number: varchar("job_number", { length: 50 }).notNull(),
    order_number: varchar("order_number", { length: 100 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    organization_id: integer("organization_id").references(
      () => organizations.id,
      { onDelete: "cascade" }
    ),
    customer_id: integer("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    assigned_to: integer("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    priority: varchar("priority", { length: 50 }).notNull().default("medium"),
    ship_date: date("ship_date"),
    due_date: date("due_date"),
    total_value: decimal("total_value", { precision: 10, scale: 2 }),
    customer_emails: jsonb("customer_emails").$type<string[]>(),
    customer_phones: jsonb("customer_phones").$type<string[]>(),
    shipping_info: jsonb("shipping_info").$type<{
      address?: string;
      method?: string;
      tracking?: string;
      carrier?: string;
    }>(),
    images: jsonb("images").$type<
      Array<{
        asset_tag: string;
        thumbnail_url: string;
        high_res_url: string;
        thumbnail_base_path: string;
        high_res_base_path: string;
      }>
    >(),
    job_descriptions: jsonb("job_descriptions").$type<
      Array<{
        text: string;
        timestamp: string;
        author?: string;
      }>
    >(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      jobNumberIdx: index("orders_job_number_idx").on(table.job_number),
      customerIdIdx: index("orders_customer_id_idx").on(table.customer_id),
      statusIdx: index("orders_status_idx").on(table.status),
      dueDateIdx: index("orders_due_date_idx").on(table.due_date),
    };
  }
);

export const shipping_addresses = pgTable("shipping_addresses", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  address_line1: varchar("address_line1", { length: 255 }).notNull(),
  address_line2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postal_code: varchar("postal_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const job_files = pgTable(
  "job_files",
  {
    id: serial("id").primaryKey(),
    order_id: integer("order_id").references(() => orders.id, {
      onDelete: "cascade",
    }),
    file_name: varchar("file_name", { length: 255 }).notNull(),
    file_type: varchar("file_type", { length: 50 }).notNull(),
    file_url: text("file_url").notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).default("other"),
    file_size: integer("file_size"),
    description: text("description"),
    uploaded_by: integer("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    is_active: boolean("is_active").default(true),
    metadata: jsonb("metadata").$type<{
      original_name?: string;
      mime_type?: string;
      dimensions?: { width: number; height: number };
    }>(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    uploaded_at: timestamp("uploaded_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      orderIdIdx: index("job_files_order_id_idx").on(table.order_id),
      categoryIdx: index("job_files_category_idx").on(table.category),
      activeIdx: index("job_files_active_idx").on(table.is_active),
    };
  }
);

export const order_items = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    order_id: integer("order_id").references(() => orders.id, {
      onDelete: "cascade",
    }),
    asset_sku: varchar("asset_sku", { length: 100 }).notNull(),
    asset_description: text("asset_description"),
    image_url: text("image_url"),
    quantity: integer("quantity").notNull(),
    unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    garment_type: varchar("garment_type", { length: 100 }),
    comment: text("comment"),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    asset_tag: varchar("asset_tag", { length: 100 }),
    specifications: jsonb("specifications").$type<{
      color?: string;
      size?: string;
      material?: string;
      [key: string]: any;
    }>(),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      orderIdIdx: index("order_items_order_id_idx").on(table.order_id),
      assetSkuIdx: index("order_items_asset_sku_idx").on(table.asset_sku),
      statusIdx: index("order_items_status_idx").on(table.status),
    };
  }
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  user_id: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  order_id: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  organization_id: integer("organization_id").references(
    () => organizations.id,
    { onDelete: "cascade" }
  ),
  description: text("description"),
  priority: integer("priority").default(0),
  estimated_time_hours: decimal("estimated_time_hours", {
    precision: 5,
    scale: 2,
  }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const order_tags = pgTable(
  "order_tags",
  {
    id: serial("id").primaryKey(),
    order_id: integer("order_id").references(() => orders.id, {
      onDelete: "cascade",
    }),
    tag_id: integer("tag_id").references(() => tags.id, {
      onDelete: "cascade",
    }),
    quantity: integer("quantity").notNull().default(1),
    status: varchar("status", { length: 50 }).default("pending"),
    assigned_to: integer("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),
    started_at: timestamp("started_at", { withTimezone: true }),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"),
    estimated_hours: decimal("estimated_hours", { precision: 5, scale: 2 }),
    actual_hours: decimal("actual_hours", { precision: 5, scale: 2 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      orderIdIdx: index("order_tags_order_id_idx").on(table.order_id),
      tagIdIdx: index("order_tags_tag_id_idx").on(table.tag_id),
      statusIdx: index("order_tags_status_idx").on(table.status),
    };
  }
);

export const job_timeline = pgTable(
  "job_timeline",
  {
    id: serial("id").primaryKey(),
    job_number: varchar("job_number", { length: 50 }).notNull(),
    event_type: varchar("event_type", { length: 50 }).notNull(),
    event_description: text("event_description").notNull(),
    event_data: jsonb("event_data").$type<{
      user_id?: number;
      previous_value?: any;
      new_value?: any;
      metadata?: any;
    }>(),
    user_name: varchar("user_name", { length: 100 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      jobNumberIdx: index("job_timeline_job_number_idx").on(table.job_number),
      eventTypeIdx: index("job_timeline_event_type_idx").on(table.event_type),
      createdAtIdx: index("job_timeline_created_at_idx").on(table.created_at),
    };
  }
);

export const job_comments = pgTable(
  "job_comments",
  {
    id: serial("id").primaryKey(),
    job_number: varchar("job_number", { length: 50 }).notNull(),
    order_id: integer("order_id").references(() => orders.id, {
      onDelete: "cascade",
    }),
    user_id: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    content: text("content").notNull(),
    content_type: varchar("content_type", { length: 20 }).default("text"),
    comment_type: varchar("comment_type", { length: 20 }).default("comment"),
    parent_comment_id: integer("parent_comment_id"),
    reply_to_id: integer("reply_to_id"),
    is_pinned: boolean("is_pinned").default(false),
    is_internal: boolean("is_internal").default(true),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      jobNumberIdx: index("job_comments_job_number_idx").on(table.job_number),
      orderIdIdx: index("job_comments_order_id_idx").on(table.order_id),
      userIdIdx: index("job_comments_user_id_idx").on(table.user_id),
      parentCommentIdx: index("job_comments_parent_id_idx").on(
        table.parent_comment_id
      ),
      pinnedIdx: index("job_comments_pinned_idx").on(table.is_pinned),
      typeIdx: index("job_comments_type_idx").on(table.comment_type),
      createdAtIdx: index("job_comments_created_at_idx").on(table.created_at),
      deletedAtIdx: index("job_comments_deleted_at_idx").on(table.deleted_at),
    };
  }
);

export const comment_files = pgTable(
  "comment_files",
  {
    id: serial("id").primaryKey(),
    comment_id: integer("comment_id").references(() => job_comments.id, {
      onDelete: "cascade",
    }),
    file_name: varchar("file_name", { length: 255 }).notNull(),
    filename: varchar("filename", { length: 255 }).notNull(),
    file_type: varchar("file_type", { length: 50 }).notNull(),
    file_url: text("file_url").notNull(),
    storage_path: text("storage_path"),
    thumbnail_url: text("thumbnail_url"),
    file_size: integer("file_size"),
    uploaded_by_user_id: integer("uploaded_by_user_id").references(
      () => users.id,
      {
        onDelete: "set null",
      }
    ),
    is_active: boolean("is_active").default(true),
    uploaded_at: timestamp("uploaded_at", { withTimezone: true }).defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      commentIdIdx: index("comment_files_comment_id_idx").on(table.comment_id),
      activeIdx: index("comment_files_active_idx").on(table.is_active),
      uploadedByIdx: index("comment_files_uploaded_by_idx").on(
        table.uploaded_by_user_id
      ),
    };
  }
);

export const comment_mentions = pgTable(
  "comment_mentions",
  {
    id: serial("id").primaryKey(),
    comment_id: integer("comment_id").references(() => job_comments.id, {
      onDelete: "cascade",
    }),
    mentioned_user_id: integer("mentioned_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    mention_type: varchar("mention_type", { length: 20 }).default("direct"),
    is_read: boolean("is_read").default(false),
    notification_sent_at: timestamp("notification_sent_at", {
      withTimezone: true,
    }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      commentIdIdx: index("comment_mentions_comment_id_idx").on(
        table.comment_id
      ),
      mentionedUserIdx: index("comment_mentions_mentioned_user_idx").on(
        table.mentioned_user_id
      ),
      readIdx: index("comment_mentions_read_idx").on(table.is_read),
      typeIdx: index("comment_mentions_type_idx").on(table.mention_type),
    };
  }
);

export const comment_reactions = pgTable(
  "comment_reactions",
  {
    id: serial("id").primaryKey(),
    comment_id: integer("comment_id").references(() => job_comments.id, {
      onDelete: "cascade",
    }),
    user_id: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    reaction_type: varchar("reaction_type", { length: 20 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      commentIdIdx: index("comment_reactions_comment_id_idx").on(
        table.comment_id
      ),
      userIdIdx: index("comment_reactions_user_id_idx").on(table.user_id),
      typeIdx: index("comment_reactions_type_idx").on(table.reaction_type),
    };
  }
);
