import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  Clock, 
  Footprints, 
  Navigation, 
  ChevronRight, 
  CreditCard,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TransitStop, TransitLine, TripItinerary } from '../types/transit';
import { INITIAL_TRIP_ITINERARIES } from '../data/transitData';
import { RouteShield } from './RouteShield';
import { formatCountdown } from '../utils/transitEngine';

interface TripPlannerProps {
  stops: TransitStop[];
  lines: TransitLine[];
  onHighlightPath: (path: { x: number; y: number }[] | undefined) => void;
  onSelectLine: (lineId: string) => void;
  onSelectStop: (stopId: string) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  stops,
  lines,
  onHighlightPath,
  onSelectLine,
  onSelectStop
}) => {
  const [originStopId, setOriginStopId] = useState<string>('stop_ferry_bldg');
  const [destStopId, setDestStopId] = useState<string>('stop_civic_ctr');
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>(INITIAL_TRIP_ITINERARIES[0].id);

  const swapStations = () => {
    const temp = originStopId;
    setOriginStopId(destStopId);
    setDestStopId(temp);
  };

  const originStop = stops.find((s) => s.id === originStopId);
  const destStop = stops.find((s) => s.id === destStopId);

  // Generate path coordinates between origin and dest for map display
  const handleSelectItinerary = (itinerary: TripItinerary) => {
    setSelectedItineraryId(itinerary.id);
    if (originStop && destStop) {
      // Find intermediate lines or midpoint
      const midStop = stops.find((s) => s.id === 'stop_hub') || originStop;
      onHighlightPath([
        { x: originStop.x, y: originStop.y },
        { x: midStop.x, y: midStop.y },
        { x: destStop.x, y: destStop.y }
      ]);
    }
  };

  const activeItinerary = INITIAL_TRIP_ITINERARIES.find((it) => it.id === selectedItineraryId) || INITIAL_TRIP_ITINERARIES[0];

  return (
    <div className="flex flex-col h-full bg-[#faf8ff] border-r border-slate-200">
      {/* 1. Header & Inputs */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation size={18} className="text-[#2563EB]" />
            <span>Trip Planner</span>
          </h2>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Real-Time Engine
          </span>
        </div>

        {/* Origin / Destination form */}
        <div className="relative space-y-2">
          {/* Origin */}
          <div className="relative flex items-center">
            <div className="absolute left-3 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <select
              value={originStopId}
              onChange={(e) => setOriginStopId(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  From: {s.name} (#{s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div className="relative flex items-center">
            <div className="absolute left-3 w-2.5 h-2.5 rounded-full bg-[#2563EB] ring-2 ring-blue-200" />
            <select
              value={destStopId}
              onChange={(e) => setDestStopId(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  To: {s.name} (#{s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={swapStations}
            title="Swap Origin and Destination"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs hover:bg-slate-50 transition-colors z-10"
          >
            <ArrowUpDown size={14} />
          </button>
        </div>

        {/* Quick Route Preferences */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1 font-medium">
            <Clock size={13} className="text-slate-400" />
            <span>Leave Now (Live Headways)</span>
          </span>
          <button
            onClick={() => handleSelectItinerary(activeItinerary)}
            className="text-xs font-bold text-[#2563EB] hover:underline"
          >
            Preview on Map
          </button>
        </div>
      </div>

      {/* 2. Itinerary Cards Feed */}
      <div className="p-3.5 space-y-2.5 overflow-y-auto flex-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Suggested Commuter Options
        </div>

        {INITIAL_TRIP_ITINERARIES.map((itinerary) => {
          const isSelected = selectedItineraryId === itinerary.id;

          return (
            <div
              key={itinerary.id}
              onClick={() => handleSelectItinerary(itinerary)}
              className={`p-3.5 bg-white rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#2563EB] ring-2 ring-[#2563EB]/15 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{itinerary.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{itinerary.summary}</p>
                </div>
                <div className="text-right">
                  <div className="font-timer text-lg font-bold text-slate-900 tabular-nums">
                    {itinerary.durationMinutes} <span className="text-xs font-normal text-slate-500">min</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {itinerary.fare} · {itinerary.transfers} transfer
                  </div>
                </div>
              </div>

              {/* Legs Preview */}
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <Footprints size={12} />
                  <span>{itinerary.walkMinutes}m walk</span>
                </span>
                <span className="text-slate-300">·</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {itinerary.steps
                    .filter((s) => s.type === 'transit')
                    .map((s, idx) => {
                      const line = lines.find((l) => l.id === s.lineId);
                      return (
                        <RouteShield
                          key={idx}
                          code={line?.code || 'BUS'}
                          mode={line?.mode}
                          color={line?.color}
                          textColor={line?.textColor}
                          size="sm"
                          showIcon={false}
                        />
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. Selected Itinerary Step-By-Step Breakdown */}
        {activeItinerary && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 mt-3">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Step-by-Step Navigation
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">
                Arrival ~ {activeItinerary.durationMinutes} min
              </span>
            </div>

            <div className="space-y-4">
              {activeItinerary.steps.map((step, idx) => {
                const line = step.lineId ? lines.find((l) => l.id === step.lineId) : undefined;

                return (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="shrink-0 mt-0.5">
                      {step.type === 'walk' ? (
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <Footprints size={13} />
                        </div>
                      ) : (
                        <RouteShield
                          code={line?.code || 'TR'}
                          mode={line?.mode}
                          color={line?.color}
                          textColor={line?.textColor}
                          size="sm"
                          showIcon={false}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-bold text-slate-800">
                        {step.instructions}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {step.fromStop} <ArrowRight size={10} className="inline mx-1 text-slate-400" /> {step.toStop}
                      </div>
                      {step.departureCountdown && (
                        <div className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Clock size={11} />
                          <span>Boarding in ~{Math.round(step.departureCountdown / 60)} min</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-slate-400 font-mono text-[11px]">
                      {step.durationMinutes}m
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
