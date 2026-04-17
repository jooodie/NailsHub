"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getShopDetail } from "@/lib/data/shops";
import type { BookingCreatePayload } from "@/lib/types/booking";

export type SubmitBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; message: string };

export async function submitBooking(
  payload: BookingCreatePayload,
): Promise<SubmitBookingResult> {
  try {
    const shop = await getShopDetail(payload.shop_id);
    if (!shop) {
      return { ok: false, message: "店家不存在" };
    }

    const svc = shop.services.find((s) => s.id === payload.service_id);
    if (!svc) {
      return { ok: false, message: "服務項目不存在於該店家" };
    }

    const day = shop.availability.find((d) => d.date === payload.date);
    if (!day || !day.slots.includes(payload.time_slot)) {
      return { ok: false, message: "該日期或時段無法預約" };
    }

    const sb = await createSupabaseServerClient();
    const { data, error } = await sb
      .from("bookings")
      .insert({
        shop_id: payload.shop_id,
        service_id: payload.service_id,
        date: payload.date,
        time_slot: payload.time_slot,
        customer_name: payload.customer_name.trim(),
        customer_phone: payload.customer_phone.trim(),
        customer_notes: payload.customer_notes?.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }
    if (!data?.id) {
      return { ok: false, message: "建立預約失敗" };
    }

    return { ok: true, bookingId: data.id as string };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "建立預約失敗";
    return { ok: false, message: msg };
  }
}
