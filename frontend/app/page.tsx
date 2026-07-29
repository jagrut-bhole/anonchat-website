"use client";

import { redirect } from "next/navigation";
import { PAGE_ROUTES } from "@/lib/route";
import { AuroraBackground } from "@/components/LandingPage/auroraBg";

export default function Home() {
  
  return (
    <AuroraBackground
      variant="forest"
      className="flex h-full min-h-screen w-full items-center justify-center rounded-xl blur-in-sm"
      childrenClassName="flex flex-col items-center justify-center gap-4 text-center px-6"
    >
      <h1 className="text-4xl font-bold text-white drop-shadow-lg md:text-6xl">
        Aurora Background
      </h1>
      <p className="max-w-md text-lg text-white/80">
        A living, animated canvas backdrop with multiple color variants.
      </p>
    </AuroraBackground>
  );
}
