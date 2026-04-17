import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBookingById } from "@/lib/data/bookings";
import { formatDataError } from "@/lib/errors";

type Props = { params: Promise<{ id: string }> };

export default async function BookingConfirmationPage({ params }: Props) {
  const { id } = await params;

  let error: string | null = null;
  let booking: Awaited<ReturnType<typeof getBookingById>> = null;
  try {
    booking = await getBookingById(id);
  } catch (e) {
    error = formatDataError(e);
  }

  if (error) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
            <div className="mt-3">
              <Link href="/shops" className={buttonVariants({ variant: "outline", size: "sm" })}>
                回到店家列表
              </Link>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (!booking) {
    notFound();
  }

  const scheduled = `${booking.date} ${booking.time_slot}`;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>預約已建立</CardTitle>
            <CardDescription>紀錄已寫入 Supabase。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p className="font-mono text-base font-medium text-foreground">{booking.id}</p>
            <dl className="grid gap-3 sm:grid-cols-[6rem_1fr] sm:gap-x-4">
              <dt className="text-muted-foreground">狀態</dt>
              <dd className="capitalize">{booking.status}</dd>
              <dt className="text-muted-foreground">店家</dt>
              <dd>{booking.shop_name}</dd>
              <dt className="text-muted-foreground">服務</dt>
              <dd>
                {booking.service_name}（NT${booking.price_ntd.toLocaleString()}，約{" "}
                {booking.duration_minutes} 分鐘）
              </dd>
              <dt className="text-muted-foreground">日期／時間</dt>
              <dd>{scheduled}</dd>
              <dt className="text-muted-foreground">姓名</dt>
              <dd>{booking.customer_name}</dd>
              <dt className="text-muted-foreground">電話</dt>
              <dd>{booking.customer_phone}</dd>
              {booking.customer_notes ? (
                <>
                  <dt className="text-muted-foreground">備註</dt>
                  <dd className="whitespace-pre-wrap">{booking.customer_notes}</dd>
                </>
              ) : null}
            </dl>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/shops/${booking.shop_id}`}
                className={buttonVariants({ variant: "outline" })}
              >
                返回店家
              </Link>
              <Link href="/shops" className={buttonVariants({ variant: "ghost" })}>
                瀏覽店家列表
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </AppShell>
  );
}
