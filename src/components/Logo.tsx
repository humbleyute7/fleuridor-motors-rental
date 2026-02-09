interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-32" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 400 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#991B1B', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 0.9 }} />
        </linearGradient>
        <radialGradient id="wheelGradient">
          <stop offset="30%" style={{ stopColor: '#374151', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#111827', stopOpacity: 1 }} />
        </radialGradient>
      </defs>

      {/* Modern Car Silhouette */}
      <g transform="translate(15, 20)">
        {/* Car body shadow */}
        <ellipse cx="75" cy="72" rx="65" ry="8" fill="#000000" opacity="0.2" />

        {/* Main car body */}
        <path
          d="M 15 55
             L 20 50
             L 25 45
             L 35 40
             L 42 35
             Q 48 32 55 32
             L 70 32
             Q 77 32 82 35
             L 95 45
             Q 100 48 105 48
             L 120 48
             L 132 52
             L 138 58
             L 138 62
             L 135 62
             Q 133 68 128 68
             L 122 68
             Q 120 68 120 66
             L 120 64
             L 30 64
             L 30 66
             Q 30 68 28 68
             L 22 68
             Q 17 68 15 62
             L 12 62
             L 12 58
             Z"
          fill="url(#carGradient)"
          stroke="#7F1D1D"
          strokeWidth="1.5"
        />

        {/* Car roof/cabin */}
        <path
          d="M 45 35
             Q 48 33 53 33
             L 68 33
             Q 73 33 76 35
             L 88 45
             L 90 46
             L 60 46
             L 32 46
             L 35 40
             Z"
          fill="#B91C1C"
          opacity="0.6"
        />

        {/* Front windshield */}
        <path
          d="M 45 35 L 50 38 L 55 42 L 42 42 Z"
          fill="url(#windowGradient)"
        />

        {/* Rear windshield */}
        <path
          d="M 76 35 L 85 42 L 88 45 L 70 42 Z"
          fill="url(#windowGradient)"
        />

        {/* Side windows */}
        <path
          d="M 56 38 L 68 38 L 72 42 L 60 42 Z"
          fill="url(#windowGradient)"
        />

        {/* Front grille details */}
        <rect x="125" y="52" width="8" height="3" fill="#1F2937" rx="0.5" />
        <rect x="125" y="56" width="8" height="3" fill="#1F2937" rx="0.5" />

        {/* Headlights */}
        <ellipse cx="133" cy="54" rx="3" ry="4" fill="#FDE047" />
        <ellipse cx="133" cy="54" rx="2" ry="3" fill="#FEF9C3" />

        {/* Tail light */}
        <rect x="16" y="52" width="4" height="6" fill="#DC2626" rx="1" />

        {/* Door handle */}
        <rect x="62" y="52" width="8" height="2" fill="#4B5563" rx="1" />

        {/* Front wheel */}
        <circle cx="110" cy="64" r="10" fill="url(#wheelGradient)" stroke="#000" strokeWidth="1" />
        <circle cx="110" cy="64" r="6" fill="#1F2937" />
        <circle cx="110" cy="64" r="3" fill="#374151" />

        {/* Rear wheel */}
        <circle cx="38" cy="64" r="10" fill="url(#wheelGradient)" stroke="#000" strokeWidth="1" />
        <circle cx="38" cy="64" r="6" fill="#1F2937" />
        <circle cx="38" cy="64" r="3" fill="#374151" />

        {/* Wheel details - spokes */}
        <line x1="110" y1="58" x2="110" y2="70" stroke="#6B7280" strokeWidth="1" />
        <line x1="104" y1="64" x2="116" y2="64" stroke="#6B7280" strokeWidth="1" />
        <line x1="38" y1="58" x2="38" y2="70" stroke="#6B7280" strokeWidth="1" />
        <line x1="32" y1="64" x2="44" y2="64" stroke="#6B7280" strokeWidth="1" />

        {/* Side mirror */}
        <ellipse cx="95" cy="43" rx="4" ry="3" fill="#7F1D1D" />

        {/* Body highlights */}
        <path
          d="M 35 42 Q 75 40 120 50"
          stroke="#FCA5A5"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
      </g>

      {/* Company name */}
      <text
        x="160"
        y="45"
        fontFamily="Arial, sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="#DC2626"
      >
        FLEURIDOR
      </text>
      <text
        x="160"
        y="70"
        fontFamily="Arial, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="#E5E7EB"
      >
        MOTORS LTD.
      </text>
      <text
        x="160"
        y="88"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fill="#9CA3AF"
      >
        SALES, RENTALS, AUTO PARTS & SERVICES
      </text>

      {/* Decorative line */}
      <line
        x1="160"
        y1="52"
        x2="380"
        y2="52"
        stroke="#DC2626"
        strokeWidth="1"
      />
    </svg>
  );
}
