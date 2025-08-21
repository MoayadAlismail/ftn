import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface SocialIconProps {
  className?: string;
  size?: number;
}

export function GoogleIcon({ className, size = 18 }: SocialIconProps) {
  return (
    <FaGoogle
      size={size}
      className={cn("text-[#4285F4]", className)}
    />
  );
}

export function GitHubIcon({ className, size = 18 }: SocialIconProps) {
  return (
    <FaGithub
      size={size}
      className={cn("text-gray-800", className)}
    />
  );
}

export function LinkedInIcon({ className, size = 18 }: SocialIconProps) {
  return (
    <FaLinkedin
      size={size}
      className={cn("text-[#0A66C2]", className)}
    />
  );
}