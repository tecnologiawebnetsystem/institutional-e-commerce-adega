import React from "react"
import { redirect } from "next/navigation";
import { getSession, getUserStore } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    redirect("/login");
  }

  const store = await getUserStore(session.userId);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userName={session.name} storeName={store?.name} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
