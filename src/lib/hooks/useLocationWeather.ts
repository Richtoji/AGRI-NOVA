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

// Primary Agricultural Anchor: Kottayam, Kerala
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

// Distance calculator using Haversine formula (km)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fallback safe weather generator
function generateSafeFallbackWeather(lat: number, lng: number, placeName?: string): WeatherData {
  return {
    location: {
      name: placeName || DEFAULT_FARM.name,
      details: `${placeName || 'Kottayam'}, Kerala, India`,
    },
    current: {
      temperature: 29,
      feelsLike: 31,
      humidity: 74,
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
    console.warn('Reverse geocode failed, using default name');
  }

  return `Farm Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
}

// Read saved location or initialize with verified default (Kottayam)
function getVerifiedFarmLocation() {
  if (typeof window !== 'undefined') {
    try {
      const pinnedStr = localStorage.getItem(PINNED_FARM_KEY);
      if (pinnedStr) {
        const pinned = JSON.parse(pinnedStr);
        // If previously saved an inaccurate ISP estimate (Chalakudy/Thrissur/Kochi), clean it
        const isSuspiciousIsp =
          pinned.name?.toLowerCase().includes('chalakudy') ||
          (pinned.accuracy && Number(pinned.accuracy) > 2000 && getDistanceKm(pinned.lat, pinned.lng, DEFAULT_FARM.lat, DEFAULT_FARM.lng) > 25);

        if (!isSuspiciousIsp && pinned.lat && pinned.lng) {
          return {
            lat: Number(pinned.lat),
            lng: Number(pinned.lng),
            name: pinned.name || DEFAULT_FARM.name,
          };
        } else if (isSuspiciousIsp) {
          localStorage.removeItem(PINNED_FARM_KEY);
        }
      }
    } catch (e) {}
  }

  return DEFAULT_FARM;
}

// Live GPS detection - only executed when requested by user or verified
async function detectLiveLocation(force = true) {
  if (isDetectionActive) return;
  isDetectionActive = true;
  updateGlobalState({ isDetecting: true, error: null });

  if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
    updateGlobalState({
      isDetecting: false,
      error: 'Geolocation is not supported by your browser.',
    });
    isDetectionActive = false;
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

      // Check if this is a genuine mobile GPS fix (<= 1500m) or an inaccurate ISP estimate (> 1500m)
      if (accMeters <= 1500) {
        const placeName = await reverseGeocodeCoordinates(latitude, longitude);

        try {
          localStorage.setItem(
            PINNED_FARM_KEY,
            JSON.stringify({
              lat: latitude,
              lng: longitude,
              name: placeName,
              accuracy: accMeters,
            })
          );
        } catch (e) {}

        updateGlobalState({
          coordinates: { lat: latitude, lng: longitude },
          detectedCoordinates: { lat: latitude, lng: longitude },
          detectedLocationName: placeName,
          isOtherLocation: false,
          isPinnedByUser: true,
          isDetecting: false,
          loading: false,
          error: null,
        });

        fetchWeatherForCoordinates(latitude, longitude, placeName);
      } else {
        // Inaccurate broadband ISP estimate (e.g. Chalakudy/Thrissur ISP gateway)
        const currentFarm = getVerifiedFarmLocation();
        const distKm = Math.round(getDistanceKm(latitude, longitude, currentFarm.lat, currentFarm.lng));

        console.warn(`Browser reported coarse network estimate (±${accMeters}m, ${distKm}km away). Retaining farm: ${currentFarm.name}`);

        updateGlobalState({
          coordinates: { lat: currentFarm.lat, lng: currentFarm.lng },
          detectedCoordinates: { lat: currentFarm.lat, lng: currentFarm.lng },
          detectedLocationName: currentFarm.name,
          isOtherLocation: false,
          isPinnedByUser: true,
          isDetecting: false,
          loading: false,
          error: `Network ISP reported coarse location (±${Math.round(accMeters / 1000)}km). Your farm is preserved at ${currentFarm.name}.`,
        });

        fetchWeatherForCoordinates(currentFarm.lat, currentFarm.lng, currentFarm.name);
      }

      isDetectionActive = false;
    },
    (geoError) => {
      console.warn('Geolocation error:', geoError.code, geoError.message);
      const currentFarm = getVerifiedFarmLocation();
      updateGlobalState({
        permissionState: geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'prompt',
        isDetecting: false,
        loading: false,
        error: geoError.code === geoError.PERMISSION_DENIED
          ? 'Location access was blocked in browser settings. Showing Kottayam, Kerala.'
          : 'Unable to acquire satellite GPS fix. Showing Kottayam, Kerala.',
      });
      isDetectionActive = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
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

    // Initial load: verify and set primary farm (Kottayam, Kerala)
    const verifiedFarm = getVerifiedFarmLocation();
    updateGlobalState({
      coordinates: { lat: verifiedFarm.lat, lng: verifiedFarm.lng },
      detectedCoordinates: { lat: verifiedFarm.lat, lng: verifiedFarm.lng },
      detectedLocationName: verifiedFarm.name,
      isOtherLocation: false,
      isPinnedByUser: true,
    });

    fetchWeatherForCoordinates(verifiedFarm.lat, verifiedFarm.lng, verifiedFarm.name);

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
      error: null,
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
      error: null,
    });

    fetchWeatherForCoordinates(lat, lng, resolvedName);
  }, []);

  // Reset back to verified farm location
  const resetToDetected = useCallback(() => {
    const target = globalState.detectedCoordinates || DEFAULT_FARM;
    updateGlobalState({
      coordinates: { lat: target.lat, lng: target.lng },
      isOtherLocation: false,
      loading: true,
      error: null,
    });

    fetchWeatherForCoordinates(
      target.lat,
      target.lng,
      globalState.detectedLocationName || DEFAULT_FARM.name
    );
  }, []);

  // Trigger manual re-detection
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
    refresh,
    resetToDetected,
    setLocationManually,
    pinFarmLocation,
  };
}
