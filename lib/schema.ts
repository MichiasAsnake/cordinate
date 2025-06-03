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
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const orders = pgTable("orders", {
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
});

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

export const job_files = pgTable("job_files", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  file_name: varchar("file_name", { length: 255 }).notNull(),
  file_type: varchar("file_type", { length: 50 }).notNull(),
  file_url: text("file_url").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const order_items = pgTable("order_items", {
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
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

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
  code: varchar("code", { length: 10 }).notNull().unique(), // e.g., 'AP', 'PA', 'EM'
  name: varchar("name", { length: 100 }).notNull(), // e.g., 'Apparel', 'Patch Apply'
  color: varchar("color", { length: 20 }).notNull(),
  organization_id: integer("organization_id").references(
    () => organizations.id,
    { onDelete: "cascade" }
  ),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const order_tags = pgTable("order_tags", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  tag_id: integer("tag_id").references(() => tags.id, {
    onDelete: "cascade",
  }),
  quantity: integer("quantity").notNull().default(1),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
