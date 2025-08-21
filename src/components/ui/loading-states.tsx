"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Search, CreditCard, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    };

    return (
        <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
    );
}

interface LoadingSkeletonProps {
    className?: string;
    rows?: number;
}

export function LoadingSkeleton({ className, rows = 1 }: LoadingSkeletonProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: rows }).map((_, i) => (
                <motion.div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                />
            ))}
        </div>
    );
}

interface LoadingCardProps {
    className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
    return (
        <div className={cn("border rounded-lg p-6 space-y-4", className)}>
            <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
            </div>
            <div className="flex space-x-2">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    );
}

interface ContextualLoadingProps {
    context: "search" | "payment" | "matching" | "scheduling" | "profile";
    message?: string;
    size?: "sm" | "md" | "lg";
}

export function ContextualLoading({ context, message, size = "md" }: ContextualLoadingProps) {
    const contextConfig = {
        search: {
            icon: Search,
            defaultMessage: "Searching opportunities...",
            color: "text-blue-600"
        },
        payment: {
            icon: CreditCard,
            defaultMessage: "Processing payment...",
            color: "text-green-600"
        },
        matching: {
            icon: Sparkles,
            defaultMessage: "Finding your perfect matches...",
            color: "text-purple-600"
        },
        scheduling: {
            icon: Calendar,
            defaultMessage: "Scheduling your meeting...",
            color: "text-orange-600"
        },
        profile: {
            icon: Users,
            defaultMessage: "Loading profile...",
            color: "text-indigo-600"
        }
    };

    const config = contextConfig[context];
    const Icon = config.icon;

    const sizeClasses = {
        sm: { icon: "h-5 w-5", text: "text-sm", container: "py-4" },
        md: { icon: "h-6 w-6", text: "text-base", container: "py-8" },
        lg: { icon: "h-8 w-8", text: "text-lg", container: "py-12" }
    };

    return (
        <div className={cn("flex flex-col items-center justify-center", sizeClasses[size].container)}>
            <motion.div
                animate={{
                    rotate: context === "matching" ? [0, 180, 360] : 0,
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: context === "matching" ? 2 : 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={cn(
                    "rounded-full p-3 mb-4",
                    config.color.replace("text-", "bg-").replace("-600", "-100")
                )}
            >
                <Icon className={cn(sizeClasses[size].icon, config.color)} />
            </motion.div>

            <motion.p
                className={cn("text-gray-600 text-center", sizeClasses[size].text)}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {message || config.defaultMessage}
            </motion.p>

            {context === "matching" && (
                <motion.div
                    className="flex space-x-1 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
}

interface PageLoadingProps {
    title?: string;
    description?: string;
}

export function PageLoading({ title = "Loading", description }: PageLoadingProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full mb-8"
                />

                <motion.h2
                    className="text-2xl font-semibold text-gray-900 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {title}
                </motion.h2>

                {description && (
                    <motion.p
                        className="text-gray-600"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {description}
                    </motion.p>
                )}

                <motion.div
                    className="flex justify-center space-x-2 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-3 bg-blue-400 rounded-full"
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

interface InlineLoadingProps {
    text?: string;
    size?: "sm" | "md";
    className?: string;
}

export function InlineLoading({ text = "Loading...", size = "sm", className }: InlineLoadingProps) {
    const sizeClasses = {
        sm: { spinner: "h-4 w-4", text: "text-sm" },
        md: { spinner: "h-5 w-5", text: "text-base" }
    };

    return (
        <div className={cn("flex items-center justify-center space-x-2", className)}>
            <LoadingSpinner size={size} />
            <span className={cn("text-gray-600", sizeClasses[size].text)}>
                {text}
            </span>
        </div>
    );
}

interface ButtonLoadingProps {
    children: React.ReactNode;
    loading?: boolean;
    loadingText?: string;
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
}

export function ButtonLoading({
    children,
    loading = false,
    loadingText = "Loading...",
    disabled,
    className,
    onClick
}: ButtonLoadingProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center space-x-2 transition-all duration-200",
                loading && "cursor-not-allowed opacity-75",
                className
            )}
        >
            {loading && <LoadingSpinner size="sm" />}
            <span>{loading ? loadingText : children}</span>
        </button>
    );
}

