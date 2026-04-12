"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import { ToastProvider } from "@/components/Toast";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  return (
    <main
      className={`min-h-screen pb-24 lg:pb-8 flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? "lg:ml-64" : "lg:ml-[72px]"
      }`}
    >
      {children}
    </main>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <ToastProvider>
        <Sidebar />
        <DashboardShell>
          <Header />
          {children}
        </DashboardShell>
        <MobileNav />
      </ToastProvider>
    </SidebarProvider>
  );
}
