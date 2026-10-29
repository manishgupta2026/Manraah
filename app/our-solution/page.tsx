import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function OurSolutionPage({ searchParams }: PageProps) {
  const target = searchParams?.target;
  const targetStr = Array.isArray(target) ? target[0] : target;

  if (
    targetStr === "corporates" ||
    targetStr === "corporate" ||
    targetStr === "employees" ||
    targetStr === "workplace"
  ) {
    redirect("/our-solution/corporates");
  }

  redirect("/our-solution/students");
}
