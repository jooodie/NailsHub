import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { getAuthUser } from "@/lib/data/auth";
import { getMyStudioMemberships } from "@/lib/data/studio";
import { cn } from "@/lib/utils";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  const studioMemberships = user ? await getMyStudioMemberships() : [];
  const hasStudio = studioMemberships.length > 0;

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
            {user ? (
              <>
                <Link href="/my/bookings" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                  我的預約
                </Link>
                {hasStudio ? (
                  <Link href="/studio/availability" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                    店家後台
                  </Link>
                ) : null}
                <form action={signOutAction}>
                  <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    登出
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                  使用者登入
                </Link>
                <Link href="/studio/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                  店家登入
                </Link>
                <Link href="/auth/sign-up" className={cn(buttonVariants({ size: "sm" }))}>
                  註冊
                </Link>
              </>
            )}
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
