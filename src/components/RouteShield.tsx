import React from 'react';
import { Bus, Train, Navigation, Waves } from 'lucide-react';
import { TransitMode } from '../types/transit';

interface RouteShieldProps {
  code: string;
  mode?: TransitMode;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const RouteShield: React.FC<RouteShieldProps> = ({
  code,
  mode = 'bus',
  color = '#2563EB',
  textColor = '#FFFFFF',
  size = 'md',
  className = '',
  showIcon = false,
}) => {
  const sizeClasses = {
    sm: 'h-6 min-w-[28px] px-1.5 text-[11px]',
    md: 'h-8 min-w-[36px] px-2 text-[13px]',
    lg: 'h-10 min-w-[48px] px-2.5 text-[15px]',
  }[size];

  const renderIcon = () => {
    if (!showIcon) return null;
    const iconSize = size === 'sm' ? 10 : size === 'md' ? 12 : 14;
    switch (mode) {
      case 'rail':
        return <Train size={iconSize} className="shrink-0" />;
      case 'ferry':
        return <Waves size={iconSize} className="shrink-0" />;
      case 'brt':
        return <Navigation size={iconSize} className="shrink-0" />;
      case 'bus':
      default:
        return <Bus size={iconSize} className="shrink-0" />;
    }
  };

  return (
    <div
      style={{ backgroundColor: color, color: textColor }}
      className={`inline-flex items-center justify-center gap-1 font-timer font-extrabold tracking-tight rounded-md shadow-xs select-none whitespace-nowrap transition-transform ${sizeClasses} ${className}`}
    >
      {renderIcon()}
      <span>{code}</span>
    </div>
  );
};
