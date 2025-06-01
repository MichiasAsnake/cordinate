"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.order_tags = exports.tags = exports.messages = exports.order_items = exports.job_files = exports.shipping_addresses = exports.orders = exports.customers = exports.users = exports.organizations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.organizations = (0, pg_core_1.pgTable)("organizations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    role: (0, pg_core_1.varchar)("role", { length: 50 }).notNull(),
    organization_id: (0, pg_core_1.integer)("organization_id").references(() => exports.organizations.id, { onDelete: "cascade" }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.customers = (0, pg_core_1.pgTable)("customers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    organization_id: (0, pg_core_1.integer)("organization_id").references(() => exports.organizations.id, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    contact_name: (0, pg_core_1.varchar)("contact_name", { length: 255 }),
    phone: (0, pg_core_1.varchar)("phone", { length: 50 }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow(),
});
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    order_number: (0, pg_core_1.varchar)("order_number", { length: 100 }).notNull().unique(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    organization_id: (0, pg_core_1.integer)("organization_id").references(() => exports.organizations.id, { onDelete: "cascade" }),
    customer_id: (0, pg_core_1.integer)("customer_id").references(() => exports.customers.id, {
        onDelete: "set null",
    }),
    assigned_to: (0, pg_core_1.integer)("assigned_to").references(() => exports.users.id, {
        onDelete: "set null",
    }),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("pending"),
    ship_date: (0, pg_core_1.date)("ship_date"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow(),
});
exports.shipping_addresses = (0, pg_core_1.pgTable)("shipping_addresses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    order_id: (0, pg_core_1.integer)("order_id").references(() => exports.orders.id, {
        onDelete: "cascade",
    }),
    address_line1: (0, pg_core_1.varchar)("address_line1", { length: 255 }).notNull(),
    address_line2: (0, pg_core_1.varchar)("address_line2", { length: 255 }),
    city: (0, pg_core_1.varchar)("city", { length: 100 }).notNull(),
    state: (0, pg_core_1.varchar)("state", { length: 100 }).notNull(),
    postal_code: (0, pg_core_1.varchar)("postal_code", { length: 20 }).notNull(),
    country: (0, pg_core_1.varchar)("country", { length: 100 }).notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.job_files = (0, pg_core_1.pgTable)("job_files", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    order_id: (0, pg_core_1.integer)("order_id").references(() => exports.orders.id, {
        onDelete: "cascade",
    }),
    file_name: (0, pg_core_1.varchar)("file_name", { length: 255 }).notNull(),
    file_type: (0, pg_core_1.varchar)("file_type", { length: 50 }).notNull(),
    file_url: (0, pg_core_1.text)("file_url").notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.order_items = (0, pg_core_1.pgTable)("order_items", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    order_id: (0, pg_core_1.integer)("order_id").references(() => exports.orders.id, {
        onDelete: "cascade",
    }),
    asset_sku: (0, pg_core_1.varchar)("asset_sku", { length: 100 }).notNull(),
    asset_description: (0, pg_core_1.text)("asset_description"),
    image_url: (0, pg_core_1.text)("image_url"),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    unit_price: (0, pg_core_1.decimal)("unit_price", { precision: 10, scale: 2 }).notNull(),
    garment_type: (0, pg_core_1.varchar)("garment_type", { length: 100 }),
    comment: (0, pg_core_1.text)("comment"),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("pending"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow(),
});
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    content: (0, pg_core_1.text)("content").notNull(),
    user_id: (0, pg_core_1.integer)("user_id").references(() => exports.users.id, {
        onDelete: "cascade",
    }),
    order_id: (0, pg_core_1.integer)("order_id").references(() => exports.orders.id, {
        onDelete: "cascade",
    }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.tags = (0, pg_core_1.pgTable)("tags", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    code: (0, pg_core_1.varchar)("code", { length: 10 }).notNull().unique(), // e.g., 'AP', 'PA', 'EM'
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(), // e.g., 'Apparel', 'Patch Apply'
    color: (0, pg_core_1.varchar)("color", { length: 20 }).notNull(),
    organization_id: (0, pg_core_1.integer)("organization_id").references(() => exports.organizations.id, { onDelete: "cascade" }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.order_tags = (0, pg_core_1.pgTable)("order_tags", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    order_id: (0, pg_core_1.integer)("order_id").references(() => exports.orders.id, {
        onDelete: "cascade",
    }),
    tag_id: (0, pg_core_1.integer)("tag_id").references(() => exports.tags.id, {
        onDelete: "cascade",
    }),
    quantity: (0, pg_core_1.integer)("quantity").notNull().default(1),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
