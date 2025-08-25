import { redirect } from "next/navigation";

export default async function AuthGatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const fromValue = Array.isArray(params.from) ? params.from[0] : params.from;
  const fromParam = typeof fromValue === "string" && fromValue ? fromValue : "/";
  redirect(`/login?from=${encodeURIComponent(fromParam)}`);
}
