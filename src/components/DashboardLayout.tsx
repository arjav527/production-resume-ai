import { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import { ModeToggle } from "@/components/mode-toggle";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 min-h-screen transition-all duration-300">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <ModeToggle />
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
