"use client";

import type { NextPage } from "next";
import { CreateChallenge } from "~~/components/flagchain/CreateChallenge";

const CreateChallengePage: NextPage = () => {
  const handleChallengeCreated = (challengeId: number) => {
    console.log("Challenge created with ID:", challengeId);
    // Redirigir a la página de challenges o mostrar mensaje de éxito
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full">
          <div className="text-center mb-8">
            <span className="block text-2xl mb-2 text-base-content">Añadir Nuevo Challenge</span>
            <div className="flex items-center justify-center gap-4">
              <div className="relative w-10 h-[43px]">
                <img src="/logo.png" alt="FlagChain logo" className="w-full h-full object-contain dark:brightness-0 dark:invert" />
              </div>
              <span className="block text-4xl font-bold text-base-content">FlagChain CTF</span>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12 min-h-screen">
          <CreateChallenge onChallengeCreated={handleChallengeCreated} />
        </div>
      </div>
    </>
  );
};

export default CreateChallengePage; 