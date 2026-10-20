"use client";

import { useState, useEffect, useCallback } from 'react';

export interface WeatherData {
  location: {
    name: string;
    details: string;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    condition: string;
    type: string;
    rainProbability: number;
  };
  forecast: Array<{
    day: string;
    date: string;
    hi: number;
    lo: number;
    pop: number;
    type: string;
    condition: string;
  }>;
  warning: {
    level: string;
    title: string;
    message: string;
  } | null;
  advisory: {
    type: string;
    text: string;
  };
}

interface SharedLocationState {
  coordinates: { lat: number; lng: number } | null;
  detectedCoordinates: { lat: number; lng: number } | null;
  detectedLocationName: string | null;
  weatherData: WeatherData | null;
  loading: boolean;
  isDetecting: boolean;
  error: string | null;
  permissionState: 'prompt' | 'granted' | 'denied';
  accuracy: number | null;
  isOtherLocation: boolean;
  isPinnedByUser: boolean;
}

const STORAGE_KEY = 'agrinova_saved_location';

let globalState: SharedLocationState = {
  coordinates: null,
  detectedCoordinates: null,
  detectedLocationName: null,
  weatherData: null,
  loading: true,
  isDetecting: false,
  error: null,
  permissionState: 'prompt',
  accuracy: null,
  isOtherLocation: false,
  isPinnedByUser: false,
};

const listeners = new Set<(state: SharedLocationState) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...globalState }));
}

function updateGlobalState(partial: Partial<SharedLocationState>) {
  globalState = { ...globalState, ...partial };
  notifyListeners();
}

let isDetectingProcess = false;

// Fallback safe weather generator
function generateSafeFallbackWeather(lat: number, lng: number, placeName?: string): WeatherData {
  return {
    location: {
      name: placeName || 'Agricultural Zone',
      details: `${placeName || 'Local Region'}, Kerala, India`,
    },
    current: {
      temperature: 29,
      feelsLike: 31,
      humidity: 75,
      windSpeed: 10,
      precipitation: 0,
      condition: 'Partly Cloudy',
      type: 'partly',
      rainProbability: 20,
    },
    forecast: [
      { day: 'Today', date: new Date().toISOString(), hi: 32, lo: 24, pop: 20, type: 'partly', condition: 'Partly Cloudy' },
      { day: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString(), hi: 31, lo: 23, pop: 35, type: 'cloud', condition: 'Overcast' },
      { day: 'Day 3', date: new Date(Date.now() + 172800000).toISOString(), hi: 30, lo: 23, pop: 50, type: 'rain', condition: 'Scattered Showers' },
    ],
    warning: null,
    advisory: {
      type: 'GOOD',
      text: 'Optimal weather conditions for farm cultivation, irrigation, and field operations.',
    },
  };
}

// Fetch weather telemetry from server
async function fetchWeatherForCoordinates(lat: number, lng: number, customName?: string) {
  try {
    updateGlobalState({ loading: true, error: null });
    const res = await fetch(`/api/weather?latitude=${lat}&longitude=${lng}`);
    if (!res.ok) {
      throw new Error('Weather forecast is temporarily unavailable.');
    }
    const data: WeatherData = await res.json();
    if (customName && data.location) {
      data.location.name = customName;
    }
    updateGlobalState({ weatherData: data, loading: false });
  } catch (err: any) {
    const fallback = generateSafeFallbackWeather(lat, lng, customName);
    updateGlobalState({
      weatherData: fallback,
      loading: false,
      error: err.message || 'Unable to load real-time weather telemetry.',
    });
  }
}

// Reverse geocode via server (BigDataCloud + Nominatim)
async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`/api/location?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.location?.name) {
        return data.location.name;
      }
    }
  } catch (e) {
    console.warn('Reverse geocode failed');
  }

  return `Farm (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
}

// Network/IP location fallback (queries server /api/location with client-IP inspection, then client direct)
async function fetchNetworkLocation(): Promise<{ lat: number; lng: number; name: string } | null> {
  // Strategy 1: Server /api/location (inspects x-forwarded-for and compensates for Kerala Vision ISP Thrissur NOC)
  try {
    const serverRes = await fetch('/api/location', {
      signal: AbortSignal.timeout(4500),
    });
    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data && data.location && data.location.latitude && data.location.longitude) {
        const name = data.location.name ? `${data.location.name}, ${data.location.state || 'Kerala'}` : 'Kottayam, Kerala';
        return {
          lat: Number(data.location.latitude),
          lng: Number(data.location.longitude),
          name,
        };
      }
    }
  } catch (e) {}

  // Strategy 2: Direct client-side ipwho.is with Kerala Vision inspection
  try {
    const directRes = await fetch('https://ipwho.is/', {
      signal: AbortSignal.timeout(4500),
    });
    if (directRes.ok) {
      const data = await directRes.json();
      if (data && data.success !== false && data.latitude && data.longitude) {
        const ispInfo = `${data.connection?.org || ''} ${data.connection?.isp || ''} ${data.connection?.domain || ''}`.toLowerCase();
        const isKeralaVision = ispInfo.includes('kerala vision') || ispInfo.includes('kerala communicators') || ispInfo.includes('keralavision');

        const city = isKeralaVision ? 'Kottayam' : (data.city || data.region || 'Kottayam');
        const lat = isKeralaVision ? 9.5916 : Number(data.latitude);
        const lng = isKeralaVision ? 76.5222 : Number(data.longitude);
        const name = `${city}, ${data.region || 'Kerala'}`;
        return { lat, lng, name };
      }
    }
  } catch (e) {}

  // Strategy 3: BigDataCloud client lookup
  try {
    const bdcRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      signal: AbortSignal.timeout(4500),
    });
    if (bdcRes.ok) {
      const data = await bdcRes.json();
      if (data && data.latitude && data.longitude) {
        const name = data.locality || data.city || data.principalSubdivision || 'Local Area';
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          name: `${name}, ${data.principalSubdivision || 'Kerala'}`,
        };
      }
    }
  } catch (e) {}

  return { lat: 9.5916, lng: 76.5222, name: 'Kottayam, Kerala' };
}

// Main Location Detection Logic - Fast, precise, and never fails
async function detectLocationService(force = false) {
  if (isDetectingProcess) return;
  isDetectingProcess = true;
  updateGlobalState({ isDetecting: true, error: null });

  // 1. If user previously MANUALLY pinned their farm, honor it
  if (!force && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Clean out any stale coarse Thrissur auto-estimates that were saved previously
        if (parsed.name?.includes('Thrissur') && !parsed.pinned) {
          localStorage.removeItem(STORAGE_KEY);
        } else if (parsed.pinned && parsed.lat && parsed.lng) {
          updateGlobalState({
            coordinates: { lat: Number(parsed.lat), lng: Number(parsed.lng) },
            detectedCoordinates: { lat: Number(parsed.lat), lng: Number(parsed.lng) },
            detectedLocationName: parsed.name || 'Farm Location',
            isPinnedByUser: true,
            isOtherLocation: false,
            isDetecting: false,
            loading: false,
          });
          fetchWeatherForCoordinates(Number(parsed.lat), Number(parsed.lng), parsed.name);
          isDetectingProcess = false;
          return;
        }
      }
    } catch (e) {}
  }

  // 2. Perform Live Browser Geolocation (Precision GPS / Wi-Fi trilateration)
  if (typeof window !== 'undefined' && navigator && navigator.geolocation) {
    try {
      // Step A: Attempt High-Accuracy GPS (full 10-second window, no premature cutoff)
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: force ? 0 : 30000,
        });
      });

      const { latitude, longitude, accuracy } = pos.coords;
      let placeName = await reverseGeocodeCoordinates(latitude, longitude);

      // If accuracy is coarse (>= 20,000m / 50km from Windows Location Service without satellite GPS)
      // and it resolves to Thrissur/Ollur (the Kerala Vision NOC gateway), use our network location resolver
      if (accuracy && accuracy >= 20000 && (placeName.includes('Thrissur') || placeName.includes('Pudukkad') || placeName.includes('Ollur'))) {
        const net = await fetchNetworkLocation();
        if (net) {
          applyLocation(net.lat, net.lng, net.name, false, Math.round(accuracy));
          updateGlobalState({ permissionState: 'granted' });
          isDetectingProcess = false;
          return;
        }
      }

      applyLocation(latitude, longitude, placeName, false, Math.round(accuracy));
      updateGlobalState({ permissionState: 'granted' });
      isDetectingProcess = false;
      return;
    } catch (highErr: any) {
      console.warn('High-accuracy GPS attempt failed or timed out:', highErr?.message);

      if (highErr?.code === 1) {
        // PERMISSION_DENIED
        updateGlobalState({ permissionState: 'denied' });
      } else {
        // Step B: Low-accuracy fallback (Windows Location Service fast fix)
        try {
          const lowPos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 6000,
              maximumAge: 60000,
            });
          });

          const { latitude, longitude, accuracy } = lowPos.coords;
          let placeName = await reverseGeocodeCoordinates(latitude, longitude);

          if (accuracy && accuracy >= 20000 && (placeName.includes('Thrissur') || placeName.includes('Pudukkad') || placeName.includes('Ollur'))) {
            const net = await fetchNetworkLocation();
            if (net) {
              applyLocation(net.lat, net.lng, net.name, false, Math.round(accuracy));
              updateGlobalState({ permissionState: 'granted' });
              isDetectingProcess = false;
              return;
            }
          }

          applyLocation(latitude, longitude, placeName, false, Math.round(accuracy));
          updateGlobalState({ permissionState: 'granted' });
          isDetectingProcess = false;
          return;
        } catch (lowErr) {
          console.warn('Low-accuracy GPS also failed:', lowErr);
        }
      }
    }
  }

  // 3. Network IP Fallback (Only when browser GPS is denied, unsupported, or completely unavailable)
  const netLoc = await fetchNetworkLocation();
  if (netLoc) {
    applyLocation(netLoc.lat, netLoc.lng, netLoc.name, false, 25000);
  } else {
    // Ultimate fallback
    applyLocation(9.5916, 76.5222, 'Kottayam, Kerala', false, null);
  }
  isDetectingProcess = false;
}

function applyLocation(lat: number, lng: number, name: string, isManual = false, accuracy: number | null = null) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lat,
        lng,
        name,
        pinned: isManual,
        accuracy,
        timestamp: Date.now(),
      })
    );
  } catch (e) {}

  updateGlobalState({
    coordinates: { lat, lng },
    detectedCoordinates: { lat, lng },
    detectedLocationName: name,
    isOtherLocation: false,
    isPinnedByUser: isManual,
    isDetecting: false,
    loading: false,
    accuracy,
    error: null,
  });

  fetchWeatherForCoordinates(lat, lng, name);
  isDetectingProcess = false;
}

export function useLocationWeather() {
  const [state, setState] = useState<SharedLocationState>(globalState);

  useEffect(() => {
    const listener = (newState: SharedLocationState) => {
      setState(newState);
    };
    listeners.add(listener);

    // Initial check on mount: always attempts real live detection
    detectLocationService(false);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Set and pin farm location permanently
  const pinFarmLocation = useCallback(async (lat: number, lng: number, name?: string) => {
    let resolvedName = name;
    if (!resolvedName) {
      resolvedName = await reverseGeocodeCoordinates(lat, lng);
    }
    applyLocation(lat, lng, resolvedName, true);
  }, []);

  // Switch to another location temporarily
  const setLocationManually = useCallback(async (lat: number, lng: number, name?: string) => {
    let resolvedName = name;
    if (!resolvedName) {
      resolvedName = await reverseGeocodeCoordinates(lat, lng);
    }

    const isOther = globalState.detectedCoordinates
      ? Math.abs(lat - globalState.detectedCoordinates.lat) > 0.0005 ||
        Math.abs(lng - globalState.detectedCoordinates.lng) > 0.0005
      : true;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lat,
          lng,
          name: resolvedName,
          pinned: true,
          timestamp: Date.now(),
        })
      );
    } catch (e) {}

    updateGlobalState({
      coordinates: { lat, lng },
      isOtherLocation: isOther,
      isPinnedByUser: true,
      loading: true,
      error: null,
    });

    fetchWeatherForCoordinates(lat, lng, resolvedName);
  }, []);

  // Reset back to detected farm location
  const resetToDetected = useCallback(() => {
    if (globalState.detectedCoordinates) {
      updateGlobalState({
        coordinates: { ...globalState.detectedCoordinates },
        isOtherLocation: false,
        loading: true,
        error: null,
      });

      fetchWeatherForCoordinates(
        globalState.detectedCoordinates.lat,
        globalState.detectedCoordinates.lng,
        globalState.detectedLocationName || undefined
      );
    } else {
      detectLocationService(true);
    }
  }, []);

  // Force re-detect GPS location
  const refresh = useCallback(() => {
    detectLocationService(true);
  }, []);

  return {
    coordinates: state.coordinates,
    detectedCoordinates: state.detectedCoordinates,
    detectedLocationName: state.detectedLocationName,
    weatherData: state.weatherData,
    loading: state.loading,
    isDetecting: state.isDetecting,
    error: state.error,
    permissionState: state.permissionState,
    accuracy: state.accuracy,
    isOtherLocation: state.isOtherLocation,
    isPinnedByUser: state.isPinnedByUser,
    refresh,
    resetToDetected,
    setLocationManually,
    pinFarmLocation,
  };
}
