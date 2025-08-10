'use client'

import LoadingAnimation from '@/components/loadingAnimation'
import { createContext, useContext, useState, ReactNode } from 'react'

type LoadingContextType = {
    isPageLoading: boolean
    startLoading: () => void
    stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isPageLoading, setIsPageLoading] = useState(false)

    const startLoading = () => setIsPageLoading(true)
    const stopLoading = () => setIsPageLoading(false)

    return (
        <LoadingContext.Provider value={{ isPageLoading, startLoading, stopLoading }}>
            {isPageLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            )}
            {isPageLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
                    <LoadingAnimation size='md'/>
                </div>
            )}
            {children}
        </LoadingContext.Provider>
    )
}

export const useLoading = () => {
    const context = useContext(LoadingContext)
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider')
    }
    return context
}