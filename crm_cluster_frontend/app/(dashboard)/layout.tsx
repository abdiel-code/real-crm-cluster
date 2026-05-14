"use client";
import { useState } from "react";

import SideBar from "./components/SideBar/SideBar";
import { SocketProvider } from "./lib/SocketContext";

export default function DahsboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen">
      <SideBar
        isCollapsed={isCollapsed}
        toggleCollapsed={toggleCollapsed}
      ></SideBar>
      <SocketProvider>
        <main className="flex-1 overflow-auto">{children}</main>
      </SocketProvider>
    </div>
  );
}
