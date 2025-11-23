import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/convex-server";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = await params;
  const categorySlug = decodeURIComponent(resolvedParams.category);
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return <>{children}</>;
}
