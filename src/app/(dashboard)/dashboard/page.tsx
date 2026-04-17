import StatCard from "@/components/dashboard/stat-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your account activity.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value="$12,480" change="+12.4%" />
        <StatCard label="Active users" value="2,341" change="+3.1%" />
        <StatCard label="Conversions" value="184" change="-1.8%" />
        <StatCard label="Churn" value="2.2%" change="-0.4%" />
      </div>
    </div>
  );
}
