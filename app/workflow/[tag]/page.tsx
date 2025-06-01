import { db } from "../../../lib/db";
import { orders, order_tags, tags } from "../../../lib/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default async function WorkflowPage({ params }: PageProps) {
  const { tag } = await params;

  const ordersWithTag = await db
    .select({
      id: orders.id,
      order_number: orders.order_number,
      title: orders.title,
      status: orders.status,
      ship_date: orders.ship_date,
      created_at: orders.created_at,
    })
    .from(orders)
    .innerJoin(order_tags, eq(orders.id, order_tags.order_id))
    .innerJoin(tags, eq(order_tags.tag_id, tags.id))
    .where(eq(tags.code, tag));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders for Tag: {tag}</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Order #</th>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Ship Date</th>
            <th className="py-2 px-4 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {ordersWithTag.map((order) => (
            <tr key={order.id}>
              <td className="py-2 px-4 border-b">{order.order_number}</td>
              <td className="py-2 px-4 border-b">{order.title}</td>
              <td className="py-2 px-4 border-b">{order.status}</td>
              <td className="py-2 px-4 border-b">
                {order.ship_date?.toString()}
              </td>
              <td className="py-2 px-4 border-b">
                {order.created_at?.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
