"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in ${this.props.name}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg my-4 text-red-700">
          <h3 className="font-bold">Error in {this.props.name}</h3>
          <pre className="text-xs mt-2 overflow-auto whitespace-pre-wrap">{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
