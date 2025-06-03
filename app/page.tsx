import { Dashboard } from "./components/Dashboard";
import { getDashboardStats } from "./actions/dashboard";
import { getTags } from "./workflow/actions";

export default async function Home() {
  // Fetch initial data on the server
  const [initialStats, availableTags] = await Promise.all([
    getDashboardStats(),
    getTags(),
  ]);

  return (
    <div className="container mx-auto py-6">
      <Dashboard initialStats={initialStats} availableTags={availableTags} />
    </div>
  );
}
