import {
  pgTable,
  foreignKey,
  unique,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 50 }).notNull(),
    organizationId: integer("organization_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "users_organization_id_organizations_id_fk",
    }).onDelete("cascade"),
    unique("users_email_unique").on(table.email),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: serial().primaryKey().notNull(),
    content: text().notNull(),
    userId: integer("user_id"),
    orderId: integer("order_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "messages_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: "messages_order_id_orders_id_fk",
    }).onDelete("cascade"),
  ]
);

export const customers = pgTable(
  "customers",
  {
    id: serial().primaryKey().notNull(),
    organizationId: integer("organization_id"),
    name: varchar({ length: 255 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }),
    phone: varchar({ length: 50 }),
    email: varchar({ length: 255 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "customers_organization_id_organizations_id_fk",
    }).onDelete("cascade"),
  ]
);

export const organizations = pgTable("organizations", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
});

export const jobFiles = pgTable(
  "job_files",
  {
    id: serial().primaryKey().notNull(),
    orderId: integer("order_id"),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 50 }).notNull(),
    fileUrl: text("file_url").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: "job_files_order_id_orders_id_fk",
    }).onDelete("cascade"),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial().primaryKey().notNull(),
    orderId: integer("order_id"),
    assetSku: varchar("asset_sku", { length: 100 }).notNull(),
    assetDescription: text("asset_description"),
    imageUrl: text("image_url"),
    quantity: integer().notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    garmentType: varchar("garment_type", { length: 100 }),
    comment: text(),
    status: varchar({ length: 50 }).default("pending").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: "order_items_order_id_orders_id_fk",
    }).onDelete("cascade"),
  ]
);

export const orderTags = pgTable(
  "order_tags",
  {
    id: serial().primaryKey().notNull(),
    orderId: integer("order_id"),
    tagId: integer("tag_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    quantity: integer().default(1).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: "order_tags_order_id_orders_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [tags.id],
      name: "order_tags_tag_id_tags_id_fk",
    }).onDelete("cascade"),
  ]
);

export const shippingAddresses = pgTable(
  "shipping_addresses",
  {
    id: serial().primaryKey().notNull(),
    orderId: integer("order_id"),
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar({ length: 100 }).notNull(),
    state: varchar({ length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    country: varchar({ length: 100 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: "shipping_addresses_order_id_orders_id_fk",
    }).onDelete("cascade"),
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    organizationId: integer("organization_id"),
    assignedTo: integer("assigned_to"),
    status: varchar({ length: 50 }).default("pending").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    orderNumber: varchar("order_number", { length: 100 }).notNull(),
    customerId: integer("customer_id"),
    shipDate: date("ship_date"),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "orders_organization_id_organizations_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [users.id],
      name: "orders_assigned_to_users_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "orders_customer_id_customers_id_fk",
    }).onDelete("set null"),
    unique("orders_order_number_unique").on(table.orderNumber),
  ]
);

export const tags = pgTable(
  "tags",
  {
    id: serial().primaryKey().notNull(),
    code: varchar({ length: 10 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    organizationId: integer("organization_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    color: varchar({ length: 20 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "tags_organization_id_organizations_id_fk",
    }).onDelete("cascade"),
    unique("tags_code_unique").on(table.code),
  ]
);
