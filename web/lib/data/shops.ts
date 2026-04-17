import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ShopDetail, ShopListItem } from "@/lib/types/shop";

export const SUPPORTED_CITIES = ["台南市"] as const;
export const PREFERRED_DISTRICTS = ["東區", "中西區"] as const;

type ShopFilter = {
  city?: string;
  district?: string;
  date?: string;
};

function normalizeCity(city?: string): string {
  return city?.trim() || "台南市";
}

export async function listShopDistricts(city?: string): Promise<string[]> {
  if (normalizeCity(city) !== "台南市") {
    return [];
  }

  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.from("shops").select("district").order("district");
  if (error) throw new Error(error.message);

  const fromDb = new Set(
    (data ?? []).map((row) => String(row.district ?? "").trim()).filter(Boolean),
  );

  const ordered: string[] = PREFERRED_DISTRICTS.filter((d) => fromDb.has(d));
  const extra = Array.from(fromDb)
    .filter((d) => !ordered.includes(d))
    .sort((a, b) => a.localeCompare(b, "zh-Hant"));

  return [...ordered, ...extra];
}

export async function listShops(opts?: ShopFilter): Promise<ShopListItem[]> {
  const city = normalizeCity(opts?.city);
  if (city !== "台南市") {
    return [];
  }

  const sb = await createSupabaseServerClient();
  const district = opts?.district?.trim();
  const date = opts?.date?.trim();

  let shopIdsByDate: string[] | null = null;
  if (date) {
    const { data: rows, error: dateErr } = await sb
      .from("shop_availability")
      .select("shop_id")
      .eq("date", date);
    if (dateErr) throw new Error(dateErr.message);

    shopIdsByDate = Array.from(
      new Set((rows ?? []).map((row) => String(row.shop_id ?? "")).filter(Boolean)),
    );
    if (shopIdsByDate.length === 0) {
      return [];
    }
  }

  let query = sb
    .from("shops")
    .select("id,name,cover_image_url,district,summary")
    .order("id");

  if (district) {
    query = query.eq("district", district);
  }
  if (shopIdsByDate) {
    query = query.in("id", shopIdsByDate);
  }

  const { data, error } = await query;
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
