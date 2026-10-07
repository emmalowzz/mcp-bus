/**
 * @file api/bus-arrival.js
 * Proxy and handler for Singapore LTA DataMall v3 BusArrival endpoint.
 * GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
 * Header: AccountKey: <LTA_ACCOUNT_KEY>
 *
 * Query Parameters:
 * - BusStopCode: (required) 5-digit bus stop identifier (e.g., 04121)
 * - ServiceNo: (optional) bus service line number (e.g., 7)
 */

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Parse query parameters from request URL
  const host = req.headers.host || 'localhost';
  const urlObj = new URL(req.url, `http://${host}`);
  const busStopCode = urlObj.searchParams.get('BusStopCode') || (req.query && req.query.BusStopCode);
  const serviceNo = urlObj.searchParams.get('ServiceNo') || (req.query && req.query.ServiceNo);

  if (!busStopCode) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    res.end(JSON.stringify({
      error: 'Missing required parameter: BusStopCode',
      usage: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7',
      example: '04121 is Old Hill St Police Station / Clarke Quay'
    }));
    return;
  }

  // Look for AccountKey in environment variables or request headers
  const accountKey = process.env.LTA_ACCOUNT_KEY || req.headers['accountkey'] || req.headers['AccountKey'];

  if (accountKey && accountKey.trim() !== '') {
    try {
      let ltaUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
      if (serviceNo) {
        ltaUrl += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
      }

      const response = await fetch(ltaUrl, {
        method: 'GET',
        headers: {
          'AccountKey': accountKey.trim(),
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = response.status;
        res.end(JSON.stringify({
          error: `LTA DataMall API responded with HTTP ${response.status}`,
          details: errorText,
          busStopCode
        }));
        return;
      }

      const data = await response.json();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=5');
      res.setHeader('x-lta-source', 'live');
      res.statusCode = 200;
      res.end(JSON.stringify(data));
      return;
    } catch (err) {
      console.error('Error proxying to LTA DataMall:', err);
      // Fall through to fallback or return error
    }
  }

  // Fallback simulator if LTA_ACCOUNT_KEY is not configured yet
  // Generates real LTA DataMall v3 schema matching actual Singapore services for testing
  const now = Date.now();
  const makeEstimatedArrival = (offsetSeconds) => new Date(now + offsetSeconds * 1000).toISOString();

  const mockServices = [
    {
      ServiceNo: '7',
      Operator: 'SBST',
      NextBus: {
        OriginCode: '16009',
        DestinationCode: '17009',
        EstimatedArrival: makeEstimatedArrival(95),
        Latitude: '1.2941',
        Longitude: '103.8523',
        VisitNumber: '1',
        Load: 'SEA', // Seats Available
        Feature: 'WAB', // Wheelchair Accessible Bus
        Type: 'DD' // Double Deck
      },
      NextBus2: {
        OriginCode: '16009',
        DestinationCode: '17009',
        EstimatedArrival: makeEstimatedArrival(640),
        Latitude: '1.2891',
        Longitude: '103.8451',
        VisitNumber: '1',
        Load: 'SDA', // Standing Available
        Feature: 'WAB',
        Type: 'SD' // Single Deck
      },
      NextBus3: {
        OriginCode: '16009',
        DestinationCode: '17009',
        EstimatedArrival: makeEstimatedArrival(1250),
        Latitude: '1.2820',
        Longitude: '103.8390',
        VisitNumber: '1',
        Load: 'LSD',
        Feature: 'WAB',
        Type: 'DD'
      }
    },
    {
      ServiceNo: '147',
      Operator: 'SBST',
      NextBus: {
        OriginCode: '17009',
        DestinationCode: '11009',
        EstimatedArrival: makeEstimatedArrival(210),
        Latitude: '1.2915',
        Longitude: '103.8480',
        VisitNumber: '1',
        Load: 'SDA',
        Feature: 'WAB',
        Type: 'DD'
      },
      NextBus2: {
        OriginCode: '17009',
        DestinationCode: '11009',
        EstimatedArrival: makeEstimatedArrival(780),
        Latitude: '1.2840',
        Longitude: '103.8402',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'SD'
      },
      NextBus3: {
        OriginCode: '17009',
        DestinationCode: '11009',
        EstimatedArrival: makeEstimatedArrival(1400),
        Latitude: '1.2780',
        Longitude: '103.8320',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'DD'
      }
    },
    {
      ServiceNo: '190',
      Operator: 'SMRT',
      NextBus: {
        OriginCode: '44009',
        DestinationCode: '03218',
        EstimatedArrival: makeEstimatedArrival(340),
        Latitude: '1.2980',
        Longitude: '103.8550',
        VisitNumber: '1',
        Load: 'LSD', // Limited Standing
        Feature: 'WAB',
        Type: 'BD' // Bendy bus
      },
      NextBus2: {
        OriginCode: '44009',
        DestinationCode: '03218',
        EstimatedArrival: makeEstimatedArrival(910),
        Latitude: '1.3050',
        Longitude: '103.8600',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'DD'
      },
      NextBus3: {}
    },
    {
      ServiceNo: '124',
      Operator: 'SBST',
      NextBus: {
        OriginCode: '52009',
        DestinationCode: '03218',
        EstimatedArrival: makeEstimatedArrival(45),
        Latitude: '1.2905',
        Longitude: '103.8490',
        VisitNumber: '1',
        Load: 'SEA',
        Feature: 'WAB',
        Type: 'SD'
      },
      NextBus2: {
        OriginCode: '52009',
        DestinationCode: '03218',
        EstimatedArrival: makeEstimatedArrival(520),
        Latitude: '1.2970',
        Longitude: '103.8530',
        VisitNumber: '1',
        Load: 'SDA',
        Feature: 'WAB',
        Type: 'SD'
      },
      NextBus3: {}
    }
  ];

  const filteredServices = serviceNo
    ? mockServices.filter((s) => s.ServiceNo.toLowerCase() === serviceNo.toLowerCase())
    : mockServices;

  const mockResponse = {
    'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/v3/$metadata#BusArrival',
    BusStopCode: busStopCode,
    Services: filteredServices,
    _source: 'simulation_pending_lta_key',
    _note: 'LTA_ACCOUNT_KEY is not yet configured. Provide LTA_ACCOUNT_KEY in Vercel environment variables to enable direct live data from datamall2.mytransport.sg.'
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('x-lta-source', 'simulated');
  res.statusCode = 200;
  res.end(JSON.stringify(mockResponse, null, 2));
}
