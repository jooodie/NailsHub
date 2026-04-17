import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border/80 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            台南美甲預約
          </span>
          <nav className="flex items-center gap-2">
            <Link
              href="#"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              店家登入
            </Link>
          </nav>
        </div>
      </header>

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
            接下來會依 MVP 規格逐步接上店家列表、店家詳情與預約流程。此頁用於確認
            Next.js、Tailwind 與 shadcn/ui 已正確整合。
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#" className={cn(buttonVariants({ size: "lg" }))}>
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

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 台南美甲預約平台
      </footer>
    </div>
  );
}
