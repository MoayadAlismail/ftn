"use client";

import { useState, useRef, useEffect } from "react";
import { User, ChevronDown, Settings, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProfileMenuProps {
  userName?: string;
  userEmail?: string;
  onSignOut: () => void;
}

export function ProfileMenu({ userName, userEmail, onSignOut }: ProfileMenuProps) {
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
        <User size={18} />
        <span className="text-sm font-semibold text-gray-700">
          {userName}
        </span>
        <ChevronDown size={16} className={cn("text-gray-500 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
          </div>

          <div className="py-1">
            <Link
              href="/talent/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Personal Info</span>
            </Link>

            <button
              disabled
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 w-full cursor-not-allowed"
            >
              <CreditCard className="h-4 w-4" />
              <span>My Payments</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              disabled
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 w-full cursor-not-allowed"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>

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

