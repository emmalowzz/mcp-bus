import React, { useState } from 'react';
import { 
  Bus, 
  Train, 
  Waves, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  MapPin, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { TransitLine, TransitStop, Vehicle } from '../types/transit';
import { RouteShield } from './RouteShield';

interface LinesDirectoryProps {
  lines: TransitLine[];
  stops: TransitStop[];
  vehicles: Vehicle[];
  onSelectLine: (lineId: string) => void;
  onSelectStop: (stopId: string) => void;
}

export const LinesDirectory: React.FC<LinesDirectoryProps> = ({
  lines,
  stops,
  vehicles,
  onSelectLine,
  onSelectStop
}) => {
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [expandedLineId, setExpandedLineId] = useState<string>('14X');

  const filteredLines = lines.filter((l) => {
    if (selectedMode === 'all') return true;
    return l.mode === selectedMode;
  });

  return (
    <div className="flex flex-col h-full bg-[#faf8ff] border-r border-slate-200">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-xs">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
          Transit Network Lines
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Schedules, headway frequencies, and route terminal points
        </p>

        {/* Mode filter buttons */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'bus', label: 'Metro Bus' },
            { id: 'rail', label: 'Rapid Rail' },
            { id: 'brt', label: 'Express BRT' },
            { id: 'ferry', label: 'Ferry' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${
                selectedMode === mode.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lines Feed */}
      <div className="p-3.5 space-y-3 overflow-y-auto flex-1">
        {filteredLines.map((line) => {
          const isExpanded = expandedLineId === line.id;
          const activeLineVehicles = vehicles.filter((v) => v.lineId === line.id);

          return (
            <div
              key={line.id}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              {/* Line Summary Row */}
              <div
                onClick={() => setExpandedLineId(isExpanded ? '' : line.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RouteShield
                    code={line.code}
                    mode={line.mode}
                    color={line.color}
                    textColor={line.textColor}
                    size="md"
                    showIcon={true}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{line.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {line.origin} <ArrowRight size={10} className="inline mx-1 text-slate-400" /> {line.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold font-timer text-slate-800 tabular-nums">
                      Every {line.peakFrequencyMin}m
                    </div>
                    <div className="text-[10px] text-slate-400">Peak Headway</div>
                  </div>
                  {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    {line.description}
                  </p>

                  {/* Active Alert banner if line has alert */}
                  {line.activeAlert && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                      <span className="font-semibold text-[11px]">{line.activeAlert}</span>
                    </div>
                  )}

                  {/* Operating Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Service Hours</span>
                      <span className="font-bold text-slate-800">{line.operatingHours}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block font-semibold">Live Units Active</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {activeLineVehicles.length} vehicles on route
                      </span>
                    </div>
                  </div>

                  {/* Stops Directory list */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Stations & Stops ({line.stopIds.length})</span>
                      <button
                        onClick={() => onSelectLine(line.id)}
                        className="text-[#2563EB] hover:underline font-bold"
                      >
                        Highlight On Map
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {line.stopIds.map((sId, index) => {
                        const stop = stops.find((s) => s.id === sId);
                        if (!stop) return null;

                        return (
                          <div
                            key={stop.id}
                            onClick={() => onSelectStop(stop.id)}
                            className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 hover:border-[#2563EB] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center font-mono">
                                {index + 1}
                              </span>
                              <span className="font-bold text-slate-800 text-xs">{stop.name}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">
                              #{stop.code}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
