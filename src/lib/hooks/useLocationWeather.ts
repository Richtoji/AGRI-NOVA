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

// Master detection and initialization
async function initializeLocationService(force = false) {
  if (isDetectionActive && !force) return;
  isDetectionActive = true;

  // 1. First check if user previously pinned their verified farm location
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
            name: pinned.name || 'Kottayam, Kerala'
          };
        }
      }
    } catch (e) {}
  }

  // Set the guaranteed baseline location immediately so UI is never stuck
  updateGlobalState({
    coordinates: { lat: savedLocation.lat, lng: savedLocation.lng },
    detectedCoordinates: { lat: savedLocation.lat, lng: savedLocation.lng },
    detectedLocationName: savedLocation.name,
    isPinnedByUser: true,
    isOtherLocation: false,
    isDetecting: force,
  });

  fetchWeatherForCoordinates(savedLocation.lat, savedLocation.lng, savedLocation.name);

  // If not forced detection, keep the saved verified farm location
  if (!force) {
    isDetectionActive = false;
    return;
  }

  // If user clicked "Detect", check browser GPS
  if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
    isDetectionActive = false;
    updateGlobalState({ isDetecting: false });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const accMeters = Math.round(accuracy);

      updateGlobalState({
        permissionState: 'granted',
        accuracy: accMeters,
      });

      // Only accept if accuracy is within reasonable farm GPS bounds (< 3000m)
      // On desktop broadband without hardware GPS, accuracy is 25,000m-50,000m (ISP center).
      // We do NOT override the user's farm if it's just a coarse ISP estimate!
      if (accMeters <= 3000) {
        const placeName = await reverseGeocodeCoordinates(latitude, longitude);

        try {
          localStorage.setItem(PINNED_FARM_KEY, JSON.stringify({ lat: latitude, lng: longitude, name: placeName }));
        } catch (e) {}

        updateGlobalState({
          detectedCoordinates: { lat: latitude, lng: longitude },
          detectedLocationName: placeName,
          coordinates: { lat: latitude, lng: longitude },
          isOtherLocation: false,
          isPinnedByUser: true,
          isDetecting: false,
          loading: false,
        });

        fetchWeatherForCoordinates(latitude, longitude, placeName);
      } else {
        // Coarse estimate detected; inform user but keep their verified farm intact
        console.warn(`Browser GPS returned coarse accuracy (±${accMeters}m). Keeping farm location.`);
        updateGlobalState({ isDetecting: false, loading: false });
      }

      isDetectionActive = false;
    },
    (geoError) => {
      console.warn("Geolocation error code:", geoError.code, geoError.message);
      if (geoError.code === geoError.PERMISSION_DENIED) {
        updateGlobalState({ permissionState: 'denied' });
      }
      isDetectionActive = false;
      updateGlobalState({ isDetecting: false, loading: false });
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

    // Initial check on mount
    initializeLocationService(false);

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
