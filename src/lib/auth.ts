import { createSupabaseServerClient } from "@/lib/supabase";
import type { User } from "@/types/user";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.name as string | undefined) ?? "",
    createdAt: user.created_at,
  };
}
