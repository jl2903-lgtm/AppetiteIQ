import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">AppetiteIQ</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Intelligent insights for your business.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </main>
  );
}
