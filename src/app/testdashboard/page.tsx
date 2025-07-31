"use client";

import Dashboard from "@/components/testdashboard";
import AuthGate from "@/components/AuthGate";

export default function TestDashboard() {
  const handleSelectCouple = (coupleId: string) => {
    console.log("Selected couple from parent:", coupleId);
  };

  return (
    <AuthGate>
      <Dashboard onSelectCouple={handleSelectCouple} />
    </AuthGate>
  );
}
