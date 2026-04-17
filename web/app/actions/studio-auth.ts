"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertMyProfile } from "@/lib/data/profile";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function hasAnyStudioMembership(userId: string): Promise<boolean> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("shop_memberships")
    .select("shop_id")
    .eq("user_id", userId)
    .limit(1);
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function studioSignInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    fail("/studio/sign-in", "請輸入 email 與密碼");
  }

  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    fail("/studio/sign-in", error.message);
  }

  const userId = data.user?.id;
  if (!userId) {
    fail("/studio/sign-in", "登入失敗");
  }

  if (!(await hasAnyStudioMembership(userId))) {
    await sb.auth.signOut();
    fail("/studio/sign-in", "此帳號沒有店家後台權限，請聯絡管理者綁定店家");
  }

  revalidatePath("/");
  redirect("/studio/availability");
}

export async function studioSignUpAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !phone || !email || !password) {
    fail("/studio/sign-up", "請完整填寫姓名、電話、email、密碼");
  }

  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) {
    fail("/studio/sign-up", error.message);
  }
  if (!data.user) {
    fail("/studio/sign-up", "註冊失敗");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();

  if (!session) {
    redirect(
      `/studio/sign-in?error=${encodeURIComponent("註冊成功，請先完成 email 驗證後登入")}`,
    );
  }

  await upsertMyProfile({ name, phone, email });

  if (!(await hasAnyStudioMembership(data.user.id))) {
    await sb.auth.signOut();
    redirect(
      `/studio/sign-in?error=${encodeURIComponent("帳號已建立，請由管理者先綁定店家權限")}`,
    );
  }

  revalidatePath("/");
  redirect("/studio/availability");
}
