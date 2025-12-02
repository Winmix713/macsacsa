import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  /** When true, wraps children in a centered container with standard paddings */
  container?: boolean;
}

const PageLayout = ({ children, container = true }: PageLayoutProps) => {
  if (!container) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};

export default PageLayout;
