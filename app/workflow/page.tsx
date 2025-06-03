import FilterBar from "./FilterBar";
import { WorkflowTable } from "../components/WorkflowTable";
import { getOrders } from "./actions";

export default async function WorkflowPage({
  searchParams,
}: {
  searchParams: Promise<{
    tag?: string; // Single tag for backwards compatibility
    tags?: string | string[]; // Multiple tags
    sort?: string;
    search?: string;
    status?: string;
    dateRange?: string;
  }>;
}) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Handle both single tag and multiple tags from URL parameters
  let selectedTags: string[] = [];
  if (params.tags) {
    if (Array.isArray(params.tags)) {
      selectedTags = params.tags;
    } else {
      // Handle comma-separated tags or single tag
      selectedTags = params.tags.includes(",")
        ? params.tags.split(",").filter(Boolean)
        : [params.tags];
    }
  }

  const orders = await getOrders({
    tag: params.tag, // Single tag for FilterBar compatibility
    tags: selectedTags.length > 0 ? selectedTags : undefined, // Multiple tags from Sidebar
    sort: params.sort,
    search: params.search,
    status: params.status,
    dateRange: params.dateRange,
  });

  // Transform orders to match WorkflowTable expected format
  const transformedOrders = orders.map((order) => ({
    ...order,
    customerName: order.customerName || "Unknown Customer", // Handle null customerName
  }));

  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <FilterBar />
      </div>
      <WorkflowTable orders={transformedOrders} />
    </div>
  );
}
