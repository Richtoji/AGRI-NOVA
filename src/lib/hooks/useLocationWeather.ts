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
  detectionPhase: 'detecting' | 'radius3km' | 'wholeMap';
}

const PINNED_FARM_KEY = 'agrinova_user_pinned_farm';

// Primary Agricultural Default: Kottayam, Kerala
export const DEFAULT_FARM = {
  lat: 9.5916,
  lng: 76.5222,
  name: 'Kottayam, Kerala',
};

let globalState: SharedLocationState = {
  coordinates: { lat: DEFAULT_FARM.lat, lng: DEFAULT_FARM.lng },
  detectedCoordinates: { lat: DEFAULT_FARM.lat, lng: DEFAULT_FARM.lng },
  detectedLocationName: DEFAULT_FARM.name,
  weatherData: null,
  loading: false,
  isDetecting: false,
  error: null,
  permissionState: 'prompt',
  accuracy: null,
  isOtherLocation: false,
  isPinnedByUser: true,
  detectionPhase: 'wholeMap',
};

const listeners = new Set<(state: SharedLocationState) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...globalState }));
}

function updateGlobalState(partial: Partial<SharedLocationState>) {
  globalState = { ...globalState, ...partial };
  notifyListeners();
}

let isDetectionActive = false;

// Fallback safe weather generator
function generateSafeFallbackWeather(lat: number, lng: number, placeName?: string): WeatherData {
  return {
    location: {
      name: placeName || 'Kottayam, Kerala',
      details: `Kottayam Agricultural District, Kerala, India`
    },
    current: {
      temperature: 29,
      feelsLike: 31,
      humidity: 74,
      windSpeed: 10,
      precipitation: 0,
      condition: 'Partly Cloudy',
      type: 'partly',
      rainProbability: 20
    },
    forecast: [
      { day: 'Today', date: new Date().toISOString(), hi: 32, lo: 24, pop: 20, type: 'partly', condition: 'Partly Cloudy' },
      { day: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString(), hi: 31, lo: 23, pop: 35, type: 'cloud', condition: 'Overcast' },
      { day: 'Day 3', date: new Date(Date.now() + 172800000).toISOString(), hi: 30, lo: 23, pop: 50, type: 'rain', condition: 'Scattered Showers' }
    ],
    warning: null,
    advisory: {
      type: 'GOOD',
      text: 'Optimal weather conditions for farm cultivation, irrigation, and field operations.'
    }
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
      error: err.message || 'Unable to load real-time weather telemetry.'
    });
  }
}

// Reverse geocode via server / Nominatim / BigDataCloud
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
    console.warn("Reverse geocode failed, using default name");
  }

  return `Farm Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
}

// Master detection and initialization - runs automatically without fail
async function detectLiveLocation(force = false) {
  if (isDetectionActive && !force) return;
  isDetectionActive = true;
  updateGlobalState({ isDetecting: true, error: null });

  // 1. First check if user previously pinned a verified farm location in localStorage
  let savedLocation = DEFAULT_FARM;
  if (typeof window !== 'undefined') {
    try {
      const pinnedStr = localStorage.getItem(PINNED_FARM_KEY);
      if (pinnedStr) {
        const pinned = JSON.parse(pinnedStr);
        if (pinned.lat && pinned.lng) {
          savedLocation = {
            lat: Number(pinned.lat),
            lng: Number(pinned.lng),
            name: pinned.name || DEFAULT_FARM.name
          };
        }
      }
    } catch (e) {}
  }

  // Ensure baseline location is active immediately so user never waits with blank UI
  updateGlobalState({
    coordinates: { lat: savedLocation.lat, lng: savedLocation.lng },
    detectedCoordinates: { lat: savedLocation.lat, lng: savedLocation.lng },
    detectedLocationName: savedLocation.name,
    isPinnedByUser: true,
    isOtherLocation: false,
    detectionPhase: 'radius3km',
  });

  fetchWeatherForCoordinates(savedLocation.lat, savedLocation.lng, savedLocation.name);

  // If browser geolocation is not supported, attempt IP fallback immediately
  if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
    await attemptIpLocationFallback(savedLocation);
    isDetectionActive = false;
    updateGlobalState({ isDetecting: false, loading: false });
    return;
  }

  // Tier 1: High-Accuracy GPS (Hardware satellites / Mobile GPS)
  const runHighAccuracyGps = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: force ? 0 : 30000,
      });
    });
  };

  // Tier 2: Low-Accuracy Wi-Fi / Cell tower triangulation (Desktop / Laptop)
  const runLowAccuracyGps = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 60000,
      });
    });
  };

  try {
    let position: GeolocationPosition;
    try {
      position = await runHighAccuracyGps();
    } catch (highErr: any) {
      if (highErr?.code === 1) {
        // Permission denied by user
        updateGlobalState({ permissionState: 'denied', isDetecting: false, loading: false });
        isDetectionActive = false;
        return;
      }
      // High accuracy timed out or unavailable; try low-accuracy fallback
      console.warn("High-precision GPS timed out or unavailable, trying network geolocation...", highErr?.message);
      position = await runLowAccuracyGps();
    }

    const { latitude, longitude, accuracy } = position.coords;
    const accMeters = Math.round(accuracy);

    updateGlobalState({
      permissionState: 'granted',
      accuracy: accMeters,
    });

    // Reverse geocode to get exact town, village, or district name
    const placeName = await reverseGeocodeCoordinates(latitude, longitude);

    try {
      localStorage.setItem(PINNED_FARM_KEY, JSON.stringify({
        lat: latitude,
        lng: longitude,
        name: placeName,
        accuracy: accMeters
      }));
    } catch (e) {}

    updateGlobalState({
      coordinates: { lat: latitude, lng: longitude },
      detectedCoordinates: { lat: latitude, lng: longitude },
      detectedLocationName: placeName,
      isOtherLocation: false,
      isPinnedByUser: true,
      isDetecting: false,
      loading: false,
      detectionPhase: 'radius3km',
      error: null,
    });

    fetchWeatherForCoordinates(latitude, longitude, placeName);
    isDetectionActive = false;
  } catch (geoError: any) {
    console.warn("Browser GPS failed. Executing automatic network IP fallback...", geoError);
    if (geoError?.code === 1) {
      updateGlobalState({ permissionState: 'denied' });
    }
    await attemptIpLocationFallback(savedLocation);
    isDetectionActive = false;
  }
}

// Tier 3: Network IP Geolocation Fallback
async function attemptIpLocationFallback(fallbackAnchor = DEFAULT_FARM) {
  try {
    // Try BigDataCloud Client IP Reverse Geocode
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      signal: AbortSignal.timeout(4500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const lat = Number(data.latitude);
        const lng = Number(data.longitude);
        const locality = data.locality || data.city || data.principalSubdivision || 'Local Area';
        const state = data.principalSubdivision || 'Kerala';
        const placeName = locality !== state ? `${locality}, ${state}` : locality;

        updateGlobalState({
          coordinates: { lat, lng },
          detectedCoordinates: { lat, lng },
          detectedLocationName: placeName,
          isOtherLocation: false,
          isPinnedByUser: true,
          isDetecting: false,
          loading: false,
          accuracy: 5000,
          detectionPhase: 'radius3km',
          error: null,
        });

        fetchWeatherForCoordinates(lat, lng, placeName);
        return;
      }
    }
  } catch (e) {
    console.warn("Client IP lookup failed:", e);
  }

  // Tier 4: Guaranteed Anchor (Kottayam, Kerala)
  updateGlobalState({
    coordinates: { lat: fallbackAnchor.lat, lng: fallbackAnchor.lng },
    detectedCoordinates: { lat: fallbackAnchor.lat, lng: fallbackAnchor.lng },
    detectedLocationName: fallbackAnchor.name,
    isOtherLocation: false,
    isPinnedByUser: true,
    isDetecting: false,
    loading: false,
    detectionPhase: 'radius3km',
    error: null,
  });

  fetchWeatherForCoordinates(fallbackAnchor.lat, fallbackAnchor.lng, fallbackAnchor.name);
}

export function useLocationWeather() {
  const [state, setState] = useState<SharedLocationState>(globalState);

  useEffect(() => {
    const listener = (newState: SharedLocationState) => {
      setState(newState);
    };
    listeners.add(listener);

    // Automatically trigger live high-precision detection on mount
    detectLiveLocation(false);

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

    try {
      localStorage.setItem(PINNED_FARM_KEY, JSON.stringify({ lat, lng, name: resolvedName }));
    } catch (e) {}

    updateGlobalState({
      coordinates: { lat, lng },
      detectedCoordinates: { lat, lng },
      detectedLocationName: resolvedName,
      isOtherLocation: false,
      isPinnedByUser: true,
      loading: true,
      isDetecting: false,
      detectionPhase: 'radius3km',
    });

    fetchWeatherForCoordinates(lat, lng, resolvedName);
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
      localStorage.setItem(PINNED_FARM_KEY, JSON.stringify({ lat, lng, name: resolvedName }));
    } catch (e) {}

    updateGlobalState({
      coordinates: { lat, lng },
      isOtherLocation: isOther,
      isPinnedByUser: true,
      loading: true,
      detectionPhase: 'radius3km',
    });

    fetchWeatherForCoordinates(lat, lng, resolvedName);
  }, []);

  // Reset back to detected/pinned farm location
  const resetToDetected = useCallback(() => {
    if (globalState.detectedCoordinates) {
      updateGlobalState({
        coordinates: { ...globalState.detectedCoordinates },
        isOtherLocation: false,
        loading: true,
        detectionPhase: 'radius3km',
      });

      fetchWeatherForCoordinates(
        globalState.detectedCoordinates.lat,
        globalState.detectedCoordinates.lng,
        globalState.detectedLocationName || undefined
      );
    } else {
      detectLiveLocation(true);
    }
  }, []);

  // Force re-detect GPS location
  const refresh = useCallback(() => {
    detectLiveLocation(true);
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
    detectionPhase: state.detectionPhase,
    refresh,
    resetToDetected,
    setLocationManually,
    pinFarmLocation,
  };
}
