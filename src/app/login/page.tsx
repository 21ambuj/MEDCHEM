"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const loginAs = (role: string) => {
    // We use cookies to simulate role-based access for the hackathon
    document.cookie = `role=${role}; path=/`;
    
    if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/seller");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AasaMedChem Login
          </h2>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => loginAs("ADMIN")}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition"
          >
            Login as ADMIN
          </button>

          <button
            onClick={() => loginAs("SELLER")}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Login as SELLER / USER
          </button>


        </div>
      </div>
    </div>
  );
}
