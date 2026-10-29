import React from 'react';

interface CourseVisualArtworkProps {
  courseId: string;
}

export const CourseVisualArtwork: React.FC<CourseVisualArtworkProps> = ({ courseId }) => {
  switch (courseId) {
    case 'risk-management':
      // QSRM: Quality tensile testing, 5x5 matrix grid, safety shield
      return (
        <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Technical Grid Background */}
          <defs>
            <pattern id="grid-qsrm" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.25" />
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid-qsrm)" />
          
          {/* Tensile Tester Gauge & Caliper Lines */}
          <circle cx="90" cy="100" r="45" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="90" cy="100" r="36" stroke="#0284C7" strokeWidth="1.5" />
          <line x1="90" y1="100" x2="115" y2="80" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="90" cy="100" r="4" fill="#F59E0B" />
          
          {/* 5x5 Matrix Schematic */}
          <rect x="230" y="45" width="130" height="110" rx="6" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="230" y1="67" x2="360" y2="67" stroke="#38BDF8" strokeWidth="0.8" />
          <line x1="230" y1="89" x2="360" y2="89" stroke="#38BDF8" strokeWidth="0.8" />
          <line x1="230" y1="111" x2="360" y2="111" stroke="#38BDF8" strokeWidth="0.8" />
          <line x1="230" y1="133" x2="360" y2="133" stroke="#38BDF8" strokeWidth="0.8" />
          
          <line x1="256" y1="45" x2="256" y2="155" stroke="#38BDF8" strokeWidth="0.8" />
          <line x1="282" y1="45" x2="282" y2="155" stroke="#38BDF8" strokeWidth="0.8" />
          <line x1="308" y1="45" x2="308" y2="155" stroke="#38BDF8" strokeWidth="0.8" />
          <line x1="334" y1="45" x2="334" y2="155" stroke="#38BDF8" strokeWidth="0.8" />
          
          {/* Risk Levels Highlight in Matrix */}
          <rect x="308" y="45" width="26" height="22" fill="#EF4444" fillOpacity="0.4" />
          <rect x="334" y="45" width="26" height="22" fill="#DC2626" fillOpacity="0.6" />
          <rect x="334" y="67" width="26" height="22" fill="#EF4444" fillOpacity="0.4" />
          <rect x="230" y="133" width="26" height="22" fill="#10B981" fillOpacity="0.4" />
          
          <text x="240" y="38" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">5x5 RISK MATRIX (QSRM)</text>
          <text x="50" y="165" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">Tire Cord Tensile Testing Rig</text>
        </svg>
      );

    case 'advanced-preventive-maintenance':
      // APM: Vibration sensor, CBM P-F curve, rotating gear bearing
      return (
        <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rotating Bearing & Spindle Outline */}
          <circle cx="85" cy="100" r="50" stroke="#0284C7" strokeWidth="2" />
          <circle cx="85" cy="100" r="32" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="85" cy="100" r="14" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
          
          {/* Roller Balls */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x = 85 + 41 * Math.cos(rad);
            const y = 100 + 41 * Math.sin(rad);
            return <circle key={deg} cx={x} cy={y} r="6" fill="#0EA5E9" stroke="#E0F2FE" strokeWidth="1" />;
          })}
          
          {/* P-F Curve Graph */}
          <path d="M 180 60 Q 260 70 300 110 T 360 160" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
          <circle cx="210" cy="65" r="4" fill="#10B981" />
          <circle cx="295" cy="105" r="4" fill="#F59E0B" />
          <circle cx="355" cy="155" r="4" fill="#EF4444" />
          
          {/* Vibration Wave Spectrum */}
          <path d="M 180 145 Q 195 130 210 145 T 240 145 T 260 110 T 275 170 T 290 145 T 320 145" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
          
          <text x="180" y="45" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">CBM VIBRATION & P-F CURVE (APM)</text>
          <text x="50" y="170" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">Twisting Machine Bearings</text>
        </svg>
      );

    case 'conflict-management':
      // CFM: Thomas-Kilmann 5 styles matrix, dialogue & handshake
      return (
        <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* TKI 2D Axes: Assertiveness vs Cooperativeness */}
          <line x1="80" y1="160" x2="80" y2="40" stroke="#38BDF8" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1="80" y1="160" x2="350" y2="160" stroke="#38BDF8" strokeWidth="2" />
          
          {/* 5 TKI Zones */}
          {/* Competing */}
          <rect x="95" y="50" width="70" height="35" rx="5" fill="#EF4444" fillOpacity="0.25" stroke="#EF4444" strokeWidth="1" />
          <text x="105" y="72" fill="#FCA5A5" fontSize="8" fontWeight="bold">Competing</text>
          
          {/* Collaborating */}
          <rect x="250" y="50" width="85" height="35" rx="5" fill="#10B981" fillOpacity="0.3" stroke="#10B981" strokeWidth="1.5" />
          <text x="260" y="72" fill="#6EE7B7" fontSize="8.5" fontWeight="bold">Collaborating</text>
          
          {/* Compromising */}
          <rect x="175" y="90" width="85" height="30" rx="5" fill="#F59E0B" fillOpacity="0.25" stroke="#F59E0B" strokeWidth="1" />
          <text x="185" y="110" fill="#FCD34D" fontSize="8" fontWeight="bold">Compromising</text>
          
          {/* Avoiding */}
          <rect x="95" y="125" width="70" height="30" rx="5" fill="#64748B" fillOpacity="0.25" stroke="#94A3B8" strokeWidth="1" />
          <text x="110" y="144" fill="#CBD5E1" fontSize="8" fontWeight="bold">Avoiding</text>
          
          {/* Accommodating */}
          <rect x="250" y="125" width="85" height="30" rx="5" fill="#0284C7" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1" />
          <text x="255" y="144" fill="#BAE6FD" fontSize="8" fontWeight="bold">Accommodating</text>
          
          <text x="95" y="32" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">THOMAS-KILMANN TKI 5 STYLES</text>
          <text x="15" y="105" fill="#94A3B8" fontSize="7" transform="rotate(-90 15,105)">Assertiveness</text>
          <text x="180" y="180" fill="#94A3B8" fontSize="7">Cooperativeness (Win-Win)</text>
        </svg>
      );

    case 'ai-for-tct':
      // AI: Neural network, smart robotics, TH AI Passport
      return (
        <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Neural Network Nodes */}
          {/* Layer 1 */}
          <circle cx="80" cy="60" r="7" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="80" cy="100" r="7" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="80" cy="140" r="7" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
          
          {/* Layer 2 */}
          <circle cx="150" cy="45" r="7" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="150" cy="80" r="7" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="150" cy="120" r="7" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="150" cy="155" r="7" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
          
          {/* Layer 3 */}
          <circle cx="220" cy="70" r="8" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
          <circle cx="220" cy="130" r="8" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
          
          {/* Connectors */}
          <line x1="87" y1="60" x2="143" y2="45" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.6" />
          <line x1="87" y1="60" x2="143" y2="80" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.6" />
          <line x1="87" y1="100" x2="143" y2="80" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.6" />
          <line x1="87" y1="100" x2="143" y2="120" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.6" />
          <line x1="87" y1="140" x2="143" y2="120" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.6" />
          <line x1="87" y1="140" x2="143" y2="155" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.6" />
          
          <line x1="157" y1="45" x2="212" y2="70" stroke="#FDE68A" strokeWidth="0.8" strokeOpacity="0.7" />
          <line x1="157" y1="80" x2="212" y2="70" stroke="#FDE68A" strokeWidth="0.8" strokeOpacity="0.7" />
          <line x1="157" y1="120" x2="212" y2="130" stroke="#FDE68A" strokeWidth="0.8" strokeOpacity="0.7" />
          <line x1="157" y1="155" x2="212" y2="130" stroke="#FDE68A" strokeWidth="0.8" strokeOpacity="0.7" />
          
          {/* TH AI Passport Emblem */}
          <rect x="270" y="55" width="95" height="90" rx="8" stroke="#38BDF8" strokeWidth="1.5" fill="#0B192C" fillOpacity="0.6" />
          <circle cx="317" cy="90" r="18" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="282" y="128" fill="#38BDF8" fontSize="8" fontWeight="bold">TH AI PASSPORT</text>
          
          <text x="80" y="28" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">SMART FACTORY AI & NEURAL NODES</text>
        </svg>
      );

    case 'personality-psychology':
      // DISC: 4 Quadrants (Dominance, Influence, Steadiness, Conscientiousness)
      return (
        <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* DISC Circle */}
          <circle cx="130" cy="100" r="60" stroke="#38BDF8" strokeWidth="2" />
          <line x1="70" y1="100" x2="190" y2="100" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="130" y1="40" x2="130" y2="160" stroke="#38BDF8" strokeWidth="1.5" />
          
          {/* D quadrant */}
          <rect x="75" y="45" width="50" height="50" fill="#EF4444" fillOpacity="0.25" rx="4" />
          <text x="95" y="75" fill="#F87171" fontSize="16" fontWeight="bold">D</text>
          
          {/* I quadrant */}
          <rect x="135" y="45" width="50" height="50" fill="#F59E0B" fillOpacity="0.25" rx="4" />
          <text x="157" y="75" fill="#FBBF24" fontSize="16" fontWeight="bold">I</text>
          
          {/* S quadrant */}
          <rect x="135" y="105" width="50" height="50" fill="#10B981" fillOpacity="0.25" rx="4" />
          <text x="156" y="135" fill="#34D399" fontSize="16" fontWeight="bold">S</text>
          
          {/* C quadrant */}
          <rect x="75" y="105" width="50" height="50" fill="#0284C7" fillOpacity="0.25" rx="4" />
          <text x="95" y="135" fill="#38BDF8" fontSize="16" fontWeight="bold">C</text>
          
          {/* Empathy Connection Diagram */}
          <circle cx="260" cy="100" r="28" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="310" cy="100" r="28" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="245" y="104" fill="#38BDF8" fontSize="8" fontWeight="bold">Self</text>
          <text x="295" y="104" fill="#F59E0B" fontSize="8" fontWeight="bold">Others</text>
          <text x="270" y="150" fill="#E2E8F0" fontSize="8.5">Empathy Synergy</text>
          
          <text x="80" y="28" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">DISC PERSONALITY MODEL & EMPATHY</text>
        </svg>
      );

    case 'kyt-shisa-kanko':
      // KYT: Point & Call hand, Zero Accident Target
      return (
        <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Concentric Zero Accident Target */}
          <circle cx="110" cy="100" r="60" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="110" cy="100" r="42" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="110" cy="100" r="24" stroke="#EF4444" strokeWidth="2" />
          <circle cx="110" cy="100" r="6" fill="#EF4444" />
          
          {/* Pointing Hand Icon Schematic */}
          <path d="M 230 115 L 280 115 L 305 95 L 340 95 L 340 105 L 305 105 L 290 125 L 230 125 Z" fill="#38BDF8" fillOpacity="0.4" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="340" y1="95" x2="365" y2="95" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="2 2" />
          
          {/* Audio Soundwaves (Point & Call) */}
          <path d="M 330 75 Q 345 65 360 75" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <path d="M 330 65 Q 350 50 370 65" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          
          <text x="75" y="175" fill="#10B981" fontSize="9" fontWeight="bold">ZERO ACCIDENT</text>
          <text x="240" y="150" fill="#38BDF8" fontSize="8.5" fontWeight="bold">4-Step KYT (ตา-มือ-ปาก-ใจ)</text>
          <text x="80" y="28" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">SHISA KANKO (POINT & CALL) SAFETY</text>
        </svg>
      );

    default:
      // Applied Psychology & Good Employee Skills: Growth & Quality Pillars
      return (
        <svg className="w-full h-full opacity-35" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ascending Growth Stairs */}
          <rect x="70" y="130" width="40" height="30" fill="#0284C7" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1" />
          <rect x="110" y="105" width="40" height="55" fill="#0369A1" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1" />
          <rect x="150" y="80" width="40" height="80" fill="#075985" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1" />
          <rect x="190" y="55" width="40" height="105" fill="#0C4A6E" fillOpacity="0.3" stroke="#38BDF8" strokeWidth="1" />
          <path d="M 75 125 L 115 100 L 155 75 L 195 50 L 250 35" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
          <polygon points="250,30 262,35 250,42" fill="#F59E0B" />
          
          {/* 5S / Excellence Seal */}
          <circle cx="310" cy="100" r="40" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="310" cy="100" r="32" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
          <text x="290" y="96" fill="#38BDF8" fontSize="10" fontWeight="bold">5S / TCT</text>
          <text x="285" y="112" fill="#94A3B8" fontSize="7.5">Standard</text>
          
          <text x="70" y="28" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">GROWTH MINDSET & EXCELLENCE</text>
        </svg>
      );
  }
};
