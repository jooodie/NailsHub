import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border/80 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground hover:underline"
          >
            台南美甲預約
          </Link>
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

      {children}

      <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 台南美甲預約平台
      </footer>
    </div>
  );
}
