import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingConfirmation } from "@/lib/types/booking";

type RawBooking = {
  id: string;
  shop_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  customer_name: string;
  customer_phone: string;
  customer_notes: string | null;
  status: string;
};

async function hydrateBooking(
  b: RawBooking,
): Promise<BookingConfirmation> {
  const sb = await createSupabaseServerClient();

  const { data: shop } = await sb
    .from("shops")
    .select("name")
    .eq("id", b.shop_id)
    .maybeSingle();

  const { data: svc } = await sb
    .from("shop_services")
    .select("name,price_ntd,duration_minutes")
    .eq("id", b.service_id)
    .maybeSingle();

  return {
    id: b.id,
    shop_id: b.shop_id,
    shop_name: (shop?.name as string) ?? "",
    service_id: b.service_id,
    service_name: (svc?.name as string) ?? "",
    price_ntd: (svc?.price_ntd as number) ?? 0,
    duration_minutes: (svc?.duration_minutes as number) ?? 0,
    date: b.date,
    time_slot: b.time_slot,
    customer_name: b.customer_name,
    customer_phone: b.customer_phone,
    customer_notes: b.customer_notes,
    status: b.status,
  };
}

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

  return hydrateBooking(b as RawBooking);
}

export async function listMyBookings(): Promise<BookingConfirmation[]> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!user) return [];

  const { data, error } = await sb
    .from("bookings")
    .select(
      "id,shop_id,service_id,date,time_slot,customer_name,customer_phone,customer_notes,status",
    )
    .eq("customer_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const out: BookingConfirmation[] = [];
  for (const row of data ?? []) {
    out.push(await hydrateBooking(row as RawBooking));
  }
  return out;
}
