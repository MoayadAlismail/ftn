"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Settings, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmployerProfileMenuProps {
  userName?: string;
  companyName?: string;
  userEmail?: string;
  onSignOut: () => void;
}

export function EmployerProfileMenu({ userName, companyName, userEmail, onSignOut }: EmployerProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3 py-2 h-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Building2 size={18} />
        <span className="text-sm font-semibold text-gray-700">
          {userName || companyName || "User"}
        </span>
        <ChevronDown size={16} className={cn("text-gray-500 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userName || companyName || "User"}</p>
            <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
          </div>

          <div className="py-1">
            <Link
              href="/employer/dashboard/billing"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </Link>

            <Link
              href="/employer/dashboard/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full"
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

