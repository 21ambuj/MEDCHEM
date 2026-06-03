"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the login page when they visit the root URL
    router.push("/login");
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <p className="text-gray-500">Redirecting to Login...</p>
    </main>
  );
}
