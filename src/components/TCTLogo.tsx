import React, { useState } from 'react';

interface TCTLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'doc' | 'certPortrait' | 'certLandscape';
  showSubtitle?: boolean;
  showEmblem?: boolean;
  theme?: 'dark' | 'light' | 'white' | 'auto';
  variant?: 'full' | 'emblem' | 'lockup' | 'image';
  onClick?: () => void;
  alt?: string;
}

export const TCTLogo: React.FC<TCTLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  showEmblem = true,
  theme = 'auto',
  variant = 'full',
  onClick,
  alt = 'TCT Academy - TEIJIN CORD Academy'
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeStyles = {
    xs: { h: 'h-7 sm:h-8', textTitle: 'text-xs', textSub: 'text-[9px]', maxW: 'max-w-[140px]' },
    sm: { h: 'h-9 sm:h-10', textTitle: 'text-sm sm:text-base', textSub: 'text-[10px]', maxW: 'max-w-[180px]' },
    md: { h: 'h-13 sm:h-15', textTitle: 'text-base sm:text-lg', textSub: 'text-xs', maxW: 'max-w-[240px]' },
    lg: { h: 'h-18 sm:h-22', textTitle: 'text-xl sm:text-2xl', textSub: 'text-sm', maxW: 'max-w-[300px]' },
    xl: { h: 'h-24 sm:h-28', textTitle: 'text-2xl sm:text-3xl', textSub: 'text-base', maxW: 'max-w-[380px]' },
    hero: { h: 'h-28 sm:h-36 md:h-40', textTitle: 'text-3xl sm:text-4xl', textSub: 'text-lg', maxW: 'max-w-[340px] sm:max-w-[500px]' },
    doc: { h: 'h-20 sm:h-24', textTitle: 'text-base sm:text-lg', textSub: 'text-xs', maxW: 'max-w-[320px]' },
    certPortrait: { h: 'h-20 sm:h-24 md:h-26', textTitle: 'text-lg sm:text-xl', textSub: 'text-xs', maxW: 'max-w-[340px]' },
    certLandscape: { h: 'h-16 sm:h-20 md:h-22', textTitle: 'text-base sm:text-lg', textSub: 'text-xs', maxW: 'max-w-[300px]' }
  };

  const isLight = theme === 'light' || theme === 'auto';
  const isWhite = theme === 'white';
  const current = sizeStyles[size] || sizeStyles.md;

  // The 3D Red Metallic TCT SVG Vector (Used for emblems, fallbacks, and lockups)
  const render3DEmblem = (customHeight?: string) => (
    <svg 
      viewBox="0 0 660 300" 
      className={`${customHeight || current.h} w-auto max-h-full drop-shadow-md overflow-visible select-none shrink-0`}
      aria-label="TCT 3D Metallic Emblem"
    >
      <defs>
        {/* 3D Metallic Carmine Red Gradient */}
        <linearGradient id="tctRedGlossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3843" />
          <stop offset="25%" stopColor="#E8000B" />
          <stop offset="58%" stopColor="#C20008" />
          <stop offset="85%" stopColor="#940005" />
          <stop offset="100%" stopColor="#5E0003" />
        </linearGradient>

        {/* Glossy Upper Specular Lens */}
        <linearGradient id="tctSpecularLens" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
          <stop offset="28%" stopColor="#FFB8BC" stopOpacity="0.4" />
          <stop offset="65%" stopColor="#E6000B" stopOpacity="0" />
          <stop offset="100%" stopColor="#690003" stopOpacity="0.65" />
        </linearGradient>

        {/* Chrome Edge Bevel Gradient */}
        <linearGradient id="tctChromeBevel" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#470002" />
          <stop offset="35%" stopColor="#B80008" />
          <stop offset="70%" stopColor="#FF5C66" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
        </linearGradient>

        {/* Deep 3D Shadow Filter */}
        <filter id="tctDeepShadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#000000" floodOpacity="0.32" />
        </filter>
      </defs>

      <g filter="url(#tctDeepShadow)" transform="skewX(-16) translate(50, 10)">
        {/* ================= LETTER 1: LEFT "T" ================= */}
        <path 
          d="M 30,55 L 215,55 Q 228,55 224,72 L 212,112 Q 208,122 198,122 L 158,122 L 120,245 Q 116,260 98,260 L 44,260 Q 30,260 34,245 L 72,122 L 35,122 Q 22,122 26,110 L 38,70 Q 42,55 30,55 Z" 
          fill="#350002" 
          transform="translate(3, 7)"
        />
        <path 
          d="M 30,55 L 215,55 Q 228,55 224,72 L 212,112 Q 208,122 198,122 L 158,122 L 120,245 Q 116,260 98,260 L 44,260 Q 30,260 34,245 L 72,122 L 35,122 Q 22,122 26,110 L 38,70 Q 42,55 30,55 Z" 
          fill="url(#tctRedGlossGrad)" 
          stroke="url(#tctChromeBevel)" 
          strokeWidth="2.5" 
        />
        <path 
          d="M 30,55 L 215,55 Q 228,55 224,72 L 212,112 Q 208,122 198,122 L 158,122 L 120,245 Q 116,260 98,260 L 44,260 Q 30,260 34,245 L 72,122 L 35,122 Q 22,122 26,110 L 38,70 Q 42,55 30,55 Z" 
          fill="url(#tctSpecularLens)" 
        />
        <path 
          d="M 34,57 L 215,57 L 209,92 Q 130,96 40,92 Z" 
          fill="#FFFFFF" 
          opacity="0.6" 
        />
        <path 
          d="M 32,56 L 214,56" 
          stroke="#FFFFFF" 
          strokeWidth="3" 
          strokeLinecap="round" 
          opacity="0.9" 
        />

        {/* ================= LETTER 2: CENTER "C" ================= */}
        <path 
          d="M 380,55 L 255,55 Q 170,55 145,125 Q 122,195 205,255 Q 235,260 300,260 L 372,260 Q 384,260 382,246 L 370,208 Q 367,195 352,195 L 282,195 Q 225,195 235,165 Q 248,125 308,125 L 368,125 Q 382,125 380,112 L 388,72 Q 390,55 380,55 Z" 
          fill="#350002" 
          transform="translate(3, 7)"
        />
        <path 
          d="M 380,55 L 255,55 Q 170,55 145,125 Q 122,195 205,255 Q 235,260 300,260 L 372,260 Q 384,260 382,246 L 370,208 Q 367,195 352,195 L 282,195 Q 225,195 235,165 Q 248,125 308,125 L 368,125 Q 382,125 380,112 L 388,72 Q 390,55 380,55 Z" 
          fill="url(#tctRedGlossGrad)" 
          stroke="url(#tctChromeBevel)" 
          strokeWidth="2.5" 
        />
        <path 
          d="M 380,55 L 255,55 Q 170,55 145,125 Q 122,195 205,255 Q 235,260 300,260 L 372,260 Q 384,260 382,246 L 370,208 Q 367,195 352,195 L 282,195 Q 225,195 235,165 Q 248,125 308,125 L 368,125 Q 382,125 380,112 L 388,72 Q 390,55 380,55 Z" 
          fill="url(#tctSpecularLens)" 
        />
        <path 
          d="M 378,57 L 255,57 Q 185,62 160,110 L 178,118 Q 200,75 265,72 L 370,72 Z" 
          fill="#FFFFFF" 
          opacity="0.6" 
        />
        <path 
          d="M 256,56 L 378,56" 
          stroke="#FFFFFF" 
          strokeWidth="3" 
          strokeLinecap="round" 
          opacity="0.9" 
        />

        {/* ================= LETTER 3: RIGHT "T" ================= */}
        <path 
          d="M 405,55 L 590,55 Q 603,55 599,72 L 587,112 Q 583,122 573,122 L 533,122 L 495,245 Q 491,260 473,260 L 419,260 Q 405,260 409,245 L 447,122 L 410,122 Q 397,122 401,110 L 413,70 Q 417,55 405,55 Z" 
          fill="#350002" 
          transform="translate(3, 7)"
        />
        <path 
          d="M 405,55 L 590,55 Q 603,55 599,72 L 587,112 Q 583,122 573,122 L 533,122 L 495,245 Q 491,260 473,260 L 419,260 Q 405,260 409,245 L 447,122 L 410,122 Q 397,122 401,110 L 413,70 Q 417,55 405,55 Z" 
          fill="url(#tctRedGlossGrad)" 
          stroke="url(#tctChromeBevel)" 
          strokeWidth="2.5" 
        />
        <path 
          d="M 405,55 L 590,55 Q 603,55 599,72 L 587,112 Q 583,122 573,122 L 533,122 L 495,245 Q 491,260 473,260 L 419,260 Q 405,260 409,245 L 447,122 L 410,122 Q 397,122 401,110 L 413,70 Q 417,55 405,55 Z" 
          fill="url(#tctSpecularLens)" 
        />
        <path 
          d="M 409,57 L 590,57 L 584,92 Q 505,96 415,92 Z" 
          fill="#FFFFFF" 
          opacity="0.6" 
        />
        <path 
          d="M 407,56 L 589,56" 
          stroke="#FFFFFF" 
          strokeWidth="3" 
          strokeLinecap="round" 
          opacity="0.9" 
        />
      </g>
    </svg>
  );

  // Variant: Emblem only (Just the 3D Red letters)
  if (variant === 'emblem') {
    return (
      <div 
        className={`inline-flex items-center justify-center select-none ${className} ${onClick ? 'cursor-pointer hover:opacity-95' : ''}`}
        onClick={onClick}
      >
        {render3DEmblem()}
      </div>
    );
  }

  // Variant: Lockup format (Logo Emblem on left, System & Organization titles on right - Perfect for Navbars!)
  if (variant === 'lockup') {
    const isLargeLockup = size === 'lg' || size === 'xl' || size === 'hero';
    const isMediumLockup = size === 'md';
    
    const lockupImgH = isLargeLockup 
      ? 'h-12 sm:h-14 md:h-16' 
      : isMediumLockup 
      ? 'h-9 sm:h-11 md:h-12' 
      : 'h-7 sm:h-9 md:h-10';
    
    const lockupTitleSize = isLargeLockup
      ? 'text-base sm:text-xl md:text-2xl'
      : isMediumLockup
      ? 'text-sm sm:text-base md:text-lg'
      : 'text-xs sm:text-sm md:text-base';

    const lockupSubSize = isLargeLockup
      ? 'text-xs sm:text-sm md:text-base font-extrabold'
      : isMediumLockup
      ? 'text-xs sm:text-sm font-bold'
      : 'text-[10px] sm:text-[11px] font-bold';

    return (
      <div 
        className={`inline-flex items-center gap-2 sm:gap-3.5 select-none min-w-0 shrink ${className} ${onClick ? 'cursor-pointer hover:opacity-95' : ''}`}
        onClick={onClick}
      >
        {/* Official Logo (Direct Image with Vector Fallback) - Rendered only if showEmblem is true */}
        {showEmblem && (
          !imgError ? (
            <img 
              src="/tct-academy-logo.svg" 
              alt={alt}
              onError={() => setImgError(true)}
              className={`${lockupImgH} w-auto object-contain shrink-0 drop-shadow-xs`}
              loading="eager"
              decoding="sync"
            />
          ) : (
            render3DEmblem(lockupImgH)
          )
        )}

        {/* Typography Lockup */}
        <div className="flex flex-col justify-center leading-tight min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap whitespace-nowrap">
            <span className={`font-black tracking-tight ${lockupTitleSize} ${
              isWhite ? 'text-white' : 'text-[#002D5A]'
            }`}>
              TCT
            </span>
            <span className={`font-black tracking-tight ${lockupTitleSize} ${
              isWhite ? 'text-amber-400' : 'text-[#DC2626]'
            }`}>
              E-Training
            </span>
            <span className={`font-bold px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap hidden sm:inline-block ${
              isLargeLockup ? 'text-[10px] sm:text-xs' : 'text-[9px] sm:text-[10px]'
            } ${
              isWhite ? 'bg-amber-400/20 text-amber-200 border border-amber-300/30' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              Personnel & HRD
            </span>
          </div>
          <div className={`whitespace-nowrap leading-tight tracking-tight ${lockupSubSize} ${
            isWhite ? 'text-blue-100/90' : 'text-[#005A9C]'
          }`}>
            ศูนย์ฝึกอบรมและพัฒนา TCT Academy
          </div>
          {isLargeLockup && (
            <div className={`text-[10px] sm:text-[11.5px] font-semibold whitespace-nowrap hidden md:block ${
              isWhite ? 'text-slate-300' : 'text-slate-500'
            }`}>
              (Human Resource Development & Training Center) • บริษัท เทยิน คอร์ด (ประเทศไทย) จำกัด
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variant: Full Official Logo / Document Logo ("เอาภาพไปวางตรง และเอาไปวางบนเกียรติบัตรเอกสาร จัดสัดส่วนให้สวยงาม")
  // Uses the authentic TCT Academy vector image directly for pixel-perfect proportions and crispness
  return (
    <div 
      className={`inline-flex flex-col items-center justify-center text-center select-none ${className} ${onClick ? 'cursor-pointer hover:opacity-95' : ''}`}
      onClick={onClick}
    >
      {!imgError ? (
        <img 
          src="/tct-academy-logo.svg" 
          alt={alt}
          onError={() => setImgError(true)}
          className={`${current.h} ${current.maxW} w-auto object-contain select-none transition-transform shrink-0 ${
            isWhite ? 'filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.7)]' : 'drop-shadow-sm'
          }`}
          loading="eager"
          decoding="sync"
        />
      ) : (
        <>
          {render3DEmblem()}
          {showSubtitle && (
            <div className="flex flex-col items-center justify-center mt-1 sm:mt-1.5 leading-tight">
              <div className={`font-black italic tracking-wide ${
                isWhite ? 'text-white' : 'text-[#C00008]'
              } ${current.textTitle} font-['Chakra_Petch',sans-serif]`}>
                TEIJIN CORD <span className={isWhite ? 'text-amber-300' : 'text-[#9E0006]'}>Academy</span>
              </div>
              <div className={`font-bold italic tracking-normal ${
                isWhite ? 'text-blue-100/90' : 'text-[#3E3E3E]'
              } ${current.textSub} font-sarabun mt-0.5`}>
                Human Resources Development and Training Center
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
