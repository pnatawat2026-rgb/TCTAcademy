import React from 'react';
import { TCTLogo } from './TCTLogo';

interface ThaiMOOCLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light' | 'white';
  variant?: 'full' | 'emblem' | 'lockup';
}

export const ThaiMOOCLogo: React.FC<ThaiMOOCLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  theme = 'light',
  variant = 'lockup'
}) => {
  return (
    <TCTLogo 
      className={className}
      size={size}
      showSubtitle={showSubtitle}
      theme={theme}
      variant={variant}
    />
  );
};
