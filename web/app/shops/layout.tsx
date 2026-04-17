import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "台南美甲店家｜台南美甲預約",
  description: "瀏覽台南美甲店家列表（MVP）",
};

export default function ShopsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
