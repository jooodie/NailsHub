import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StudioMembership = {
  shop_id: string;
  role: "owner" | "staff";
};

export type ManagedStudio = {
  shop_id: string;
  shop_name: string;
  role: "owner" | "staff";
};

export type StudioAvailabilityRow = {
  shop_id: string;
  date: string;
  slots: string[];
};

function isAuthSessionMissing(message: string): boolean {
  return message.toLowerCase().includes("auth session missing");
}

export async function getMyStudioMemberships(): Promise<StudioMembership[]> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr) {
    if (isAuthSessionMissing(userErr.message)) return [];
    throw new Error(userErr.message);
  }
  if (!user) return [];

  const { data, error } = await sb
    .from("shop_memberships")
    .select("shop_id,role")
    .eq("user_id", user.id)
    .order("shop_id");
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => ({
    shop_id: String(r.shop_id),
    role: (r.role as "owner" | "staff") ?? "staff",
  }));
}

export async function listStudioAvailability(shopId: string): Promise<StudioAvailabilityRow[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("shop_availability")
    .select("shop_id,date,slots")
    .eq("shop_id", shopId)
    .order("date");
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => ({
    shop_id: String(r.shop_id),
    date: String(r.date),
    slots: (r.slots as string[]) ?? [],
  }));
}

export async function listStudioAvailabilityByMonth(
  shopId: string,
  month: string,
): Promise<StudioAvailabilityRow[]> {
  const [y, m] = month.split("-").map((v) => Number(v));
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("shop_availability")
    .select("shop_id,date,slots")
    .eq("shop_id", shopId)
    .gte("date", startStr)
    .lte("date", endStr)
    .order("date");
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => ({
    shop_id: String(r.shop_id),
    date: String(r.date),
    slots: (r.slots as string[]) ?? [],
  }));
}

export async function getMyPrimaryManagedStudio(): Promise<ManagedStudio | null> {
  const memberships = await getMyStudioMemberships();
  if (memberships.length === 0) return null;

  const primary = memberships[0];
  const sb = await createSupabaseServerClient();
  const { data: shop, error } = await sb
    .from("shops")
    .select("name")
    .eq("id", primary.shop_id)
    .maybeSingle();
  if (error) throw new Error(error.message);

  return {
    shop_id: primary.shop_id,
    role: primary.role,
    shop_name: String(shop?.name ?? primary.shop_id),
  };
}
