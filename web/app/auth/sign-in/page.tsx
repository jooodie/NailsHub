import Link from "next/link";

import { signInAction } from "@/app/actions/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const sp = await searchParams;
  const error = sp.error?.trim();

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>使用者登入</CardTitle>
            <CardDescription>以 Email + 密碼登入後即可建立與查看自己的預約。</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            <form action={signInAction} className="space-y-4">
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
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full">
                登入
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              還沒有帳號？
              <Link href="/auth/sign-up" className="ml-1 text-primary hover:underline">
                立即註冊
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </AppShell>
  );
}
