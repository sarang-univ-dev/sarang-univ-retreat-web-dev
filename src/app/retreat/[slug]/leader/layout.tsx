"use client";

import { useSlug } from "@/hooks/use-slug";
import { LeaderHeader } from "@/components/leader/leader-header";

export default function LeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = useSlug();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LeaderHeader slug={slug} />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 flex flex-col">
        {children}
      </main>
    </div>
  );
}
