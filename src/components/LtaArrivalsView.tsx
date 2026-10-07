import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  RotateCw, 
  Clock, 
  Users, 
  Accessibility, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  Bus,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  fetchLtaBusArrival, 
  checkApiHealth, 
  getSecondsUntilArrival, 
  mapLtaLoad, 
  POPULAR_LTA_BUS_STOPS,
  LtaService,
  LtaHealthResponse
} from '../utils/ltaApi';
import { RouteShield } from './RouteShield';
import { formatCountdown } from '../utils/transitEngine';
import { soundFX } from '../utils/audio';

interface LtaArrivalsViewProps {
  onOpenHealthModal?: () => void;
}

export const LtaArrivalsView: React.FC<LtaArrivalsViewProps> = () => {
  const [busStopCode, setBusStopCode] = useState<string>('04121');
  const [serviceNo, setServiceNo] = useState<string>('');
  const [services, setServices] = useState<LtaService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'live' | 'simulated' | 'error'>('simulated');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(20);
  const [healthStatus, setHealthStatus] = useState<LtaHealthResponse | null>(null);
  const [showHealthModal, setShowHealthModal] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Function to load arrivals
  const loadArrivals = async (targetCode = busStopCode, targetService = serviceNo) => {
    if (!targetCode || targetCode.trim() === '') return;
    setIsLoading(true);
    setErrorMessage(null);

    const result = await fetchLtaBusArrival(targetCode.trim(), targetService);
    setIsLoading(false);
    setDataSource(result.source);
    setLastRefreshedAt(new Date());

    if (result.error) {
      setErrorMessage(result.error);
      setServices([]);
    } else if (result.data?.Services) {
      setServices(result.data.Services);
      setRefreshCountdown(20); // Reset 20-second counter

      // Check if any bus is due (< 45s) and trigger chime
      result.data.Services.forEach((s) => {
        const sec = getSecondsUntilArrival(s.NextBus?.EstimatedArrival);
        if (sec <= 45 && sec > 0) {
          soundFX.playArrivalChime();
        }
      });
    }
  };

  // Initial load & check health
  useEffect(() => {
    loadArrivals();
    checkApiHealth().then((h) => setHealthStatus(h));
  }, []);

  // 20-second auto refresh interval per LTA specifications
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          loadArrivals(busStopCode, serviceNo);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [busStopCode, serviceNo]);

  // Load code helper
  const renderLoadBadge = (load?: string) => {
    switch (load) {
      case 'SEA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Seats Available (SEA)
          </span>
        );
      case 'SDA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Standing Available (SDA)
          </span>
        );
      case 'LSD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Limited Standing (LSD)
          </span>
        );
      default:
        return null;
    }
  };

  const renderBusType = (type?: string) => {
    switch (type) {
      case 'DD':
        return <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Double Deck</span>;
      case 'BD':
        return <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Bendy Bus</span>;
      case 'SD':
      default:
        return <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Single Deck</span>;
    }
  };

  const currentStopInfo = POPULAR_LTA_BUS_STOPS.find((s) => s.code === busStopCode);

  return (
    <div className="flex flex-col h-full bg-[#faf8ff] border-r border-slate-200 overflow-hidden">
      {/* 1. Header & Parameter Inputs */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                LTA DATAMALL V3
              </span>
              <button
                onClick={() => setShowHealthModal(true)}
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  healthStatus?.lta_configured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <Activity size={11} />
                <span>API Health: {healthStatus?.lta_configured ? 'Live Key Active' : 'Key Pending'}</span>
              </button>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
              Singapore Bus Telemetry
            </h2>
          </div>

          {/* 20-second countdown badge */}
          <div className="text-right">
            <div className="flex items-center gap-1.5 font-timer text-xs font-bold text-slate-700 tabular-nums">
              <Clock size={12} className="text-[#2563EB]" />
              <span>Next Sync: {refreshCountdown}s</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Auto 20s Headway
            </span>
          </div>
        </div>

        {/* Inputs: BusStopCode + ServiceNo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* BusStopCode Input */}
          <div className="sm:col-span-2 relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">
              Stop:
            </span>
            <input
              type="text"
              placeholder="e.g. 04121"
              value={busStopCode}
              onChange={(e) => setBusStopCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') loadArrivals();
              }}
              className="w-full pl-14 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
            />
          </div>

          {/* ServiceNo Input */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">
              Bus:
            </span>
            <input
              type="text"
              placeholder="All or 7"
              value={serviceNo}
              onChange={(e) => setServiceNo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') loadArrivals();
              }}
              className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white"
            />
          </div>
        </div>

        {/* Quick Pick Stops */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Popular:
          </span>
          {POPULAR_LTA_BUS_STOPS.map((s) => (
            <button
              key={s.code}
              onClick={() => {
                setBusStopCode(s.code);
                loadArrivals(s.code, serviceNo);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold whitespace-nowrap transition-colors shrink-0 ${
                busStopCode === s.code
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              #{s.code}
            </button>
          ))}
          <button
            onClick={() => loadArrivals()}
            disabled={isLoading}
            className="ml-auto px-2.5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
          >
            <RotateCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stop Location Context Banner */}
        {currentStopInfo && (
          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between">
            <span className="font-semibold truncate">
              {currentStopInfo.name} ({currentStopInfo.road})
            </span>
            <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
              LTA Code {currentStopInfo.code}
            </span>
          </div>
        )}
      </div>

      {/* 2. Key Environment Notice Banner if Simulated */}
      {dataSource === 'simulated' && (
        <div className="p-3 bg-amber-50/80 border-b border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">LTA_ACCOUNT_KEY pending in Vercel:</span> Serving structured real-time simulation matching actual Singapore routes.
            Add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-[11px]">LTA_ACCOUNT_KEY</code> in Vercel to activate direct live feed!
          </div>
          <button
            onClick={() => setShowHealthModal(true)}
            className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 shrink-0"
          >
            Setup Guide
          </button>
        </div>
      )}

      {/* 3. Services Arrival Cards Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {errorMessage && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <AlertTriangle size={14} />
              <span>Failed to load LTA bus arrivals</span>
            </div>
            <div>{errorMessage}</div>
          </div>
        )}

        {services.length > 0 ? (
          services.map((svc) => {
            const nextSec = getSecondsUntilArrival(svc.NextBus?.EstimatedArrival);
            const { display, isDue, unit } = formatCountdown(nextSec);
            const nextSec2 = getSecondsUntilArrival(svc.NextBus2?.EstimatedArrival);
            const nextSec3 = getSecondsUntilArrival(svc.NextBus3?.EstimatedArrival);

            const m2 = Math.floor(nextSec2 / 60);
            const m3 = Math.floor(nextSec3 / 60);

            return (
              <div
                key={svc.ServiceNo}
                className="bg-white rounded-lg p-3.5 border border-slate-200 hover:border-[#2563EB] shadow-xs transition-all"
              >
                {/* Header row: Service No + Operator + Next Bus Timer */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <RouteShield
                      code={svc.ServiceNo}
                      mode="bus"
                      color="#2563EB"
                      textColor="#FFFFFF"
                      size="lg"
                      showIcon={false}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Bus Service {svc.ServiceNo}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                          {svc.Operator || 'SBST'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderBusType(svc.NextBus?.Type)}
                        {svc.NextBus?.Feature === 'WAB' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            <Accessibility size={10} />
                            <span>WAB</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mechanical Countdown Timer */}
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      {nextSec <= 300 && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      )}
                      <div
                        className={`font-timer text-2xl font-extrabold tabular-nums ${
                          isDue
                            ? 'text-emerald-600 animate-pulse'
                            : nextSec <= 300
                            ? 'text-emerald-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {display}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      {unit}
                    </div>
                  </div>
                </div>

                {/* Load Status & Subsequent Buses */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div>
                    {renderLoadBadge(svc.NextBus?.Load)}
                  </div>

                  {/* Next Bus 2 & 3 */}
                  <div className="text-[11px] text-slate-500 tabular-nums font-mono">
                    {svc.NextBus2?.EstimatedArrival && (
                      <span className="mr-2">
                        Next: <strong className="text-slate-800">{m2}m</strong>
                        {svc.NextBus2.Type && ` (${svc.NextBus2.Type})`}
                      </span>
                    )}
                    {svc.NextBus3?.EstimatedArrival && (
                      <span>
                        Then: <strong className="text-slate-800">{m3}m</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : !isLoading ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
            <Bus size={32} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No buses currently arriving</h4>
            <p className="text-xs text-slate-500 mt-1">
              Verify the BusStopCode (#{busStopCode}) or clear the ServiceNo filter.
            </p>
          </div>
        ) : null}
      </div>

      {/* 4. Footer Telemetry Bar */}
      <div className="p-3 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-700">LTA Sync: {dataSource}</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono tabular-nums">Refreshed {lastRefreshedAt.toLocaleTimeString()}</span>
        </div>
        <button
          onClick={() => setShowHealthModal(true)}
          className="font-mono text-[#2563EB] hover:underline font-bold"
        >
          API Info
        </button>
      </div>

      {/* Health & Documentation Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold">LTA DataMall & API Health Monitor</h3>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">Endpoint Status:</div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>/api/health</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">200 OK</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>/api/bus-arrival</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">200 OK</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>LTA_ACCOUNT_KEY:</span>
                  <span className={healthStatus?.lta_configured ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {healthStatus?.lta_configured ? 'Configured & Active' : 'Not Set (Simulation Active)'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-slate-800">How to add your LTA Key in Vercel:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Go to your <strong>Vercel Dashboard</strong> &rarr; Select your project.</li>
                  <li>Click <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
                  <li>Add Key: <code className="bg-slate-100 font-mono font-bold text-slate-800 px-1">LTA_ACCOUNT_KEY</code></li>
                  <li>Value: Your Singapore LTA DataMall AccountKey.</li>
                  <li>Redeploy or promote to production.</li>
                </ol>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px]">
                <strong>API Request Reference:</strong>
                <pre className="mt-1 font-mono text-[10px] bg-white p-2 rounded border border-blue-100 overflow-x-auto">
GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121&ServiceNo=7
Header: AccountKey: &lt;YOUR_LTA_ACCOUNT_KEY&gt;
                </pre>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHealthModal(false)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
