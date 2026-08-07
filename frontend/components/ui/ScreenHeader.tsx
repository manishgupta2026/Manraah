"use client";

import { useEffect } from "react";
import { useHeader, HeaderAction } from "@/frontend/lib/context/HeaderContext";

interface ScreenHeaderProps {
  title: string;
  showBackButton?: boolean;
  fallbackRoute?: string;
  onBack?: (() => void) | null;
  action?: HeaderAction | null;
}

export default function ScreenHeader({
  title,
  showBackButton = true,
  fallbackRoute,
  onBack,
  action,
}: ScreenHeaderProps) {
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title,
      showBackButton,
      fallbackRoute,
      onBack,
      action,
    });

    return () => {
      setHeaderConfig(null);
    };
  }, [title, showBackButton, fallbackRoute, onBack, action, setHeaderConfig]);

  return null;
}
