"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { submitBooking } from "@/app/actions/booking";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ShopDetail } from "@/lib/types/shop";

type ProfilePrefill = {
  name: string;
  phone: string;
  email: string;
};

const selectClass = cn(
  "flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
);

type Props = {
  shop: ShopDetail;
  isLoggedIn: boolean;
  profile: ProfilePrefill | null;
};

export function BookingForm({ shop, isLoggedIn, profile }: Props) {
  const router = useRouter();
  const firstDay = shop.availability[0];
  const firstService = shop.services[0];

  const [serviceId, setServiceId] = useState(firstService?.id ?? "");
  const [date, setDate] = useState(firstDay?.date ?? "");

  const slotOptions = useMemo(() => {
    const day = shop.availability.find((d) => d.date === date);
    return day?.slots ?? [];
  }, [shop.availability, date]);

  const [time, setTime] = useState(() => {
    const day = shop.availability.find((d) => d.date === (firstDay?.date ?? ""));
    return day?.slots[0] ?? "";
  });

  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function handleDateChange(nextDate: string) {
    setDate(nextDate);
    const day = shop.availability.find((d) => d.date === nextDate);
    setTime(day?.slots[0] ?? "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const selectedService = shop.services.find((s) => s.id === serviceId);
    if (!selectedService || !time) return;

    setIsSubmitting(true);
    try {
      const result = await submitBooking({
        shop_id: shop.id,
        service_id: serviceId,
        date,
        time_slot: time,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_notes: notes.trim() ? notes.trim() : null,
      });
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      router.push(`/bookings/${result.bookingId}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "送出失敗");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>登入後可預約</CardTitle>
          <CardDescription>請先登入/註冊，系統會保存你的預約紀錄與聯絡資料。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/auth/sign-in" className={cn(buttonVariants({ size: "sm" }))}>
            使用者登入
          </Link>
          <Link href="/auth/sign-up" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            註冊帳號
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!firstService || !firstDay) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>預約</CardTitle>
          <CardDescription>
            店家尚未設定可預約時段或服務項目。
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>線上預約</CardTitle>
        <CardDescription>
          送出後會寫入 Supabase。姓名與電話可修改，若修改會覆寫你目前帳號的資料。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formError ? (
          <div
            className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {formError}
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="service">服務項目</Label>
            <select
              id="service"
              className={selectClass}
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              disabled={isSubmitting}
            >
              {shop.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · NT${s.price_ntd.toLocaleString()} · {s.duration_minutes}
                  分鐘
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <select
                id="date"
                className={selectClass}
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                required
                disabled={isSubmitting}
              >
                {shop.availability.map((d) => (
                  <option key={d.date} value={d.date}>
                    {d.date}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">時段</Label>
              <select
                id="time"
                className={selectClass}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={slotOptions.length === 0 || isSubmitting}
              >
                {slotOptions.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="王小姐"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">手機</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="09xxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email（登入帳號）</Label>
            <Input id="email" name="email" value={profile?.email ?? ""} disabled readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備註（選填）</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="例如：卸甲他店作品、避免特定色系…"
            />
          </div>

          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "送出中…" : "送出預約申請"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
