import Link from "next/link";

import {
  applyMonthlyAvailabilityAction,
} from "@/app/actions/studio";
import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getAuthUser } from "@/lib/data/auth";
import {
  getMyPrimaryManagedStudio,
  listStudioAvailabilityByMonth,
} from "@/lib/data/studio";

type Props = {
  searchParams: Promise<{ month?: string; error?: string; success?: string; preset?: string }>;
};

const TIME_SLOT_OPTIONS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
  "19:30",
] as const;

function monthChoices(): string[] {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), 1);
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return [current, next].map((d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map((v) => Number(v));
  return `${y} 年 ${m} 月`;
}

function monthDates(month: string): string[] {
  const [y, m] = month.split("-").map((v) => Number(v));
  const end = new Date(y, m, 0).getDate();
  const out: string[] = [];
  for (let d = 1; d <= end; d += 1) {
    out.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return out;
}

export default async function StudioAvailabilityPage({ searchParams }: Props) {
  const user = await getAuthUser();
  const sp = await searchParams;
  const months = monthChoices();
  const selectedMonth = months.includes(String(sp.month ?? "")) ? String(sp.month) : months[0];

  if (!user) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>請先登入</CardTitle>
              <CardDescription>店家後台需要先登入有權限的店家帳號。</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/sign-in" className={buttonVariants({ size: "sm" })}>
                前往登入
              </Link>
            </CardContent>
          </Card>
        </main>
      </AppShell>
    );
  }

  const studio = await getMyPrimaryManagedStudio();
  if (!studio) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>無店家後台權限</CardTitle>
              <CardDescription>
                目前你的帳號沒有綁定店家角色。請先在 `shop_memberships` 新增對應關聯。
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </AppShell>
    );
  }

  const availability = await listStudioAvailabilityByMonth(studio.shop_id, selectedMonth);
  const activeDatesFromDb = new Set(availability.map((row) => row.date));
  const activeSlots = new Set(availability.flatMap((row) => row.slots));
  const dates = monthDates(selectedMonth);
  const activeDates =
    sp.preset === "all" ? new Set(dates) : activeDatesFromDb;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {studio.shop_name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          請設定當月或下個月的可預約日期與時段。未勾選的日期視為休假/不開放。
        </p>

        <div className="mt-6 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">整月可預約設定</CardTitle>
              <CardDescription>先選月份，再勾選開放日期與時段，一次更新。</CardDescription>
            </CardHeader>
            <CardContent>
              {sp.error ? (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {sp.error}
                </div>
              ) : null}
              {sp.success ? (
                <div className="mb-4 rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                  {sp.success}
                </div>
              ) : null}

              <form action={applyMonthlyAvailabilityAction} className="space-y-6">
                <input type="hidden" name="shop_id" value={studio.shop_id} />

                <div className="space-y-2">
                  <Label htmlFor="month">月份</Label>
                  <select
                    id="month"
                    name="month"
                    defaultValue={selectedMonth}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {monthLabel(month)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>可預約日期</Label>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/studio/availability?month=${encodeURIComponent(selectedMonth)}&preset=all`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      全選
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      按下「全選」後，本月日期會全部自動勾選。
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {dates.map((date) => (
                      <label
                        key={date}
                        className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="dates"
                          value={date}
                          defaultChecked={activeDates.has(date)}
                        />
                        <span>{date.slice(-2)} 日</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>可預約時段</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {TIME_SLOT_OPTIONS.map((slot) => (
                      <label
                        key={slot}
                        className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="slots"
                          value={slot}
                          defaultChecked={activeSlots.has(slot)}
                        />
                        <span>{slot}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" className={buttonVariants({ size: "sm" })}>
                  更新整月設定
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
