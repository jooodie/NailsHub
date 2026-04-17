import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden />
            MVP 開發中
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            在台南找美甲店、看服務與時段，線上完成預約
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            店家與預約資料由 Supabase 提供；設定好專案與 <code className="font-mono">.env.local</code>{" "}
            後即可在「瀏覽店家」使用完整流程。
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/shops" className={cn(buttonVariants({ size: "lg" }))}>
              瀏覽店家
            </Link>
            <Link
              href="#"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              了解更多
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
