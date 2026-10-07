import React, { useState, useEffect, useRef } from 'react';
import { 
  INITIAL_STOPS, 
  INITIAL_LINES, 
  INITIAL_VEHICLES, 
  INITIAL_ALERTS 
} from './data/transitData';
import { 
  TransitStop, 
  TransitLine, 
  Vehicle, 
  ArrivalPrediction, 
  ServiceAlert 
} from './types/transit';
import { 
  updateVehicles, 
  getArrivalPredictionsForStop 
} from './utils/transitEngine';
import { soundFX } from './utils/audio';

import { Header, ActiveNavTab } from './components/Header';
import { ArrivalsPanel } from './components/ArrivalsPanel';
import { TransitMap } from './components/TransitMap';
import { VehicleInspector } from './components/VehicleInspector';
import { TripPlanner } from './components/TripPlanner';
import { LinesDirectory } from './components/LinesDirectory';
import { AlertsModal } from './components/AlertsModal';

export default function App() {
  const [stops, setStops] = useState<TransitStop[]>(INITIAL_STOPS);
  const [lines, setLines] = useState<TransitLine[]>(INITIAL_LINES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [alerts, setAlerts] = useState<ServiceAlert[]>(INITIAL_ALERTS);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('arrivals');
  
  // Selection states
  const [selectedStopId, setSelectedStopId] = useState<string>('stop_hub');
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>('14X');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>('BUS-4092');
  const [highlightedPath, setHighlightedPath] = useState<{ x: number; y: number }[] | undefined>(undefined);

  // Commuter preferences
  const [favoriteStopIds, setFavoriteStopIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tp_favorite_stops');
      return saved ? JSON.parse(saved) : ['stop_hub', 'stop_market_4th'];
    } catch {
      return ['stop_hub', 'stop_market_4th'];
    }
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isRushHour, setIsRushHour] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  // Live countdown predictions for active stop
  const [predictions, setPredictions] = useState<ArrivalPrediction[]>([]);

  const activeStop = stops.find((s) => s.id === selectedStopId) || stops[0];
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedVehicleLine = selectedVehicle ? lines.find((l) => l.id === selectedVehicle.lineId) : undefined;

  // Track previous due vehicles to trigger arrival chime only once
  const chimedVehiclesRef = useRef<Set<string>>(new Set());

  // Save favorites to localStorage
  const handleToggleFavoriteStop = (stopId: string) => {
    setFavoriteStopIds((prev) => {
      const next = prev.includes(stopId) ? prev.filter((id) => id !== stopId) : [...prev, stopId];
      try {
        localStorage.setItem('tp_favorite_stops', JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  const handleToggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    soundFX.enableSound(next);
    if (next) {
      soundFX.playArrivalChime(); // Sample confirmation chime
    }
  };

  const handleToggleRushHour = () => {
    setIsRushHour((prev) => !prev);
  };

  // 1-second real-time simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      // Step vehicles forward with physics
      setVehicles((prevVehicles) => {
        const trafficFactor = isRushHour ? 1.7 : 1.0;
        const updated = updateVehicles(prevVehicles, lines, trafficFactor, 1.0);
        return updated;
      });

      // Update predictions for the active stop
      setPredictions((prevPreds) => {
        if (!activeStop) return prevPreds;
        const delay = isRushHour ? 4 : 0;
        const nextPreds = getArrivalPredictionsForStop(activeStop, lines, vehicles, delay);

        // Check if any vehicle is newly DUE
        nextPreds.forEach((p) => {
          if (p.estimatedSecondsRemaining <= 45 && !chimedVehiclesRef.current.has(p.vehicleId)) {
            chimedVehiclesRef.current.add(p.vehicleId);
            soundFX.playArrivalChime();
          } else if (p.estimatedSecondsRemaining > 120) {
            chimedVehiclesRef.current.delete(p.vehicleId);
          }
        });

        return nextPreds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeStop, lines, vehicles, isRushHour]);

  // Initial load of predictions when active stop changes
  useEffect(() => {
    if (activeStop) {
      const delay = isRushHour ? 4 : 0;
      setPredictions(getArrivalPredictionsForStop(activeStop, lines, vehicles, delay));
    }
  }, [selectedStopId, isRushHour]);

  // Select handlers
  const handleSelectStop = (stopId: string) => {
    setSelectedStopId(stopId);
    // If mobile, keep user focused on feed or map
  };

  const handleSelectLine = (lineId: string) => {
    setSelectedLineId(lineId);
    const line = lines.find((l) => l.id === lineId);
    if (line) {
      setHighlightedPath(line.path);
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const v = vehicles.find((veh) => veh.id === vehicleId);
    if (v) {
      setSelectedLineId(v.lineId);
    }
  };

  const handleTrackOnMap = (lineId: string, vehicleId: string) => {
    setSelectedLineId(lineId);
    setSelectedVehicleId(vehicleId);
    // Switch tab to map on mobile if on mobile screen
    if (window.innerWidth < 1024) {
      setActiveTab('map');
    }
  };

  const handleRefreshTelemetry = () => {
    const delay = isRushHour ? 4 : 0;
    setPredictions(getArrivalPredictionsForStop(activeStop, lines, vehicles, delay));
    soundFX.playArrivalChime();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#faf8ff] text-[#131b2e] font-sans antialiased">
      {/* 1. Header (Strict Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        isRushHour={isRushHour}
        onToggleRushHour={handleToggleRushHour}
        unreadAlertCount={alerts.length}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
      />

      {/* 2. Main Dual-Surface Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (440px on Desktop, Full Screen or Hidden on Mobile based on tab) */}
        <aside
          className={`w-full lg:w-[460px] xl:w-[480px] shrink-0 h-full overflow-hidden z-10 transition-all ${
            activeTab === 'map' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeTab === 'arrivals' && (
            <ArrivalsPanel
              stops={stops}
              lines={lines}
              vehicles={vehicles}
              activeStop={activeStop}
              predictions={predictions}
              selectedVehicleId={selectedVehicleId}
              favoriteStopIds={favoriteStopIds}
              onSelectStop={handleSelectStop}
              onSelectLine={handleSelectLine}
              onSelectVehicle={handleSelectVehicle}
              onToggleFavoriteStop={handleToggleFavoriteStop}
              onRefreshTelemetry={handleRefreshTelemetry}
              onTrackOnMap={handleTrackOnMap}
            />
          )}

          {activeTab === 'trips' && (
            <TripPlanner
              stops={stops}
              lines={lines}
              onHighlightPath={setHighlightedPath}
              onSelectLine={handleSelectLine}
              onSelectStop={handleSelectStop}
            />
          )}

          {activeTab === 'lines' && (
            <LinesDirectory
              lines={lines}
              stops={stops}
              vehicles={vehicles}
              onSelectLine={handleSelectLine}
              onSelectStop={handleSelectStop}
            />
          )}
        </aside>

        {/* Right / Main Viewport: Interactive Transit Map */}
        <main
          className={`flex-1 h-full relative overflow-hidden ${
            activeTab !== 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          <TransitMap
            stops={stops}
            lines={lines}
            vehicles={vehicles}
            selectedStopId={selectedStopId}
            selectedLineId={selectedLineId}
            selectedVehicleId={selectedVehicleId}
            onSelectStop={handleSelectStop}
            onSelectLine={handleSelectLine}
            onSelectVehicle={handleSelectVehicle}
            highlightedPath={highlightedPath}
          />

          {/* Floating Vehicle Inspector Drawer (Over Map on right side) */}
          {selectedVehicle && selectedVehicleLine && (
            <div className="absolute top-4 right-16 sm:right-20 w-[92vw] sm:w-[380px] max-w-[400px] z-30">
              <VehicleInspector
                vehicle={selectedVehicle}
                line={selectedVehicleLine}
                stops={stops}
                onClose={() => setSelectedVehicleId(undefined)}
                onSelectStop={handleSelectStop}
                onFocusMap={() => {
                  // Already focused
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* 3. Alerts Modal */}
      <AlertsModal
        alerts={alerts}
        lines={lines}
        stops={stops}
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        onSelectLine={handleSelectLine}
        onSelectStop={handleSelectStop}
      />
    </div>
  );
}
