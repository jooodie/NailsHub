import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingConfirmation } from "@/lib/types/booking";

export async function getBookingById(
  bookingId: string,
): Promise<BookingConfirmation | null> {
  const sb = await createSupabaseServerClient();

  const { data: b, error } = await sb
    .from("bookings")
    .select(
      "id,shop_id,service_id,date,time_slot,customer_name,customer_phone,customer_notes,status",
    )
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!b) return null;

  const { data: shop } = await sb
    .from("shops")
    .select("name")
    .eq("id", b.shop_id as string)
    .maybeSingle();

  const { data: svc } = await sb
    .from("shop_services")
    .select("name,price_ntd,duration_minutes")
    .eq("id", b.service_id as string)
    .maybeSingle();

  return {
    id: b.id as string,
    shop_id: b.shop_id as string,
    shop_name: (shop?.name as string) ?? "",
    service_id: b.service_id as string,
    service_name: (svc?.name as string) ?? "",
    price_ntd: (svc?.price_ntd as number) ?? 0,
    duration_minutes: (svc?.duration_minutes as number) ?? 0,
    date: b.date as string,
    time_slot: b.time_slot as string,
    customer_name: b.customer_name as string,
    customer_phone: b.customer_phone as string,
    customer_notes: (b.customer_notes as string | null) ?? null,
    status: b.status as string,
  };
}
