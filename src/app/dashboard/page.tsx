"use client";

import Dashboard from "@/components/UserDashboard";
import AuthGate from "@/components/AuthGate";

export default function DashboardPage() {
  const handleSelectCouple = (coupleId: string) => {
    console.log("Selected couple from parent:", coupleId);
  };

  return (
    <AuthGate>
      <Dashboard onSelectCouple={handleSelectCouple} />
    </AuthGate>
  );
}
