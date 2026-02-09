import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { MotoboySidebar } from "@/components/motoboy/sidebar";

export default async function MotoboyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "motoboy") {
    redirect("/login");
  }

  const sql = getDb();
  const users = await sql`SELECT vehicle_type, is_available FROM users WHERE id = ${session.userId}`;
  const vehicleType = users[0]?.vehicle_type || "moto";
  const isOnline = users[0]?.is_available || false;

  return (
    <div className="flex min-h-screen">
      <MotoboySidebar userName={session.name} vehicleType={vehicleType} isOnline={isOnline} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
