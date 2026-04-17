import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { BookingForm } from "@/components/shops/booking-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthUser } from "@/lib/data/auth";
import { getMyProfile } from "@/lib/data/profile";
import { getShopDetail } from "@/lib/data/shops";
import { formatDataError } from "@/lib/errors";

type Props = { params: Promise<{ id: string }> };

export default async function ShopDetailPage({ params }: Props) {
  const { id } = await params;

  let error: string | null = null;
  let shop: Awaited<ReturnType<typeof getShopDetail>> = null;
  try {
    shop = await getShopDetail(id);
  } catch (e) {
    error = formatDataError(e);
  }

  const user = await getAuthUser();
  const profile = user ? await getMyProfile() : null;

  if (error) {
    return (
      <AppShell>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href="/shops" className={buttonVariants({ variant: "outline", size: "sm" })}>
                回到列表
              </Link>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (!shop) {
    notFound();
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/shops" className="font-medium text-primary hover:underline">
            ← 店家列表
          </Link>
        </nav>

        <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-xl bg-muted sm:aspect-[24/9]">
          <Image
            src={shop.cover_image_url}
            alt={`${shop.name} 封面`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)] xl:grid-cols-[1fr_minmax(0,420px)]">
          <div className="min-w-0 space-y-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{shop.district}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {shop.name}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{shop.summary}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground">{shop.description}</p>
              <dl className="mt-6 space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">地址</dt>
                  <dd>{shop.address}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">電話</dt>
                  <dd>
                    <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                      {shop.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">服務項目與價格</CardTitle>
                <CardDescription>資料由 Supabase 提供。</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {shop.services.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        NT${s.price_ntd.toLocaleString()} · {s.duration_minutes} 分鐘
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">可預約時段</CardTitle>
                <CardDescription>示意欄位，之後可由店家後台維護。</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {shop.availability.map((day) => (
                    <li key={day.date}>
                      <span className="font-medium text-foreground">{day.date}</span>
                      <span className="text-muted-foreground">：</span>
                      {day.slots.join("、")}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <BookingForm
              shop={shop}
              isLoggedIn={Boolean(user)}
              profile={
                profile
                  ? { name: profile.name, phone: profile.phone, email: profile.email }
                  : null
              }
            />
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
