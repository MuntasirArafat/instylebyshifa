"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // We only log once per path change
    const logVisit = async () => {
      try {
        await fetch("/api/analytics/log", { method: "POST" });
      } catch (e) {
        console.error("Failed to log visit", e);
      }
    };
    
    logVisit();
  }, [pathname]);

  return null;
}
