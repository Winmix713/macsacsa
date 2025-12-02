import React, { ReactNode } from "react";
import AppSidebar from "@/components/navigation/AppSidebar";
import GlobalHeader from "@/components/navigation/GlobalHeader";

interface PageLayoutProps {
  children: ReactNode;
  /** When true, wraps children in a centered container with standard paddings */
  container?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, container = true }) => {
  return (
    <div className="min-h-screen bg-black">
      <AppSidebar />
      <GlobalHeader />
      <main className="lg:ml-64 pt-16 lg:pt-0">
        {container ? (
          <div className="container mx-auto px-4 py-8">{children}</div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default PageLayout;
