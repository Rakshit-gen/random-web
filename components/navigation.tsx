"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  
  const links = [
    { href: "/", label: "Home" },
    { href: "/add", label: "Add" },
    { href: "/all", label: "All" },
  ];
  
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            The Random Web
          </Link>
          
          <div className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-slate-900",
                  pathname === link.href
                    ? "text-slate-900"
                    : "text-slate-600"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
