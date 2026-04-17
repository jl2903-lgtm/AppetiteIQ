"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { agency_name: agencyName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage("Check your email to confirm your account.");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start your free trial with AppetiteIQ.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="agency" className="text-sm font-medium">
            Agency name
          </label>
          <input
            id="agency"
            type="text"
            required
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-700" role="status">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
