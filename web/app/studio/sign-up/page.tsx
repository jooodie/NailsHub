import Link from "next/link";

import { studioSignUpAction } from "@/app/actions/studio-auth";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function StudioSignUpPage({ searchParams }: Props) {
  const sp = await searchParams;
  const error = sp.error?.trim();

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>店家註冊</CardTitle>
            <CardDescription>
              註冊後可用店家登入；若未綁定店家權限，請由管理者在 `shop_memberships` 新增關聯。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            <form action={studioSignUpAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話</Label>
                <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full">
                註冊店家帳號
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              已有帳號？
              <Link href="/studio/sign-in" className="ml-1 text-primary hover:underline">
                店家登入
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </AppShell>
  );
}
