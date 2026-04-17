import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

function isAuthSessionMissing(message: string): boolean {
  return message.toLowerCase().includes("auth session missing");
}

export async function getMyProfile(): Promise<Profile | null> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr) {
    if (isAuthSessionMissing(userErr.message)) return null;
    throw new Error(userErr.message);
  }
  if (!user) return null;

  const { data, error } = await sb
    .from("profiles")
    .select("id,name,phone,email")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    const seed = {
      id: user.id,
      name: "",
      phone: "",
      email: user.email ?? "",
    };
    const { error: insertErr } = await sb.from("profiles").insert(seed);
    if (insertErr) throw new Error(insertErr.message);
    return seed;
  }

  return {
    id: String(data.id),
    name: String(data.name ?? ""),
    phone: String(data.phone ?? ""),
    email: String(data.email ?? user.email ?? ""),
  };
}

export async function upsertMyProfile(input: {
  name: string;
  phone: string;
  email: string;
}): Promise<void> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr) {
    if (isAuthSessionMissing(userErr.message)) throw new Error("請先登入");
    throw new Error(userErr.message);
  }
  if (!user) throw new Error("請先登入");

  const payload = {
    id: user.id,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(error.message);
}
