'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
    size = 'md',
    text = 'Loading...',
    className = ''
}) => {
    // Size configurations
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32'
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    return (
        <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
            {/* Main logo container */}
            <div className="relative">
                {/* Background glow effect */}
                    {/* <motion.div
                        className={cn("absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full", sizeClasses[size])}
                        animate={{ scale: [0, 1.5], opacity: [0.8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: [0, 0, 0.2, 1] as any }}
                    /> */}

                {/* Outer ring
                <motion.div
                    className={cn("absolute inset-0 border-2 border-blue-400/40 rounded-full", sizeClasses[size])}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: [0.4, 0, 0.6, 1] as any }}
                /> */}

                {/* Logo with spinning animation */}
                <motion.div
                    className={cn("relative", sizeClasses[size])}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: [0, 0, 1, 1] as any }}
                >
                    <Image
                        src="/logo.svg"
                        alt="Loading"
                        fill
                        className="object-contain filter drop-shadow-lg"
                        priority
                    />

                    {/* Subtle overlay for better visual depth */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full" />
                </motion.div>

                {/* Inner pulse ring */}
                {/* <motion.div
                    className="absolute inset-2 border border-blue-400/60 rounded-full"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.6, 1] as any,
                        delay: 0.5
                    }}
                /> */}

                {/* Sparkle effects */}
                <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.2
                    }}
                />
                <motion.div
                    className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 1
                    }}
                />
            </div>

            {/* Loading text with animated dots */}
            {text && (
                <div className={cn("text-foreground/80 font-medium flex items-center space-x-1", textSizes[size])}>
                    <span>{text}</span>
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((index) => (
                            <motion.div
                                key={index}
                                className="w-1 h-1 bg-current rounded-full"
                                animate={{
                                    y: [0, -4, 0],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: index * 0.1,
                                    ease: [0.4, 0, 0.6, 1] as any
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoadingAnimation;
