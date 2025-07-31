"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/game", label: "Game" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" }
];

// PUBLIC_INTERFACE
export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center justify-between w-full p-4 bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-lg sticky top-0 z-10">
      <div className="text-xl font-bold tracking-wide">
        <Link href="/game" className="hover:text-[var(--color-accent)]">
          Tic Tac Toe
        </Link>
      </div>
      <ul className="flex gap-6 text-base font-medium">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                pathname?.startsWith(item.href)
                  ? "underline underline-offset-4 text-[var(--color-accent)]"
                  : "hover:text-[var(--color-accent)]"
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div>
        <Link
          href="/auth/login"
          className="p-2 rounded bg-[var(--color-accent)] text-[var(--color-secondary)] font-semibold hover:bg-transparent hover:text-[var(--color-accent)] border border-[var(--color-accent)] transition"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}
