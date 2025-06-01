import { relations } from "drizzle-orm/relations";
import { organizations, users, messages, orders, customers, jobFiles, orderItems, orderTags, tags, shippingAddresses } from "./schema";

export const usersRelations = relations(users, ({one, many}) => ({
	organization: one(organizations, {
		fields: [users.organizationId],
		references: [organizations.id]
	}),
	messages: many(messages),
	orders: many(orders),
}));

export const organizationsRelations = relations(organizations, ({many}) => ({
	users: many(users),
	customers: many(customers),
	orders: many(orders),
	tags: many(tags),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	user: one(users, {
		fields: [messages.userId],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [messages.orderId],
		references: [orders.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	messages: many(messages),
	jobFiles: many(jobFiles),
	orderItems: many(orderItems),
	orderTags: many(orderTags),
	shippingAddresses: many(shippingAddresses),
	organization: one(organizations, {
		fields: [orders.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [orders.assignedTo],
		references: [users.id]
	}),
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.id]
	}),
}));

export const customersRelations = relations(customers, ({one, many}) => ({
	organization: one(organizations, {
		fields: [customers.organizationId],
		references: [organizations.id]
	}),
	orders: many(orders),
}));

export const jobFilesRelations = relations(jobFiles, ({one}) => ({
	order: one(orders, {
		fields: [jobFiles.orderId],
		references: [orders.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
}));

export const orderTagsRelations = relations(orderTags, ({one}) => ({
	order: one(orders, {
		fields: [orderTags.orderId],
		references: [orders.id]
	}),
	tag: one(tags, {
		fields: [orderTags.tagId],
		references: [tags.id]
	}),
}));

export const tagsRelations = relations(tags, ({one, many}) => ({
	orderTags: many(orderTags),
	organization: one(organizations, {
		fields: [tags.organizationId],
		references: [organizations.id]
	}),
}));

export const shippingAddressesRelations = relations(shippingAddresses, ({one}) => ({
	order: one(orders, {
		fields: [shippingAddresses.orderId],
		references: [orders.id]
	}),
}));