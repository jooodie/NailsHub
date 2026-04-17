import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthUser } from "@/lib/data/auth";
import { listMyBookings } from "@/lib/data/bookings";

export default async function MyBookingsPage() {
  const user = await getAuthUser();
  if (!user) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>請先登入</CardTitle>
              <CardDescription>登入後才能查看你的預約紀錄。</CardDescription>
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

  const bookings = await listMyBookings();

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">我的預約</h1>
        <p className="mt-1 text-sm text-muted-foreground">顯示你目前帳號建立的預約紀錄。</p>

        {bookings.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-6 text-sm text-muted-foreground">
              目前還沒有預約，去店家頁看看吧。
              <div className="mt-3">
                <Link href="/shops" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  瀏覽店家
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ul className="mt-6 space-y-4">
            {bookings.map((b) => (
              <li key={b.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{b.shop_name}</CardTitle>
                    <CardDescription>
                      {b.date} {b.time_slot} · {b.service_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">狀態：{b.status}</p>
                    <Link href={`/bookings/${b.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      查看詳情
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
