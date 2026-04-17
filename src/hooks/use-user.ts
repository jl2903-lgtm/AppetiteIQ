"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type UseUserResult = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  }

  return { user, session, loading, signOut };
}
