import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ShopDetail, ShopListItem } from "@/lib/types/shop";

export async function listShops(): Promise<ShopListItem[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("shops")
    .select("id,name,cover_image_url,district,summary")
    .order("id");
  if (error) throw new Error(error.message);
  return (data ?? []) as ShopListItem[];
}

export async function getShopDetail(shopId: string): Promise<ShopDetail | null> {
  const sb = await createSupabaseServerClient();

  const { data: shop, error: shopErr } = await sb
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .maybeSingle();
  if (shopErr) throw new Error(shopErr.message);
  if (!shop) return null;

  const { data: services, error: sErr } = await sb
    .from("shop_services")
    .select("id,name,price_ntd,duration_minutes")
    .eq("shop_id", shopId)
    .order("id");
  if (sErr) throw new Error(sErr.message);

  const { data: availRows, error: aErr } = await sb
    .from("shop_availability")
    .select("date,slots")
    .eq("shop_id", shopId)
    .order("date");
  if (aErr) throw new Error(aErr.message);

  const availability = (availRows ?? []).map((row) => ({
    date: row.date as string,
    slots: row.slots as string[],
  }));

  return {
    id: shop.id as string,
    name: shop.name as string,
    cover_image_url: shop.cover_image_url as string,
    district: shop.district as string,
    summary: shop.summary as string,
    address: shop.address as string,
    description: shop.description as string,
    phone: shop.phone as string,
    services: (services ?? []) as ShopDetail["services"],
    availability,
  };
}
