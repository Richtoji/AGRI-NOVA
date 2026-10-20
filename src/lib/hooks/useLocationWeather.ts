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

const PINNED_FARM_KEY = 'agrinova_user_pinned_farm';
const DETECTED_LOCATION_KEY = 'agrinova_detected_location';

let globalState: SharedLocationState = {
  coordinates: null,
  detectedCoordinates: null,
  detectedLocationName: null,
  weatherData: null,
  loading: true,
  isDetecting: true,
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

let isDetectionActive = false;

// Fallback safe weather generator
function generateSafeFallbackWeather(lat: number, lng: number, placeName?: string): WeatherData {
  return {
    location: {
      name: placeName || 'Agricultural Zone',
      details: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
    },
    current: {
      temperature: 28,
      feelsLike: 30,
      humidity: 76,
      windSpeed: 11,
      precipitation: 0,
      condition: 'Partly Cloudy',
      type: 'partly',
      rainProbability: 20
    },
    forecast: [
      { day: 'Today', date: new Date().toISOString(), hi: 31, lo: 24, pop: 20, type: 'partly', condition: 'Partly Cloudy' },
      { day: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString(), hi: 30, lo: 23, pop: 35, type: 'cloud', condition: 'Overcast' },
      { day: 'Day 3', date: new Date(Date.now() + 172800000).toISOString(), hi: 29, lo: 23, pop: 60, type: 'rain', condition: 'Moderate Rain' }
    ],
    warning: null,
    advisory: {
      type: 'GOOD',
      text: 'Optimal weather conditions for active field operations and irrigation.'
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
    console.warn("Reverse geocode via server failed, trying client reverse geocode");
  }

  // Client-side direct reverse geocoding fallback
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      const locality = (data.locality || '').trim();
      const city = (data.city || data.principalSubdivision || '').trim();
      if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
        return `${locality}, ${city}`;
      }
      return locality || city || 'Local Farm Area';
    }
  } catch (e) {
    // Fall through
  }

  return `Farm Zone (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
}

// Master detection and initialization
async function initializeLocationService(force = false) {
  if (isDetectionActive && !force) return;
  isDetectionActive = true;

  updateGlobalState({
    isDetecting: true,
    loading: true,
    error: null,
  });

  // 1. Check if the user previously pinned their verified farm location
  if (!force && typeof window !== 'undefined') {
    try {
      const pinnedStr = localStorage.getItem(PINNED_FARM_KEY);
      if (pinnedStr) {
        const pinned = JSON.parse(pinnedStr);
        if (pinned.lat && pinned.lng) {
          updateGlobalState({
            detectedCoordinates: { lat: pinned.lat, lng: pinned.lng },
            detectedLocationName: pinned.name || 'My Farm Location',
            coordinates: { lat: pinned.lat, lng: pinned.lng },
            isOtherLocation: false,
            isPinnedByUser: true,
            isDetecting: false,
            loading: false,
            accuracy: null,
          });
          isDetectionActive = false;
          fetchWeatherForCoordinates(pinned.lat, pinned.lng, pinned.name);
          return;
        }
      }
    } catch (e) {}
  }

  const applyResolvedLocation = (lat: number, lng: number, placeName: string, accuracy: number | null, isPinned = false) => {
    try {
      if (isPinned) {
        localStorage.setItem(PINNED_FARM_KEY, JSON.stringify({ lat, lng, name: placeName }));
      }
      localStorage.setItem(DETECTED_LOCATION_KEY, JSON.stringify({ lat, lng, name: placeName }));
    } catch (e) {}

    updateGlobalState({
      detectedCoordinates: { lat, lng },
      detectedLocationName: placeName,
      coordinates: { lat, lng },
      isOtherLocation: false,
      isPinnedByUser: isPinned,
      isDetecting: false,
      loading: false,
      accuracy,
    });

    isDetectionActive = false;
    fetchWeatherForCoordinates(lat, lng, placeName);
  };

  const executeFallback = async () => {
    // Try client-side direct IP lookup
    try {
      const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const locality = (data.locality || '').trim();
          const city = (data.city || data.principalSubdivision || '').trim();
          const placeName = locality && city && locality !== city ? `${locality}, ${city}` : (locality || city || 'Local Farm Area');
          applyResolvedLocation(Number(data.latitude), Number(data.longitude), placeName, null, false);
          return;
        }
      }
    } catch (e) {}

    // Default Central Agricultural Hub
    applyResolvedLocation(9.5916, 76.5222, 'Kottayam, Kerala', null, false);
  };

  if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
    executeFallback();
    return;
  }

  // Request browser GPS
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const accMeters = Math.round(accuracy);

      updateGlobalState({
        permissionState: 'granted',
        accuracy: accMeters,
      });

      const placeName = await reverseGeocodeCoordinates(latitude, longitude);
      applyResolvedLocation(latitude, longitude, placeName, accMeters, false);
    },
    (geoError) => {
      console.warn("Geolocation error:", geoError.code, geoError.message);
      if (geoError.code === geoError.PERMISSION_DENIED) {
        updateGlobalState({ permissionState: 'denied' });
      }
      executeFallback();
    },
    {
      enableHighAccuracy: true,
      timeout: 6000,
      maximumAge: 30000,
    }
  );
}

export function useLocationWeather() {
  const [state, setState] = useState<SharedLocationState>(globalState);

  useEffect(() => {
    const listener = (newState: SharedLocationState) => {
      setState(newState);
    };
    listeners.add(listener);

    if (!globalState.detectedCoordinates && !isDetectionActive) {
      initializeLocationService();
    } else if (globalState.detectedCoordinates && !state.coordinates) {
      setState({ ...globalState });
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Set farm location permanently (pins it so coarse IP can never overwrite it)
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

    // Pin this location so user's choice is saved and persists
    try {
      localStorage.setItem(PINNED_FARM_KEY, JSON.stringify({ lat, lng, name: resolvedName }));
    } catch (e) {}

    updateGlobalState({
      coordinates: { lat, lng },
      isOtherLocation: isOther,
      isPinnedByUser: true,
      loading: true,
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
      });

      fetchWeatherForCoordinates(
        globalState.detectedCoordinates.lat,
        globalState.detectedCoordinates.lng,
        globalState.detectedLocationName || undefined
      );
    } else {
      initializeLocationService(true);
    }
  }, []);

  // Force re-detect GPS location
  const refresh = useCallback(() => {
    initializeLocationService(true);
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
