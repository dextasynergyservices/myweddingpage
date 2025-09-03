"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AuthGateProps {
  children: ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      await getSession(); // still fetch session in case you want it later
      setLoading(false);
    };
    fetchSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
