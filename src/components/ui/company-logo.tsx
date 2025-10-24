"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  logoUrl?: string | null;
  companyName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompanyLogo({ 
  logoUrl, 
  companyName, 
  size = 'md', 
  className 
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage
      .from('company-logos')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  // If we have a logo URL and no error, show the image
  if (logoUrl && !imageError) {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <img 
          src={getPublicUrl(logoUrl)}
          alt={`${companyName} logo`}
          className={cn('rounded-lg object-cover w-full h-full', className)}
          onError={() => setImageError(true)}
        />
      </div>
    );
  }
  
  // Fallback: Show company initials with gradient background
  const initials = companyName
    ? companyName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CO';
    
  return (
    <div 
      className={cn(
        'bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold',
        sizeClasses[size],
        className
      )}
      title={companyName}
    >
      {initials || <Building2 size={iconSizes[size]} />}
    </div>
  );
}

