import React from 'react';

interface CircularGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  statusText?: string;
  subtitle?: string;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  score,
  maxScore = 100,
  size = 180,
  strokeWidth = 14,
  statusText = 'Stable',
  subtitle = 'Overall civic conditions are currently stable.'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine gauge color based on score (same palette as the .badge-*
  // classes in index.css, so this reads consistently with every other
  // status badge in the app).
  let strokeColor = '#2D5A27';
  let statusBg = 'bg-[#E4F0E2] text-[#1E3A1A] border-[#A8CAA4]';
  let dotColor = 'bg-[#2D5A27]';

  if (score >= 75) {
    strokeColor = '#2D5A27'; // green
    statusBg = 'bg-[#E4F0E2] text-[#1E3A1A] border-[#A8CAA4]';
    dotColor = 'bg-[#2D5A27]';
  } else if (score >= 55) {
    strokeColor = '#D97706'; // amber
    statusBg = 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
    dotColor = 'bg-[#D97706]';
  } else {
    strokeColor = '#DC2626'; // red
    statusBg = 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]';
    dotColor = 'bg-[#DC2626]';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Glowing background ring */}
        <div className="absolute inset-0 rounded-full blur-xl opacity-25" style={{ backgroundColor: strokeColor }}></div>

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#D2DEC9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-extrabold tracking-tight text-[#1A2318] font-heading">
            {score}
            <span className="text-lg text-[#5A6D53] font-normal"> / {maxScore}</span>
          </div>
          
          <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mr-1.5 animate-pulse`}></span>
            {statusText}
          </div>
        </div>
      </div>

      {subtitle && (
        <p className="mt-4 text-xs sm:text-sm text-[#4A5D44] text-center font-medium max-w-xs">
          {subtitle}
        </p>
      )}
    </div>
  );
};
