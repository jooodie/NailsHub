"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyStudioMemberships } from "@/lib/data/studio";

async function canManageShop(shopId: string): Promise<boolean> {
  const memberships = await getMyStudioMemberships();
  return memberships.some((m) => m.shop_id === shopId);
}

function fail(shopId: string, message: string): never {
  redirect(`/studio/availability?shop_id=${encodeURIComponent(shopId)}&error=${encodeURIComponent(message)}`);
}

function monthDateRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map((v) => Number(v));
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function applyMonthlyAvailabilityAction(formData: FormData): Promise<void> {
  const shopId = String(formData.get("shop_id") ?? "").trim();
  const month = String(formData.get("month") ?? "").trim();
  const selectedDates = formData
    .getAll("dates")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const selectedSlots = formData
    .getAll("slots")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (!shopId || !month) {
    fail(shopId || "", "請提供店家與月份");
  }
  if (!(await canManageShop(shopId))) {
    fail(shopId, "你沒有權限管理此店家");
  }

  const { start, end } = monthDateRange(month);
  const slots = Array.from(new Set(selectedSlots));

  const sb = await createSupabaseServerClient();
  const { error: delErr } = await sb
    .from("shop_availability")
    .delete()
    .eq("shop_id", shopId)
    .gte("date", start)
    .lte("date", end);

  if (delErr) {
    fail(shopId, delErr.message);
  }

  if (selectedDates.length > 0) {
    const rows = selectedDates.map((date) => ({
      shop_id: shopId,
      date,
      slots,
    }));
    const { error: insertErr } = await sb.from("shop_availability").insert(rows);
    if (insertErr) {
      fail(shopId, insertErr.message);
    }
  }

  revalidatePath("/studio/availability");
  revalidatePath("/shops");
  redirect(
    `/studio/availability?month=${encodeURIComponent(month)}&success=${encodeURIComponent("已更新整月可預約設定")}`,
  );
}
