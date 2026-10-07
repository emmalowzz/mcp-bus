import React from 'react';
import { 
  X, 
  Zap, 
  Users, 
  Gauge, 
  Compass, 
  Bike, 
  Accessibility, 
  Thermometer, 
  UserCheck, 
  CheckCircle2, 
  Circle,
  Crosshair
} from 'lucide-react';
import { Vehicle, TransitLine, TransitStop } from '../types/transit';
import { RouteShield } from './RouteShield';
import { formatCountdown } from '../utils/transitEngine';

interface VehicleInspectorProps {
  vehicle: Vehicle;
  line: TransitLine;
  stops: TransitStop[];
  onClose: () => void;
  onSelectStop: (stopId: string) => void;
  onFocusMap: () => void;
}

export const VehicleInspector: React.FC<VehicleInspectorProps> = ({
  vehicle,
  line,
  stops,
  onClose,
  onSelectStop,
  onFocusMap
}) => {
  // Get compass cardinal direction
  const getCardinal = (bearing: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(bearing / 45) % 8;
    return directions[idx];
  };

  const occupancyStyles = {
    low: { label: 'Low Occupancy (Seats Available)', barColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
    moderate: { label: 'Moderate (Seats Filling)', barColor: 'bg-blue-500', textColor: 'text-blue-700' },
    crowded: { label: 'Crowded (Standing Room Only)', barColor: 'bg-amber-500', textColor: 'text-amber-700' },
    full: { label: 'At Capacity', barColor: 'bg-red-500', textColor: 'text-red-700' }
  }[vehicle.occupancy];

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RouteShield
            code={line.code}
            mode={line.mode}
            color={line.color}
            textColor={line.textColor}
            size="lg"
            showIcon={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-200">
                Unit {vehicle.id}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              To {vehicle.destination}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onFocusMap}
            title="Focus On Map"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Crosshair size={18} />
          </button>
          <button
            onClick={onClose}
            title="Close Inspector"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto space-y-4">
        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Speed */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Gauge size={13} className="text-[#2563EB]" />
              <span>Speed</span>
            </div>
            <div className="text-lg font-bold font-timer text-slate-900 mt-1 tabular-nums">
              {vehicle.speedMph} <span className="text-xs font-normal text-slate-500">mph</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {vehicle.isStopped ? 'At Station Dwell' : 'Cruising Speed'}
            </div>
          </div>

          {/* Bearing */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Compass size={13} className="text-[#0D9488]" />
              <span>Heading</span>
            </div>
            <div className="text-lg font-bold font-timer text-slate-900 mt-1 tabular-nums">
              {vehicle.bearing}° <span className="text-xs font-normal text-slate-500">{getCardinal(vehicle.bearing)}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">GPS Gyro</div>
          </div>

          {/* Cabin Status */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <Thermometer size={13} className="text-emerald-600" />
              <span>Cabin Climate</span>
            </div>
            <div className="text-lg font-bold font-timer text-slate-900 mt-1 tabular-nums">
              70°F
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {vehicle.acOn ? 'HVAC Nominal' : 'Ventilation'}
            </div>
          </div>
        </div>

        {/* Live Passenger Capacity Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Users size={14} className={occupancyStyles.textColor} />
              <span>Passenger Load: {occupancyStyles.label}</span>
            </span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {vehicle.occupancyPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${occupancyStyles.barColor} transition-all duration-300`}
              style={{ width: `${vehicle.occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Vehicle Specs & Amenities */}
        <div className="text-xs space-y-2 border-t border-slate-100 pt-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Equipment & Compliance
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Zap size={14} className={vehicle.isElectric ? 'text-emerald-600' : 'text-slate-400'} />
              <span>{vehicle.model}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Accessibility size={14} className="text-blue-600" />
              <span>Low-Floor Automated Ramp</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Bike size={14} className="text-slate-600" />
              <span>{vehicle.hasBikeRack ? 'Front Bike Rack (2/2 Free)' : 'Interior Bike Bay'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <UserCheck size={14} className="text-slate-600" />
              <span className="truncate">{vehicle.driverId}</span>
            </div>
          </div>
        </div>

        {/* Linear Strip Map (Station Schematic) */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Linear Route Schematic
            </span>
            <span className="text-[10px] text-slate-400">Direction: Inbound</span>
          </div>

          <div className="relative pl-6 space-y-4">
            {/* Continuous Vertical Route Spine */}
            <div
              className="absolute left-2.5 top-2 bottom-2 w-1 rounded-full"
              style={{ backgroundColor: line.color }}
            />

            {line.stopIds.map((stopId, idx) => {
              const stop = stops.find((s) => s.id === stopId);
              if (!stop) return null;

              const isPassed = idx < vehicle.currentStopIndex;
              const isCurrent = idx === vehicle.currentStopIndex;
              const isUpcoming = idx > vehicle.currentStopIndex;

              // Calculate ETA minutes
              const stopsAway = idx - vehicle.currentStopIndex;
              const approxSeconds = Math.max(15, stopsAway * 160 - Math.round(vehicle.progressBetweenStops * 140));
              const { display, unit } = formatCountdown(approxSeconds);

              return (
                <div
                  key={stop.id}
                  onClick={() => onSelectStop(stop.id)}
                  className={`relative flex items-center justify-between group cursor-pointer ${
                    isPassed ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  {/* Station Node Marker */}
                  <div className="absolute -left-6 flex items-center justify-center">
                    {isPassed ? (
                      <CheckCircle2 size={16} className="text-slate-400 bg-white rounded-full" />
                    ) : isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-75" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] border-2 border-white" />
                      </div>
                    ) : (
                      <Circle size={14} className="text-slate-500 bg-white fill-white" />
                    )}
                  </div>

                  {/* Stop Name & Code */}
                  <div className="pl-2">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">
                      {stop.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Stop #{stop.code} · {stop.crossStreet}
                    </div>
                  </div>

                  {/* ETA or Status */}
                  <div className="text-right">
                    {isPassed ? (
                      <span className="text-[10px] text-slate-400 font-mono">Departed</span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#2563EB]">
                        Now Boarding
                      </span>
                    ) : (
                      <div className="font-timer text-xs font-bold text-slate-800 tabular-nums">
                        {display} <span className="text-[10px] font-normal text-slate-500">{unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
