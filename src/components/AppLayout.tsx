/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Timer, Settings, User, LayoutGrid } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { name: "Calendrier", href: "/", icon: Calendar },
  { name: "Timetable", href: "/timetable", icon: LayoutGrid },
  { name: "Deadlines", href: "/deadlines", icon: Timer },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setIsScrolled(target.scrollTop > 40);
    };
    const scrollContainer = document.getElementById("scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const activeItem = navItems.find((item) => item.href === pathname) || navItems[0];
  const { user } = useAuth(); // We need to import useAuth
  
  if (pathname === '/login') {
    return <div className="h-screen w-screen bg-[var(--background)] text-[var(--foreground)]">{children}</div>;
  }
  // Fallback for user avatar
  const avatarText = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "U";

  const activeIndex = pathname === "/profile" ? 3 : Math.max(0, navItems.findIndex((item) => item.href === pathname));

  const getDesktopTranslate = (idx: number) => {
    if (idx === 1) return 84;
    if (idx === 2) return 168;
    if (idx === 3) return 269;
    return 0; // index 0
  };

  const getMobileTranslate = (idx: number) => {
    if (idx === 1) return 80;
    if (idx === 2) return 160;
    if (idx === 3) return 257;
    return 0; // index 0
  };

  return (
    <div className="flex h-screen w-full bg-[var(--background)] overflow-hidden text-[var(--foreground)] relative">
      
      {/* Floating Vertical Nav (Desktop) */}
      <nav className="hidden md:flex flex-col items-center fixed left-6 top-1/2 -translate-y-1/2 bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--border)] rounded-full shadow-2xl z-50 overflow-hidden">
        {/* Animated Background Pill */}
        <div 
          className="absolute left-0 w-full h-[84px] rounded-full bg-[var(--foreground)]/10 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]"
          style={{ transform: `translateY(${getDesktopTranslate(activeIndex)}px)`, top: 0 }}
        />
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative z-10 flex flex-col items-center justify-center gap-1.5 w-[72px] h-[84px] rounded-full transition-all duration-300",
                isActive
                  ? "text-[var(--foreground)]"
                  : "text-[var(--foreground)] opacity-60 hover:opacity-100"
              )}
            >
              <Icon size={22} className={isActive ? "fill-current" : ""} />
              <span className="text-[9px] font-semibold tracking-wide uppercase">{item.name}</span>
            </Link>
          );
        })}
        <div className="w-8 h-px bg-[var(--border)] my-2 relative z-10" />
        <Link
          href="/profile"
          className={clsx(
            "relative z-10 flex flex-col items-center justify-center gap-1.5 w-[72px] h-[84px] rounded-full transition-all duration-300",
            pathname === "/profile"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)] opacity-60 hover:opacity-100"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-xs shadow-sm transition-transform active:scale-95">
            {avatarText}
          </div>
          <span className="text-[9px] font-semibold tracking-wide uppercase">Profil</span>
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative md:pl-[100px]">
        {/* Mobile Header (Sticky) */}
        <header
          className={clsx(
            "md:hidden fixed top-0 w-full z-10 transition-all duration-300 px-6 py-4 flex items-center justify-center",
            isScrolled
              ? "bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--border)] shadow-sm"
              : "bg-transparent pointer-events-none"
          )}
        >
          <span
            className={clsx(
              "font-bold text-lg transition-opacity duration-300",
              isScrolled ? "opacity-100" : "opacity-0"
            )}
          >
            {activeItem.name === "Calendrier" && pathname === "/profile" ? "Profil" : activeItem.name}
          </span>
        </header>

        {/* Scrollable Container */}
        <div id="scroll-container" className="flex-1 overflow-y-auto pb-32 md:pb-8 pt-16 md:pt-8 px-4 md:px-8">
          {/* Mobile Large Title */}
          <div className="md:hidden pt-2 pb-6 transition-all duration-300 px-2">
            <h1 className={clsx("text-4xl font-bold tracking-tight transition-opacity duration-300", isScrolled ? "opacity-0" : "opacity-100")}>
              {pathname === "/profile" ? "Mon Profil" : activeItem.name}
            </h1>
          </div>
          
          <div className="h-full max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Floating Horizontal Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--border)] rounded-full shadow-2xl z-50 flex items-center overflow-hidden">
        {/* Animated Background Pill */}
        <div 
          className="absolute top-0 h-[64px] w-[80px] rounded-full bg-[var(--foreground)]/10 transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.2,1)]"
          style={{ transform: `translateX(${getMobileTranslate(activeIndex)}px)`, left: 0 }}
        />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative z-10 flex flex-col items-center justify-center gap-1 w-[80px] h-[64px] rounded-full transition-all duration-300",
                isActive
                  ? "text-[var(--foreground)]"
                  : "text-[var(--foreground)] opacity-60 hover:opacity-100"
              )}
            >
              <Icon size={22} className={isActive ? "fill-current" : ""} />
              <span className="text-[9px] font-semibold tracking-wide uppercase">{item.name}</span>
            </Link>
          );
        })}
        <div className="w-px h-6 bg-[var(--border)] mx-2 relative z-10" />
        <Link
          href="/profile"
          className={clsx(
            "relative z-10 flex flex-col items-center justify-center gap-1 w-[80px] h-[64px] rounded-full transition-all duration-300",
            pathname === "/profile"
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground)] opacity-60 hover:opacity-100"
          )}
        >
          <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-bold text-[10px] shadow-sm transition-transform active:scale-95">
            {avatarText}
          </div>
          <span className="text-[9px] font-semibold tracking-wide uppercase">Profil</span>
        </Link>
      </nav>
    </div>
  );
}

