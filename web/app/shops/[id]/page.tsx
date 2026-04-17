import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

export default async function ShopDetailPlaceholderPage({ params }: Props) {
  const { id } = await params;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-sm text-muted-foreground">店家編號：{id}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          店家詳情
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          此頁面預留給服務項目、時段與預約流程；目前尚未接上 API。
        </p>
        <div className="mt-8">
          <Link href="/shops" className={buttonVariants({ variant: "outline" })}>
            回到列表
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
