import { TransitLine, TransitStop, Vehicle, ArrivalPrediction } from '../types/transit';

// Calculate Euclidean distance between two points
export function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate bearing in degrees from point 1 to point 2
export function getBearing(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  angle = (angle + 360) % 360;
  return Math.round(angle);
}

// Step vehicles forward in simulation
export function updateVehicles(
  vehicles: Vehicle[],
  lines: TransitLine[],
  trafficMultiplier: number = 1.0,
  deltaSeconds: number = 1.0
): Vehicle[] {
  const lineMap = new Map<string, TransitLine>();
  lines.forEach((l) => lineMap.set(l.id, l));

  return vehicles.map((v) => {
    const line = lineMap.get(v.lineId);
    if (!line || line.path.length < 2) return v;

    const path = line.path;
    const numSegments = path.length - 1;

    let {
      currentStopIndex,
      progressBetweenStops,
      isStopped,
      dwellSecondsRemaining,
      speedMph
    } = v;

    if (isStopped) {
      const remaining = dwellSecondsRemaining - deltaSeconds;
      if (remaining <= 0) {
        // Resume motion
        isStopped = false;
        dwellSecondsRemaining = 0;
        speedMph = 14;
      } else {
        return {
          ...v,
          isStopped: true,
          dwellSecondsRemaining: remaining,
          speedMph: 0,
          lastUpdated: Date.now()
        };
      }
    }

    const p1 = path[currentStopIndex];
    const nextIdx = (currentStopIndex + 1) % path.length;
    const p2 = path[nextIdx];

    const segmentDist = getDistance(p1, p2);
    // Speed in canvas units per second (scale: 1 mph ~ 0.45 units/sec)
    const baseSpeed = Math.max(12, speedMph) / trafficMultiplier;
    const unitsPerSec = baseSpeed * 0.4;
    const progressDelta = (unitsPerSec * deltaSeconds) / Math.max(10, segmentDist);

    let newProgress = progressBetweenStops + progressDelta;

    if (newProgress >= 1.0) {
      // Arrived at next waypoint / station
      const reachedIndex = nextIdx;
      // Loop back if at end of line or reverse
      let nextStop = reachedIndex;
      if (nextStop >= numSegments) {
        // Turn around / loop to start
        nextStop = 0;
      }

      // 50% chance of a 8-15s passenger dwell at this station
      const dwell = 10 + Math.floor(Math.random() * 8);

      const targetP = path[nextStop];
      return {
        ...v,
        currentStopIndex: nextStop,
        progressBetweenStops: 0,
        x: targetP.x,
        y: targetP.y,
        isStopped: true,
        dwellSecondsRemaining: dwell,
        speedMph: 0,
        lastUpdated: Date.now()
      };
    }

    // Interpolate current position
    const currentX = p1.x + (p2.x - p1.x) * newProgress;
    const currentY = p1.y + (p2.y - p1.y) * newProgress;
    const bearing = getBearing(p1, p2);

    // Realistic speed fluctuation
    let currentSpeed = 22 + Math.sin(Date.now() / 3000 + v.id.charCodeAt(3)) * 6;
    if (newProgress > 0.85) {
      // Decelerating into station
      currentSpeed = Math.max(6, currentSpeed * (1 - (newProgress - 0.85) * 4));
    }

    return {
      ...v,
      currentStopIndex,
      progressBetweenStops: newProgress,
      x: Math.round(currentX * 10) / 10,
      y: Math.round(currentY * 10) / 10,
      bearing,
      isStopped: false,
      dwellSecondsRemaining: 0,
      speedMph: Math.round(currentSpeed),
      lastUpdated: Date.now()
    };
  });
}

// Compute live predictions for a given stop
export function getArrivalPredictionsForStop(
  stop: TransitStop,
  lines: TransitLine[],
  vehicles: Vehicle[],
  simulatedDelayMinutes: number = 0
): ArrivalPrediction[] {
  const lineMap = new Map<string, TransitLine>();
  lines.forEach((l) => lineMap.set(l.id, l));

  const predictions: ArrivalPrediction[] = [];

  stop.lines.forEach((lineId) => {
    const line = lineMap.get(lineId);
    if (!line) return;

    const stopIdxInLine = line.stopIds.indexOf(stop.id);
    if (stopIdxInLine === -1) return;

    // Find vehicles on this line
    const lineVehicles = vehicles.filter((v) => v.lineId === lineId);

    if (lineVehicles.length > 0) {
      lineVehicles.forEach((v) => {
        // Calculate stops away
        let stopsAway = stopIdxInLine - v.currentStopIndex;
        if (stopsAway < 0) {
          stopsAway += line.stopIds.length;
        }

        // Distance estimate in seconds
        // Each stop is ~2.5 - 3 minutes (150 - 180s) away
        let estimatedSeconds = Math.max(15, stopsAway * 160 - Math.round(v.progressBetweenStops * 140));

        // Add delay if simulated
        const delay = simulatedDelayMinutes;
        estimatedSeconds += delay * 60;

        // Subsequent headways
        const headway1 = Math.round(line.peakFrequencyMin + (delay > 0 ? 3 : 0));
        const headway2 = Math.round(headway1 + line.peakFrequencyMin + 2);

        // Calculate schedule clock string (e.g. 14:32)
        const now = new Date();
        const schedDate = new Date(now.getTime() + (estimatedSeconds - delay * 60) * 1000);
        const hours = schedDate.getHours().toString().padStart(2, '0');
        const mins = schedDate.getMinutes().toString().padStart(2, '0');

        predictions.push({
          id: `${lineId}-${v.id}-${stop.id}`,
          lineId,
          vehicleId: v.id,
          destination: line.destination,
          scheduledTime: `${hours}:${mins}`,
          estimatedSecondsRemaining: estimatedSeconds,
          delayMinutes: delay,
          occupancy: v.occupancy,
          subsequentArrivals: [headway1, headway2],
          platform: line.mode === 'rail' ? 'Platform 1' : 'Curbside Bay A'
        });
      });
    } else {
      // Fallback synthetic arrival based on timetable frequency
      const freqSec = line.peakFrequencyMin * 60;
      const estimatedSeconds = Math.floor(Math.random() * 240) + 120;
      const now = new Date();
      const schedDate = new Date(now.getTime() + estimatedSeconds * 1000);
      const hours = schedDate.getHours().toString().padStart(2, '0');
      const mins = schedDate.getMinutes().toString().padStart(2, '0');

      predictions.push({
        id: `${lineId}-sched-${stop.id}`,
        lineId,
        vehicleId: `UNIT-${line.code}-01`,
        destination: line.destination,
        scheduledTime: `${hours}:${mins}`,
        estimatedSecondsRemaining: estimatedSeconds,
        delayMinutes: 0,
        occupancy: 'moderate',
        subsequentArrivals: [line.peakFrequencyMin, line.peakFrequencyMin * 2],
        platform: line.mode === 'rail' ? 'Track 2' : 'Shelter Bay B'
      });
    }
  });

  // Sort by earliest arrival
  return predictions.sort((a, b) => a.estimatedSecondsRemaining - b.estimatedSecondsRemaining);
}

// Format seconds into readable countdown string
export function formatCountdown(seconds: number): {
  display: string;
  isDue: boolean;
  unit: string;
} {
  if (seconds <= 45) {
    return { display: 'DUE', isDue: true, unit: 'ARRIVING' };
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 1) {
    return { display: `<1`, isDue: true, unit: 'MIN' };
  }
  return {
    display: `${mins}`,
    isDue: false,
    unit: secs < 10 ? `min:0${secs}` : `min:${secs}`
  };
}
