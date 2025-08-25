import { redirect } from "next/navigation";

interface AuthGatePageProps {
  searchParams: {
    from?: string;
  };
}

export default function AuthGatePage({ searchParams }: AuthGatePageProps) {
  const fromParam = typeof searchParams?.from === "string" && searchParams.from ? searchParams.from : "/";
  redirect(`/login?from=${encodeURIComponent(fromParam)}`);
}
