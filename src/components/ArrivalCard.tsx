import React from 'react';
import { Users, Clock, ChevronRight, Zap, ShieldAlert } from 'lucide-react';
import { ArrivalPrediction, TransitLine, Vehicle } from '../types/transit';
import { RouteShield } from './RouteShield';
import { formatCountdown } from '../utils/transitEngine';

interface ArrivalCardProps {
  prediction: ArrivalPrediction;
  line: TransitLine;
  vehicle?: Vehicle;
  isSelected?: boolean;
  onSelectVehicle?: (vehicleId: string) => void;
  onTrackOnMap?: (lineId: string, vehicleId: string) => void;
}

export const ArrivalCard: React.FC<ArrivalCardProps> = ({
  prediction,
  line,
  vehicle,
  isSelected = false,
  onSelectVehicle,
  onTrackOnMap
}) => {
  const { display, isDue, unit } = formatCountdown(prediction.estimatedSecondsRemaining);
  const isDelayed = prediction.delayMinutes > 0;
  const isUnder5 = prediction.estimatedSecondsRemaining <= 300;

  // Occupancy text & color
  const occupancyMap = {
    low: { label: 'Light Seats', color: 'text-emerald-700' },
    moderate: { label: 'Seats Open', color: 'text-blue-700' },
    crowded: { label: 'Standing Room', color: 'text-amber-700' },
    full: { label: 'At Capacity', color: 'text-red-700' },
  };

  const occ = occupancyMap[prediction.occupancy] || occupancyMap.low;

  return (
    <div
      onClick={() => {
        if (onSelectVehicle) onSelectVehicle(prediction.vehicleId);
        if (onTrackOnMap) onTrackOnMap(line.id, prediction.vehicleId);
      }}
      className={`group relative bg-white rounded-lg p-3.5 transition-all duration-150 cursor-pointer border ${
        isSelected
          ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-md'
          : 'border-slate-200 hover:border-[#2563EB] hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Route Shield Token */}
        <div className="shrink-0 flex flex-col items-center gap-1.5">
          <RouteShield
            code={line.code}
            mode={line.mode}
            color={line.color}
            textColor={line.textColor}
            size="lg"
            showIcon={true}
          />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {prediction.vehicleId.replace(/^(BUS|BRT|RAIL|FERRY)-/, '#')}
          </span>
        </div>

        {/* Center: Destination & Subtext */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h4 className="text-[15px] font-bold text-slate-900 truncate tracking-tight group-hover:text-[#2563EB] transition-colors">
              {prediction.destination}
            </h4>
          </div>

          <p className="text-xs text-slate-500 truncate mt-0.5">
            {line.name} · {prediction.platform || 'Bay A'}
          </p>

          {/* Metadata: Occupancy, Scheduled vs Estimated */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
            <span className="flex items-center gap-1 font-medium">
              <Users size={12} className={occ.color} />
              <span className={occ.color}>{occ.label}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Clock size={11} className="text-slate-400" />
              <span>Sched {prediction.scheduledTime}</span>
            </span>
            {vehicle?.isElectric && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                  <Zap size={11} />
                  <span>EV</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Countdown Mechanical Timer */}
        <div className="shrink-0 text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            {/* Live GPS Ping Ring if Arriving or Under 5 min */}
            {isUnder5 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}

            {/* Countdown Value */}
            <div
              className={`font-timer text-[26px] leading-none font-extrabold tracking-tight tabular-nums ${
                isDue
                  ? 'text-emerald-600 animate-pulse'
                  : isDelayed
                  ? 'text-amber-600'
                  : isUnder5
                  ? 'text-emerald-600'
                  : 'text-slate-900'
              }`}
            >
              {display}
            </div>
          </div>

          {/* Timer unit or subtext */}
          <span
            className={`text-[10px] font-mono font-bold tracking-wider uppercase mt-0.5 ${
              isDue
                ? 'text-emerald-600'
                : isDelayed
                ? 'text-amber-600'
                : isUnder5
                ? 'text-emerald-600'
                : 'text-slate-500'
            }`}
          >
            {unit}
          </span>

          {/* Delay Tag if applicable */}
          {isDelayed && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 mt-1">
              <ShieldAlert size={9} />
              +{prediction.delayMinutes}m DELAY
            </span>
          )}

          {/* Subsequent Departures */}
          {prediction.subsequentArrivals && prediction.subsequentArrivals.length > 0 && (
            <div className="text-[10px] text-slate-400 tabular-nums mt-1.5">
              Next: <span className="font-semibold text-slate-600">{prediction.subsequentArrivals.map((m) => `${m}m`).join(' · ')}</span>
            </div>
          )}
        </div>

        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0 ml-0.5" />
      </div>
    </div>
  );
};
