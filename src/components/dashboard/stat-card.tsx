type StatCardProps = {
  label: string;
  value: string;
  change?: string;
};

export default function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {change && (
        <div className="mt-1 text-xs text-muted-foreground">{change}</div>
      )}
    </div>
  );
}
