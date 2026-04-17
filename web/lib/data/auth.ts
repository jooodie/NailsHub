import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  email: string;
};

function isAuthSessionMissing(message: string): boolean {
  return message.toLowerCase().includes("auth session missing");
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await sb.auth.getUser();

  if (error) {
    if (isAuthSessionMissing(error.message)) return null;
    throw new Error(error.message);
  }
  if (!user || !user.email) return null;
  return { id: user.id, email: user.email };
}
