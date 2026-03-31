"use client";
import { useState, useEffect, useRef } from "react";

import SideBar from "./components/SideBar/SideBar";

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
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
