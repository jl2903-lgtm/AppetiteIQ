export default function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <div className="text-sm text-muted-foreground">Workspace</div>
      <div className="flex items-center gap-3">
        <button className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Account
        </button>
      </div>
    </header>
  );
}
