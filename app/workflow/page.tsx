import FilterBar from "./FilterBar";
import { WorkflowTable } from "../components/WorkflowTable";
import { getOrders } from "./actions";

export default async function WorkflowPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orders = await getOrders(resolvedSearchParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <FilterBar />
      </div>
      <WorkflowTable orders={orders} />
    </div>
  );
}
