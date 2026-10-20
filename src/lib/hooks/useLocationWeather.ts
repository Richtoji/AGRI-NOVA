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
}

// Global shared state across all components (Farmer Dashboard, Topbar, Crop Recommender)
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
};

const listeners = new Set<(state: SharedLocationState) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...globalState }));
}

function updateGlobalState(partial: Partial<SharedLocationState>) {
  globalState = { ...globalState, ...partial };
  notifyListeners();
}

let isDetectionInProgress = false;

// Safe fallback weather generator
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

// Core weather fetcher
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

// Fallback to server/network IP detection only when browser GPS is completely unavailable or denied
async function fallbackToNetworkLocation() {
  try {
    const res = await fetch('/api/location');
    if (res.ok) {
      const data = await res.json();
      if (data && data.location) {
        const lat = Number(data.location.latitude);
        const lng = Number(data.location.longitude);
        const name = data.location.name || 'Local Farm Area';

        updateGlobalState({
          detectedCoordinates: { lat, lng },
          detectedLocationName: name,
          coordinates: { lat, lng },
          isOtherLocation: false,
          isDetecting: false,
          loading: false,
          accuracy: null
        });

        fetchWeatherForCoordinates(lat, lng, name);
        return;
      }
    }
    throw new Error('Network location unavailable');
  } catch (e) {
    // Ultimate agricultural default (Kottayam Central Agricultural Hub)
    const lat = 9.5916;
    const lng = 76.5222;
    const name = 'Kottayam, Kerala';

    updateGlobalState({
      detectedCoordinates: { lat, lng },
      detectedLocationName: name,
      coordinates: { lat, lng },
      isOtherLocation: false,
      isDetecting: false,
      loading: false,
      accuracy: null
    });

    fetchWeatherForCoordinates(lat, lng, name);
  } finally {
    isDetectionInProgress = false;
  }
}

// Reverse geocode coordinates to get precise town, village or district
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
    console.warn("Reverse geocode failed, using generic area name");
  }
  return `Farm Zone (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
}

// Master detection function: High accuracy GPS first
function executeLiveLocationDetection(force = false) {
  if (isDetectionInProgress && !force) return;
  isDetectionInProgress = true;

  updateGlobalState({
    isDetecting: true,
    loading: true,
    error: null,
  });

  if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
    fallbackToNetworkLocation();
    return;
  }

  // Attempt high-accuracy GPS with generous 10s timeout
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const accMeters = Math.round(accuracy);

      updateGlobalState({
        permissionState: 'granted',
        accuracy: accMeters,
      });

      // Reverse geocode to get the real local area name
      const placeName = await reverseGeocodeCoordinates(latitude, longitude);

      updateGlobalState({
        detectedCoordinates: { lat: latitude, lng: longitude },
        detectedLocationName: placeName,
        coordinates: { lat: latitude, lng: longitude },
        isOtherLocation: false,
        isDetecting: false,
        loading: false,
      });

      isDetectionInProgress = false;
      fetchWeatherForCoordinates(latitude, longitude, placeName);
    },
    (geoError) => {
      console.warn("High accuracy geolocation returned error:", geoError.code, geoError.message);

      if (geoError.code === geoError.PERMISSION_DENIED) {
        updateGlobalState({ permissionState: 'denied' });
        fallbackToNetworkLocation();
        return;
      }

      // If high accuracy timed out (e.g. desktop without dedicated hardware GPS), try coarse Wi-Fi/cellular
      if (geoError.code === geoError.TIMEOUT || geoError.code === geoError.POSITION_UNAVAILABLE) {
        navigator.geolocation.getCurrentPosition(
          async (coarsePos) => {
            const { latitude, longitude, accuracy } = coarsePos.coords;
            updateGlobalState({
              permissionState: 'granted',
              accuracy: Math.round(accuracy),
            });

            const placeName = await reverseGeocodeCoordinates(latitude, longitude);

            updateGlobalState({
              detectedCoordinates: { lat: latitude, lng: longitude },
              detectedLocationName: placeName,
              coordinates: { lat: latitude, lng: longitude },
              isOtherLocation: false,
              isDetecting: false,
              loading: false,
            });

            isDetectionInProgress = false;
            fetchWeatherForCoordinates(latitude, longitude, placeName);
          },
          () => {
            // Coarse also failed, fall back to server IP
            fallbackToNetworkLocation();
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000,
          }
        );
      } else {
        fallbackToNetworkLocation();
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0, // Always get fresh real-time coordinates
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

    // Initial detection: if not already detected and not in progress, kick off high accuracy detection
    if (!globalState.detectedCoordinates && !isDetectionInProgress) {
      executeLiveLocationDetection();
    } else if (globalState.detectedCoordinates && !state.coordinates) {
      // Sync local state if global already has values
      setState({ ...globalState });
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Switch to another selected location on the map
  const setLocationManually = useCallback(async (lat: number, lng: number, name?: string) => {
    const isOther = globalState.detectedCoordinates
      ? Math.abs(lat - globalState.detectedCoordinates.lat) > 0.0001 ||
        Math.abs(lng - globalState.detectedCoordinates.lng) > 0.0001
      : true;

    let resolvedName = name;
    if (!resolvedName) {
      resolvedName = await reverseGeocodeCoordinates(lat, lng);
    }

    updateGlobalState({
      coordinates: { lat, lng },
      isOtherLocation: isOther,
      loading: true,
    });

    fetchWeatherForCoordinates(lat, lng, resolvedName);
  }, []);

  // Reset the map and telemetry back to the detected GPS location
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
      executeLiveLocationDetection(true);
    }
  }, []);

  // Force re-detect GPS location
  const refresh = useCallback(() => {
    executeLiveLocationDetection(true);
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
    refresh,
    resetToDetected,
    setLocationManually,
  };
}
