"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as fbq from "@/app/lib/fpixel";

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
    fbq.pageview();
  }, [pathname]);

  return null;
}
