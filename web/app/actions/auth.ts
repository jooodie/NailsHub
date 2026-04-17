"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertMyProfile } from "@/lib/data/profile";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signUpAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !phone || !email || !password) {
    fail("/auth/sign-up", "請完整填寫姓名、電話、email、密碼");
  }

  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) {
    fail("/auth/sign-up", error.message);
  }
  if (!data.user) {
    fail("/auth/sign-up", "註冊失敗");
  }

  // 若專案要求 email 驗證，這裡可能尚無 session；則導去登入頁
  const {
    data: { session },
  } = await sb.auth.getSession();

  if (!session) {
    redirect(
      `/auth/sign-in?error=${encodeURIComponent("註冊成功，請先完成 email 驗證後登入")}`,
    );
  }

  await upsertMyProfile({ name, phone, email });
  revalidatePath("/");
  redirect("/shops");
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    fail("/auth/sign-in", "請輸入 email 與密碼");
  }

  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    fail("/auth/sign-in", error.message);
  }

  revalidatePath("/");
  redirect("/shops");
}

export async function signOutAction(): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signOut();
  if (error) {
    fail("/", error.message);
  }
  revalidatePath("/");
  redirect("/");
}
