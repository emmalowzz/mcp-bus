import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ServiceAlert, TransitLine, TransitStop } from '../types/transit';
import { RouteShield } from './RouteShield';

interface AlertsModalProps {
  alerts: ServiceAlert[];
  lines: TransitLine[];
  stops: TransitStop[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLine: (lineId: string) => void;
  onSelectStop: (stopId: string) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  alerts,
  lines,
  stops,
  isOpen,
  onClose,
  onSelectLine,
  onSelectStop
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Civic Transit Advisories & Alerts
              </h3>
              <p className="text-xs text-slate-300">
                Official real-time operational bulletins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerts Content */}
        <div className="p-4 overflow-y-auto space-y-3.5">
          {alerts.map((alert) => {
            const isWarning = alert.severity === 'warning';
            const isCritical = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border text-xs space-y-2.5 ${
                  isCritical
                    ? 'bg-red-50/60 border-red-200'
                    : isWarning
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-blue-50/50 border-blue-200'
                }`}
              >
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isCritical ? (
                      <AlertCircle size={16} className="text-red-600 shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    ) : (
                      <Info size={16} className="text-blue-600 shrink-0" />
                    )}
                    <h4 className="font-bold text-slate-900 text-[13px]">
                      {alert.title}
                    </h4>
                  </div>
                  <span
                    className={`font-mono uppercase text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                      isCritical
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {alert.updatedTime}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  {alert.description}
                </p>

                {/* Recommendation */}
                <div className="bg-white/80 p-2.5 rounded border border-slate-200/80">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Commuter Guidance:
                  </span>
                  <span className="text-slate-600">{alert.recommendation}</span>
                </div>

                {/* Affected lines */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    Lines:
                  </span>
                  <div className="flex items-center gap-1">
                    {alert.affectedLines.map((lineId) => {
                      const line = lines.find((l) => l.id === lineId);
                      return (
                        <button
                          key={lineId}
                          onClick={() => {
                            onSelectLine(lineId);
                            onClose();
                          }}
                        >
                          <RouteShield
                            code={line?.code || lineId}
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
                  <span className="text-slate-400 font-mono text-[10px] ml-auto">
                    Posted: {alert.postedTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Municipal Dispatch Operational Feed</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-md font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
