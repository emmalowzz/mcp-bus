import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Activity, 
  AlertTriangle,
  Play,
  Flame,
  Radio
} from 'lucide-react';
import { soundFX } from '../utils/audio';

export type ActiveNavTab = 'arrivals' | 'lta' | 'map' | 'trips' | 'lines';

interface HeaderProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isRushHour: boolean;
  onToggleRushHour: () => void;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isSoundEnabled,
  onToggleSound,
  isRushHour,
  onToggleRushHour,
  unreadAlertCount,
  onOpenAlerts
}) => {
  return (
    <header className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between z-30 select-none shrink-0">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('arrivals');
          }}
          className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-7 h-7 rounded-md bg-[#2563EB] flex items-center justify-center text-white font-timer text-sm font-black shadow-xs">
            TP
          </span>
          <span className="font-extrabold tracking-tight text-slate-900">
            TransitPulse
          </span>
        </a>
      </div>

      {/* Zone 2: 4-5 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
        <button
          onClick={() => onTabChange('arrivals')}
          className={`transition-colors whitespace-nowrap py-1 relative ${
            activeTab === 'arrivals'
              ? 'text-[#2563EB] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2563EB]'
              : 'hover:text-slate-900'
          }`}
        >
          Live Arrivals
        </button>

        <button
          onClick={() => onTabChange('lta')}
          className={`transition-colors whitespace-nowrap py-1 relative flex items-center gap-1.5 ${
            activeTab === 'lta'
              ? 'text-[#2563EB] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2563EB]'
              : 'hover:text-slate-900'
          }`}
        >
          <span>SG Bus (LTA)</span>
          <span className="text-[10px] font-mono font-extrabold bg-blue-100 text-[#2563EB] px-1 rounded">v3</span>
        </button>

        <button
          onClick={() => onTabChange('map')}
          className={`transition-colors whitespace-nowrap py-1 relative ${
            activeTab === 'map'
              ? 'text-[#2563EB] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2563EB]'
              : 'hover:text-slate-900'
          }`}
        >
          Interactive Map
        </button>

        <button
          onClick={() => onTabChange('trips')}
          className={`transition-colors whitespace-nowrap py-1 relative ${
            activeTab === 'trips'
              ? 'text-[#2563EB] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2563EB]'
              : 'hover:text-slate-900'
          }`}
        >
          Trip Planner
        </button>

        <button
          onClick={() => onTabChange('lines')}
          className={`transition-colors whitespace-nowrap py-1 relative ${
            activeTab === 'lines'
              ? 'text-[#2563EB] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2563EB]'
              : 'hover:text-slate-900'
          }`}
        >
          Lines & Schedules
        </button>

        <button
          onClick={onOpenAlerts}
          className="transition-colors whitespace-nowrap py-1 text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <span>Service Advisories</span>
          {unreadAlertCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
              {unreadAlertCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        {/* Simulation: Rush Hour Condition Toggle */}
        <button
          onClick={onToggleRushHour}
          title={isRushHour ? 'Active: Peak Rush Hour (Heavy Traffic Delay)' : 'Normal Operations'}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
            isRushHour
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame size={14} className={isRushHour ? 'text-amber-600 fill-amber-500' : 'text-slate-400'} />
          <span className="hidden sm:inline">{isRushHour ? 'Peak Congestion (+4m)' : 'Standard Flow'}</span>
        </button>

        {/* Audio Chime Notification */}
        <button
          onClick={onToggleSound}
          title={isSoundEnabled ? 'Arrival Audio Chime Enabled' : 'Enable Arrival Audio Chime'}
          className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
            isSoundEnabled
              ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
        >
          {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Mobile View Toggle Button (Tabs on Mobile) */}
        <div className="flex md:hidden items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => onTabChange(activeTab === 'map' ? 'arrivals' : 'map')}
            className="px-2.5 py-1 text-xs font-bold rounded bg-white text-slate-900 shadow-xs"
          >
            {activeTab === 'map' ? 'Feed' : 'Map'}
          </button>
        </div>
      </div>
    </header>
  );
};
