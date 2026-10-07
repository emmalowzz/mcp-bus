import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Layers, 
  Sun, 
  Moon, 
  Maximize2,
  Navigation2,
  Bus,
  Train,
  Waves,
  Zap,
  Info
} from 'lucide-react';
import { TransitStop, TransitLine, Vehicle } from '../types/transit';

interface TransitMapProps {
  stops: TransitStop[];
  lines: TransitLine[];
  vehicles: Vehicle[];
  selectedStopId: string;
  selectedLineId?: string;
  selectedVehicleId?: string;
  onSelectStop: (stopId: string) => void;
  onSelectLine: (lineId: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
  highlightedPath?: { x: number; y: number }[];
}

export const TransitMap: React.FC<TransitMapProps> = ({
  stops,
  lines,
  vehicles,
  selectedStopId,
  selectedLineId,
  selectedVehicleId,
  onSelectStop,
  onSelectLine,
  onSelectVehicle,
  highlightedPath
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Layer visibility toggles
  const [showVehicles, setShowVehicles] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [showSpeeds, setShowSpeeds] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [hoveredStop, setHoveredStop] = useState<TransitStop | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<Vehicle | null>(null);

  // Auto pan to selected stop or vehicle when changed
  useEffect(() => {
    if (selectedVehicleId) {
      const v = vehicles.find((veh) => veh.id === selectedVehicleId);
      if (v) {
        // Center on vehicle
        setPan({
          x: -(v.x - 500) * zoom,
          y: -(v.y - 350) * zoom
        });
      }
    } else if (selectedStopId) {
      const s = stops.find((stp) => stp.id === selectedStopId);
      if (s) {
        setPan({
          x: -(s.x - 500) * zoom,
          y: -(s.y - 350) * zoom
        });
      }
    }
  }, [selectedVehicleId, selectedStopId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(0.6, zoom * factor), 2.8);
    setZoom(newZoom);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedStop = stops.find((s) => s.id === selectedStopId);

  // SVG Theme colors
  const bgColor = isNightMode ? '#0a0f1d' : '#f8fafd';
  const gridColor = isNightMode ? '#1e293b' : '#e2e8f0';
  const waterColor = isNightMode ? '#0b2038' : '#e0f2fe';
  const shorelineColor = isNightMode ? '#1e3a5f' : '#bae6fd';
  const parkColor = isNightMode ? '#0f241d' : '#f0fdf4';
  const streetColor = isNightMode ? '#151e33' : '#ffffff';
  const labelColor = isNightMode ? '#f1f5f9' : '#0f172a';
  const subLabelColor = isNightMode ? '#94a3b8' : '#64748b';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={{ backgroundColor: bgColor }}
    >
      {/* SVG Canvas */}
      <svg
        viewBox="0 0 1000 700"
        className="w-full h-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        <defs>
          {/* Glow filter for active route polylines */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          {/* Shadow for vehicles */}
          <filter id="vehicleShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. Geographic Water / Bay / Shoreline */}
        <path
          d="M 680 0 Q 750 150 710 320 Q 690 440 760 550 Q 820 620 900 700 L 1000 700 L 1000 0 Z"
          fill={waterColor}
          stroke={shorelineColor}
          strokeWidth="2"
        />
        {/* Harbor Point Island */}
        <path
          d="M 830 140 Q 930 150 920 270 Q 860 300 820 230 Z"
          fill={waterColor}
          stroke={shorelineColor}
          strokeWidth="2"
        />

        {/* 2. Parks & Greenbelts */}
        <rect x="80" y="80" width="160" height="120" rx="20" fill={parkColor} stroke={isNightMode ? '#164e3b' : '#bbf7d0'} strokeWidth="1" />
        <rect x="260" y="360" width="110" height="70" rx="12" fill={parkColor} stroke={isNightMode ? '#164e3b' : '#bbf7d0'} strokeWidth="1" />

        {/* 3. Urban Grid Streets */}
        <g stroke={streetColor} strokeWidth="6" opacity={isNightMode ? 0.35 : 0.8}>
          {/* East-West Avenues */}
          <line x1="50" y1="120" x2="690" y2="120" />
          <line x1="50" y1="200" x2="710" y2="200" />
          <line x1="50" y1="280" x2="700" y2="280" />
          <line x1="50" y1="360" x2="680" y2="360" />
          <line x1="50" y1="440" x2="670" y2="440" />
          <line x1="50" y1="520" x2="730" y2="520" />
          <line x1="50" y1="600" x2="780" y2="600" />

          {/* North-South Streets */}
          <line x1="140" y1="50" x2="140" y2="650" />
          <line x1="220" y1="50" x2="220" y2="650" />
          <line x1="300" y1="50" x2="300" y2="650" />
          <line x1="380" y1="50" x2="380" y2="650" />
          <line x1="460" y1="50" x2="460" y2="650" />
          <line x1="540" y1="50" x2="540" y2="650" />
          <line x1="620" y1="50" x2="620" y2="650" />

          {/* Diagonal Thoroughfares */}
          <line x1="120" y1="620" x2="720" y2="220" strokeWidth="9" stroke={isNightMode ? '#1e293b' : '#cbd5e1'} />
        </g>

        {/* 4. Transit Line Polylines */}
        {showLines && lines.map((line) => {
          const isSelected = selectedLineId === line.id;
          const pointsStr = line.path.map((p) => `${p.x},${p.y}`).join(' ');
          const isFerry = line.mode === 'ferry';

          return (
            <g key={line.id} className="cursor-pointer" onClick={() => onSelectLine(line.id)}>
              {/* Outer halo / casing for contrast */}
              <polyline
                points={pointsStr}
                fill="none"
                stroke={isNightMode ? '#000000' : '#ffffff'}
                strokeWidth={isSelected ? 10 : 7}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />
              {/* Main colored route polyline */}
              <polyline
                points={pointsStr}
                fill="none"
                stroke={line.color}
                strokeWidth={isSelected ? 6 : 4.5}
                strokeDasharray={isFerry ? '6,6' : 'none'}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isSelected ? 'url(#routeGlow)' : undefined}
                className="transition-all duration-200"
              />
            </g>
          );
        })}

        {/* 5. Custom Highlighted Path (e.g. from Trip Planner) */}
        {highlightedPath && highlightedPath.length > 1 && (
          <polyline
            points={highlightedPath.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#10B981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8,6"
            className="animate-pulse"
          />
        )}

        {/* 6. Transit Stops / Stations */}
        {showStops && stops.map((stop) => {
          const isSelected = selectedStopId === stop.id;
          const isHovered = hoveredStop?.id === stop.id;
          const isServedBySelectedLine = selectedLineId ? stop.lines.includes(selectedLineId) : false;

          return (
            <g
              key={stop.id}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                onSelectStop(stop.id);
              }}
              onMouseEnter={() => setHoveredStop(stop)}
              onMouseLeave={() => setHoveredStop(null)}
            >
              {/* Active stop radar pulse ring */}
              {isSelected && (
                <circle
                  cx={stop.x}
                  cy={stop.y}
                  r="18"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  className="animate-ping opacity-75"
                />
              )}

              {/* Station Outer Ring */}
              <circle
                cx={stop.x}
                cy={stop.y}
                r={isSelected ? 9 : isHovered ? 8 : 6.5}
                fill={isSelected ? '#2563EB' : isNightMode ? '#0f172a' : '#ffffff'}
                stroke={isSelected ? '#ffffff' : isServedBySelectedLine ? '#2563EB' : isNightMode ? '#94a3b8' : '#0f172a'}
                strokeWidth={isSelected ? 3 : 2.5}
                className="transition-all duration-150"
              />

              {/* Station Inner Dot */}
              <circle
                cx={stop.x}
                cy={stop.y}
                r={isSelected ? 3.5 : 2.5}
                fill={isSelected ? '#ffffff' : '#0f172a'}
              />

              {/* Stop Label */}
              <text
                x={stop.x + 10}
                y={stop.y + 4}
                fill={isSelected ? '#2563EB' : labelColor}
                fontSize={isSelected ? '12px' : '10.5px'}
                fontWeight={isSelected ? '800' : '600'}
                fontFamily="Plus Jakarta Sans, sans-serif"
                className="select-none pointer-events-none drop-shadow-xs"
              >
                {stop.name}
              </text>
            </g>
          );
        })}

        {/* 7. Live Animated Vehicles */}
        {showVehicles && vehicles.map((vehicle) => {
          const line = lines.find((l) => l.id === vehicle.lineId);
          const isSelected = selectedVehicleId === vehicle.id;
          const isHovered = hoveredVehicle?.id === vehicle.id;
          const color = line?.color || '#2563EB';

          return (
            <g
              key={vehicle.id}
              transform={`translate(${vehicle.x}, ${vehicle.y})`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectVehicle(vehicle.id);
              }}
              onMouseEnter={() => setHoveredVehicle(vehicle)}
              onMouseLeave={() => setHoveredVehicle(null)}
              filter="url(#vehicleShadow)"
            >
              {/* Concentric live pulse ring for active vehicle */}
              <circle
                cx="0"
                cy="0"
                r="14"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                className="animate-ping opacity-60"
              />

              {/* Vehicle Body Pill with Heading Pointer */}
              <g transform={`rotate(${vehicle.bearing})`}>
                {/* Direction indicator wedge */}
                <polygon
                  points="0,-16 6,-8 -6,-8"
                  fill={color}
                />
              </g>

              {/* Vehicle Circular Chassis Marker */}
              <circle
                cx="0"
                cy="0"
                r={isSelected ? 13 : 11}
                fill={color}
                stroke="#ffffff"
                strokeWidth={isSelected ? 3 : 2}
                className="transition-all duration-150"
              />

              {/* Mode Icon Inside Vehicle */}
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9px"
                fontWeight="800"
                fontFamily="Inter, sans-serif"
                className="select-none pointer-events-none"
              >
                {line?.code.slice(0, 3)}
              </text>

              {/* Real-Time Speed Badge */}
              {showSpeeds && (
                <g transform="translate(0, 18)">
                  <rect
                    x="-20"
                    y="0"
                    width="40"
                    height="13"
                    rx="3"
                    fill={isNightMode ? '#0f172a' : '#ffffff'}
                    stroke={isNightMode ? '#334155' : '#cbd5e1'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="9.5"
                    textAnchor="middle"
                    fill={isNightMode ? '#38bdf8' : '#0284c7'}
                    fontSize="8px"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                    className="select-none pointer-events-none tabular-nums"
                  >
                    {vehicle.speedMph} mph
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating HUD Controls (Level 3 Elevation in Design Specs) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        {/* Zoom & Recenter Cluster */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 p-1 flex flex-col gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(2.8, z * 1.2))}
            title="Zoom In"
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z * 0.8))}
            title="Zoom Out"
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={resetView}
            title="Reset Map View"
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Compass size={18} />
          </button>
        </div>

        {/* Style & Layer Toggles */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 p-1 flex flex-col gap-1">
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            title={isNightMode ? 'Switch to Day Mode' : 'Switch to High-Contrast Night Mode'}
            className="w-9 h-9 flex items-center justify-center rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {isNightMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            title="Toggle Map Layers"
            className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
              showLayersMenu ? 'bg-[#2563EB] text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers size={18} />
          </button>
        </div>
      </div>

      {/* Layers Menu Drawer */}
      {showLayersMenu && (
        <div className="absolute top-4 right-16 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-200 p-3 w-56 z-30 text-xs">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-100 pb-1.5 flex items-center justify-between">
            <span>Map Layers</span>
            <span className="text-[10px] text-slate-400 font-normal">Active</span>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Bus size={14} className="text-[#2563EB]" />
                Live Vehicles
              </span>
              <input
                type="checkbox"
                checked={showVehicles}
                onChange={(e) => setShowVehicles(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Navigation2 size={14} className="text-[#0D9488]" />
                Transit Lines
              </span>
              <input
                type="checkbox"
                checked={showLines}
                onChange={(e) => setShowLines(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Train size={14} className="text-slate-700" />
                Stations & Stops
              </span>
              <input
                type="checkbox"
                checked={showStops}
                onChange={(e) => setShowStops(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Zap size={14} className="text-amber-600" />
                Live Speeds (mph)
              </span>
              <input
                type="checkbox"
                checked={showSpeeds}
                onChange={(e) => setShowSpeeds(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-0"
              />
            </label>
          </div>
        </div>
      )}

      {/* Floating Status & Telemetry Pill (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-800">Live GPS Stream</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 font-mono tabular-nums">{vehicles.length} Active Vehicles</span>
        </div>
      </div>

      {/* Bottom Map Legend / Context Bar */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs">
        <span className="font-bold text-slate-700 mr-1">Corridors:</span>
        {lines.map((l) => (
          <button
            key={l.id}
            onClick={() => onSelectLine(l.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              selectedLineId === l.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
            <span className="font-bold">{l.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
