import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { getApiBaseUrl } from "@/lib/api";
import type { ShopListItem } from "@/lib/types/shop";
import { cn } from "@/lib/utils";

function formatFetchError(e: unknown, apiBase: string): string {
  const msg = e instanceof Error ? e.message : String(e);
  const low = msg.toLowerCase();
  if (low.includes("fetch failed") || low.includes("econnrefused")) {
    return `無法連線到後端 ${apiBase}（請在「另一個」終端機啟動 FastAPI，並保持視窗開著）。`;
  }
  return msg;
}

async function fetchShops(): Promise<ShopListItem[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/shops`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`無法取得店家列表：HTTP ${res.status}`);
  }
  return res.json() as Promise<ShopListItem[]>;
}

export default async function ShopsPage() {
  let shops: ShopListItem[];
  let error: string | null = null;
  const apiBase = getApiBaseUrl();
  try {
    shops = await fetchShops();
  } catch (e) {
    shops = [];
    error = formatFetchError(e, apiBase);
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            台南美甲店家
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            資料為假資料，之後會接正式資料庫。
          </p>
        </div>

        {error ? (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
            <span className="mt-2 block text-xs text-muted-foreground">
              前端（<code className="font-mono">npm run dev</code>）與後端（
              <code className="font-mono">uvicorn</code>
              ）要<strong className="text-foreground">兩個終端各跑一個</strong>。在{" "}
              <code className="rounded bg-muted px-1 font-mono text-foreground">
                backend
              </code>{" "}
              資料夾：
              <code className="mt-1 block rounded bg-muted px-2 py-1.5 font-mono text-[11px] leading-snug text-foreground sm:text-xs">
                .\.venv\Scripts\Activate.ps1
                <br />
                uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
              </code>
              先在瀏覽器開{" "}
              <a
                className="font-medium text-primary underline underline-offset-2"
                href={`${apiBase}/shops`}
                target="_blank"
                rel="noreferrer"
              >
                {apiBase}/shops
              </a>{" "}
              ，若能看到 JSON 代表後端正常，再重新整理本頁。
            </span>
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
