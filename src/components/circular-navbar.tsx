"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { homeTranslations } from "@/lib/language/home";
import LanguageSelector from "./language-selector";
import { LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CircularNavbar() {
  const { language } = useLanguage();
  const t = homeTranslations[language];
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect which section is in view (for landing page only)
      if (pathname === "/") {
        const sections = ["hero", "features", "testimonials", "faq", "contact"];
        const scrollPosition = window.scrollY + 200;

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/") {
      // If not on landing page, navigate first then scroll
      router.push("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const navItems = [
    {
      label: t.navServices,
      href: "/services",
      isActive: pathname.startsWith("/services"),
    },
    {
      label: t.navFAQ,
      onClick: () => scrollToSection("faq"),
      isActive: pathname === "/" && activeSection === "faq",
    },
    {
      label: t.navRecruiters,
      href: "/recruiters",
      isActive: pathname.startsWith("/recruiters") || pathname.startsWith("/employer") || pathname.startsWith("/auth/employer"),
    },
  ];

  return (
    <>
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav
        className={cn(
          "fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
          isScrolled ? "py-3" : "py-5",
          "w-full max-w-4xl px-4 sm:px-6"
        )}
      >
      <div>
        <div
          className={cn(
            "relative rounded-full transition-all duration-300",
            "bg-white/80 backdrop-blur-lg border border-gray-200/50",
            "shadow-lg shadow-gray-200/50",
            isScrolled ? "shadow-xl" : ""
          )}
        >
          <div className="flex items-center justify-between px-6 sm:px-8 py-4">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.svg"
                alt="FTN Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="hidden sm:inline">FTN</span>
            </Link>

            {/* Navigation Items - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-3">
              {navItems.map((item, index) => {
                const isActive = item.isActive;

                if (item.href) {
                  return (
                    <Link key={index} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="default"
                        className={cn(
                          "rounded-full transition-all text-sm px-6",
                          isActive
                            ? "bg-primary text-white shadow-md"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  );
                }

                return (
                  <Button
                    key={index}
                    variant={isActive ? "default" : "ghost"}
                    size="default"
                    onClick={item.onClick}
                    className={cn(
                      "rounded-full transition-all text-sm px-6",
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>

            {/* Right side - Language Switcher + Sign In (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language Selector */}
              <LanguageSelector />

              {/* Sign In Button */}
              <Link href="/auth/talent/login">
                <Button
                  size="default"
                  className={cn(
                    "gap-2 rounded-full shadow-md px-6",
                    "bg-primary hover:bg-primary/90 text-white",
                    "transition-all hover:scale-105"
                  )}
                >
                  <LogIn size={18} />
                  <span>{t.navSignIn}</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-lg rounded-b-3xl overflow-hidden"
              >
                <div className="px-4 py-4 space-y-2">
                {navItems.map((item, index) => {
                  const isActive = item.isActive;

                  if (item.href) {
                    return (
                      <Link key={index} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <button
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl transition-all",
                            isActive
                              ? "text-primary bg-primary/10 font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <span className="text-sm">{item.label}</span>
                        </button>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        item.onClick?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl transition-all",
                        isActive
                          ? "text-primary bg-primary/10 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}

                {/* Mobile Language Switcher */}
                <div className="pt-3 border-t border-gray-200/50">
                  <LanguageSelector />
                </div>

                {/* Mobile Sign In Button */}
                <Link href="/auth/talent/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    size="default"
                    className={cn(
                      "w-full gap-2 rounded-xl shadow-md",
                      "bg-primary hover:bg-primary/90 text-white",
                      "transition-all"
                    )}
                  >
                    <LogIn size={18} />
                    <span>{t.navSignIn}</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
    </>
  );
}

