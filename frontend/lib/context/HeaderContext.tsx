"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface HeaderAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface HeaderConfig {
  title: string;
  showBackButton?: boolean;
  fallbackRoute?: string;
  onBack?: (() => void) | null;
  action?: HeaderAction | null;
}

interface HeaderContextProps {
  headerConfig: HeaderConfig | null;
  setHeaderConfig: (config: HeaderConfig | null) => void;
}

const HeaderContext = createContext<HeaderContextProps | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);

  return (
    <HeaderContext.Provider value={{ headerConfig, setHeaderConfig }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}
