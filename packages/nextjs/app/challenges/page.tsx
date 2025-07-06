"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChallengesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireccionar automáticamente a la home con scroll a la sección de challenges
    router.push("/#challenges-section");
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <span className="ml-4 text-lg mt-4 text-base-content">Redirigiendo a la página principal...</span>
        <p className="text-sm text-base-content/70 mt-2">Los challenges ahora están integrados en la home.</p>
      </div>
    </div>
  );
}
