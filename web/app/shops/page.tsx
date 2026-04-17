import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listShopDistricts,
  listShops,
  SUPPORTED_CITIES,
} from "@/lib/data/shops";
import { formatDataError } from "@/lib/errors";
import type { ShopListItem } from "@/lib/types/shop";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ city?: string; district?: string; date?: string }>;
};

export default async function ShopsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const city = sp.city?.trim() || "台南市";
  const district = sp.district?.trim() || "";
  const date = sp.date?.trim() || "";

  let shops: ShopListItem[];
  let districts: string[];
  let error: string | null = null;

  try {
    [shops, districts] = await Promise.all([
      listShops({
        city,
        district: district || undefined,
        date: date || undefined,
      }),
      listShopDistricts(city),
    ]);
  } catch (e) {
    shops = [];
    districts = [];
    error = formatDataError(e);
  }

  const hasFilter = Boolean(district || date || city !== "台南市");

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            台南美甲店家
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            資料來自 Supabase（請先建立專案並執行 <code className="font-mono">supabase/migrations</code>{" "}
            內 SQL）。
          </p>
        </div>

        {!error ? (
          <section className="mb-6 rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-sm font-medium text-foreground">篩選條件</p>

            <form method="get" action="/shops" className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">縣市</Label>
                <select
                  id="city"
                  name="city"
                  defaultValue={city}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {SUPPORTED_CITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">各區</Label>
                <select
                  id="district"
                  name="district"
                  defaultValue={district}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">全部</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">想預約的日期</Label>
                <Input id="date" name="date" type="date" defaultValue={date} />
              </div>

              <div className="md:col-span-3 flex flex-wrap gap-2">
                <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
                  套用篩選
                </button>
                <Link href="/shops" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  清除條件
                </Link>
              </div>
            </form>
          </section>
        ) : null}

        {error ? (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
            <p className="mt-2 text-xs text-muted-foreground">
              請在 <code className="rounded bg-muted px-1 font-mono">web/.env.local</code> 設定{" "}
              <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> 與{" "}
              <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
              ，並在 Supabase SQL Editor 執行專案內的 migration 建立資料表。
            </p>
          </div>
        ) : shops.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
            {hasFilter
              ? "目前沒有符合你篩選條件的店家。"
              : "目前尚無店家資料。"}
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {shops.map((shop) => (
              <li key={shop.id}>
                <article className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative aspect-[16/10] w-full bg-muted">
                    <Image
                      src={shop.cover_image_url}
                      alt={`${shop.name} 封面`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      {city}・{shop.district}
                    </p>
                    <h2 className="text-lg font-semibold leading-snug text-foreground">
                      {shop.name}
                    </h2>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {shop.summary}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/shops/${shop.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        查看詳情
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
