import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { listShops } from "@/lib/data/shops";
import { formatDataError } from "@/lib/errors";
import type { ShopListItem } from "@/lib/types/shop";
import { cn } from "@/lib/utils";

export default async function ShopsPage() {
  let shops: ShopListItem[];
  let error: string | null = null;
  try {
    shops = await listShops();
  } catch (e) {
    shops = [];
    error = formatDataError(e);
  }

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
                      {shop.district}
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
