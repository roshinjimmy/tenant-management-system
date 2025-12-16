"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Tenants", href: "/tenants" },
  { name: "Payments", href: "/payments" },
  { name: "Maintenance", href: "/maintenance" },
  { name: "Rooms", href: "/rooms" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-6">
        <span className="font-semibold text-base text-gray-900 select-none">
          Tenant Management
        </span>
        <div className="flex gap-3 items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm ${
                  isActive
                    ? "text-blue-600 font-medium underline"
                    : "text-gray-700 hover:text-blue-700"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
