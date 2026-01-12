"use client";

import { useAccessibilityInit } from "@/lib/hooks/use-accessibility";

export function AccessibilityProvider({ 
  children,
}: { 
  children: React.ReactNode;
}) {
  useAccessibilityInit();

  return <>{children}</>;
}
