"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-8 rounded-[32px] bg-red-50/50 dark:bg-red-950/10 border border-red-200/40 dark:border-red-900/40 text-center space-y-4 max-w-lg mx-auto my-12 shadow-md">
          <span className="text-4xl block font-emoji">⚠️</span>
          <h3 className="text-lg font-heading font-black text-red-650 dark:text-red-400">Something went wrong</h3>
          <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
            An unexpected error occurred while rendering this section.
          </p>
          <pre className="p-4 rounded-2xl bg-red-100/50 dark:bg-red-950/30 text-[10px] text-red-600 dark:text-red-400 font-mono text-left overflow-x-auto whitespace-pre-wrap">
            {this.state.error?.message || "Unknown error"}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-650 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
