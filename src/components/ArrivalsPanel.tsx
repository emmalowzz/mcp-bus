import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Accessibility, 
  Radio, 
  RotateCw, 
  SlidersHorizontal,
  ChevronDown,
  Navigation,
  Bus,
  Train,
  Waves,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { TransitStop, TransitLine, Vehicle, ArrivalPrediction, TransitMode } from '../types/transit';
import { ArrivalCard } from './ArrivalCard';
import { RouteShield } from './RouteShield';

interface ArrivalsPanelProps {
  stops: TransitStop[];
  lines: TransitLine[];
  vehicles: Vehicle[];
  activeStop: TransitStop;
  predictions: ArrivalPrediction[];
  selectedVehicleId?: string;
  favoriteStopIds: string[];
  onSelectStop: (stopId: string) => void;
  onSelectLine: (lineId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  onToggleFavoriteStop: (stopId: string) => void;
  onRefreshTelemetry: () => void;
  onTrackOnMap: (lineId: string, vehicleId: string) => void;
}

export const ArrivalsPanel: React.FC<ArrivalsPanelProps> = ({
  stops,
  lines,
  vehicles,
  activeStop,
  predictions,
  selectedVehicleId,
  favoriteStopIds,
  onSelectStop,
  onSelectLine,
  onSelectVehicle,
  onToggleFavoriteStop,
  onRefreshTelemetry,
  onTrackOnMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isFavorite = favoriteStopIds.includes(activeStop.id);

  // Search filtered stops
  const matchingStops = stops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.includes(searchQuery) ||
      s.crossStreet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter predictions by mode
  const filteredPredictions = predictions.filter((p) => {
    const line = lines.find((l) => l.id === p.lineId);
    if (!line) return true;
    if (selectedModeFilter === 'all') return true;
    if (selectedModeFilter === 'bus') return line.mode === 'bus';
    if (selectedModeFilter === 'rail') return line.mode === 'rail';
    if (selectedModeFilter === 'brt') return line.mode === 'brt';
    if (selectedModeFilter === 'ferry') return line.mode === 'ferry';
    if (selectedModeFilter === 'favorites') return line.code === '14X' || line.code === 'BLUE';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#faf8ff] border-r border-slate-200">
      {/* 1. Universal Stop Search & Selector */}
      <div className="p-3.5 bg-white border-b border-slate-200 shadow-xs">
        <div className="relative">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search station, stop code (e.g. 1010), or street..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-64 overflow-y-auto z-40">
              <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Transit Stops ({matchingStops.length})
              </div>
              {matchingStops.length > 0 ? (
                matchingStops.map((stop) => (
                  <button
                    key={stop.id}
                    onClick={() => {
                      onSelectStop(stop.id);
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{stop.name}</div>
                      <div className="text-[11px] text-slate-500">{stop.crossStreet}</div>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded">
                      #{stop.code}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  No stops found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Station Jump Shortcuts */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Hubs:
          </span>
          {stops.slice(0, 4).map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectStop(s.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                activeStop.id === s.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.name.replace(' Transit Hub', '').replace(' Station', '').replace(' Terminal', '')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Active Stop Header & Station Information */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                STOP #{activeStop.code}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeStop.zone}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {activeStop.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              <span>{activeStop.crossStreet}</span>
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavoriteStop(activeStop.id)}
              title={isFavorite ? 'Remove from favorites' : 'Pin to favorites'}
              className={`p-2 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 text-amber-500 border-amber-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
              }`}
            >
              <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onRefreshTelemetry}
              title="Force refresh live telemetry"
              className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>

        {/* Lines serving this stop + Amenities */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Serving:
            </span>
            {activeStop.lines.map((lCode) => {
              const line = lines.find((l) => l.id === lCode);
              return (
                <button
                  key={lCode}
                  onClick={() => onSelectLine(lCode)}
                  title={`View ${line?.name || lCode}`}
                >
                  <RouteShield
                    code={lCode}
                    mode={line?.mode}
                    color={line?.color}
                    textColor={line?.textColor}
                    size="sm"
                    showIcon={false}
                  />
                </button>
              );
            })}
          </div>

          {/* Amenities icons */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            {activeStop.accessible && (
              <span className="flex items-center gap-1 text-slate-600" title="Step-free ADA accessible boarding">
                <Accessibility size={13} className="text-blue-600" />
                <span className="text-[10px] font-semibold">ADA</span>
              </span>
            )}
            {activeStop.digitalBoard && (
              <span className="flex items-center gap-1 text-slate-600" title="Live electronic countdown display at shelter">
                <Radio size={13} className="text-emerald-600" />
                <span className="text-[10px] font-semibold">Live Signs</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Filter Segmented Tabs */}
      <div className="px-4 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'bus', label: 'Bus' },
            { id: 'rail', label: 'Rail' },
            { id: 'brt', label: 'BRT' },
            { id: 'ferry', label: 'Ferry' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedModeFilter(tab.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                selectedModeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
          {filteredPredictions.length} due
        </div>
      </div>

      {/* 4. Live Arrival Cards Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map((pred) => {
            const line = lines.find((l) => l.id === pred.lineId);
            const vehicle = vehicles.find((v) => v.id === pred.vehicleId);
            if (!line) return null;

            return (
              <ArrivalCard
                key={pred.id}
                prediction={pred}
                line={line}
                vehicle={vehicle}
                isSelected={selectedVehicleId === pred.vehicleId}
                onSelectVehicle={onSelectVehicle}
                onTrackOnMap={onTrackOnMap}
              />
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
            <Bus size={32} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No scheduled arrivals for this filter</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try switching back to "All Modes" to see incoming vehicles.
            </p>
            <button
              onClick={() => setSelectedModeFilter('all')}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              Show All Lines
            </button>
          </div>
        )}
      </div>

      {/* 5. Live Municipal Telemetry Footer */}
      <div className="p-3 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-700">Sub-minute Telemetry</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono tabular-nums text-emerald-700 font-semibold">12ms socket</span>
        </div>
        <div className="font-mono tabular-nums text-slate-400">
          GPS: ±3.2m
        </div>
      </div>
    </div>
  );
};
