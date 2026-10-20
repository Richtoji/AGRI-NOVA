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

const STORAGE_KEY = 'agrinova_farm_location';

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

// Client-side IP location resolution directly from user's device/browser
async function detectLocationViaClientIP(): Promise<{ lat: number; lng: number; name: string } | null> {
  try {
    // Strategy 1: BigDataCloud client API (runs directly from user's browser, returns user's local city/town)
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const locality = (data.locality || '').trim();
        const city = (data.city || data.principalSubdivision || '').trim();
        const state = (data.principalSubdivision || 'Kerala').trim();
        let name = locality;
        if (city && city.toLowerCase() !== locality.toLowerCase()) {
          name = locality ? `${locality}, ${city}` : city;
        } else if (!name) {
          name = city || state || 'Local Farm Area';
        }
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          name: name || 'Local Farm Area'
        };
      }
    }
  } catch (e) {
    // Fall through
  }

  try {
    // Strategy 2: Server IP detection
    const res = await fetch('/api/location');
    if (res.ok) {
      const data = await res.json();
      if (data && data.location) {
        return {
          lat: Number(data.location.latitude),
          lng: Number(data.location.longitude),
          name: data.location.name || 'Local Farm Area'
        };
      }
    }
  } catch (e) {
    // Fall through
  }

  return null;
}

// Master detection function
function executeLiveLocationDetection(force = false) {
  if (isDetectionActive && !force) return;
  isDetectionActive = true;

  updateGlobalState({
    isDetecting: true,
    loading: true,
    error: null,
  });

  const onLocationResolved = (lat: number, lng: number, placeName: string, accuracy: number | null, isOther = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, name: placeName }));
    } catch (e) {}

    updateGlobalState({
      detectedCoordinates: { lat, lng },
      detectedLocationName: placeName,
      coordinates: { lat, lng },
      isOtherLocation: isOther,
      isDetecting: false,
      loading: false,
      accuracy,
    });

    isDetectionActive = false;
    fetchWeatherForCoordinates(lat, lng, placeName);
  };

  const handleFallback = async () => {
    // 1. Check if user previously saved a custom farm location
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) {
          onLocationResolved(parsed.lat, parsed.lng, parsed.name || 'Saved Farm Area', null, false);
          return;
        }
      }
    } catch (e) {}

    // 2. Query client-side IP location
    const clientLoc = await detectLocationViaClientIP();
    if (clientLoc) {
      onLocationResolved(clientLoc.lat, clientLoc.lng, clientLoc.name, null, false);
      return;
    }

    // 3. Ultimate agricultural fallback (Central Agricultural Hub)
    onLocationResolved(9.5916, 76.5222, 'Kottayam, Kerala', null, false);
  };

  if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
    handleFallback();
    return;
  }

  // Check browser permission status if supported
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' as PermissionName })
      .then((perm) => {
        if (perm.state === 'denied') {
          updateGlobalState({ permissionState: 'denied' });
          handleFallback();
          return;
        }
        if (perm.state === 'granted') {
          updateGlobalState({ permissionState: 'granted' });
        }
      })
      .catch(() => {});
  }

  // Request browser geolocation with balanced timeout
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const accMeters = Math.round(accuracy);

      updateGlobalState({
        permissionState: 'granted',
        accuracy: accMeters,
      });

      const placeName = await reverseGeocodeCoordinates(latitude, longitude);
      onLocationResolved(latitude, longitude, placeName, accMeters, false);
    },
    (geoError) => {
      console.warn("Browser geolocation returned error code:", geoError.code, geoError.message);

      if (geoError.code === geoError.PERMISSION_DENIED) {
        updateGlobalState({ permissionState: 'denied' });
        handleFallback();
        return;
      }

      // If high accuracy timed out or is unavailable (e.g. desktop on LAN), try coarse Wi-Fi/cellular
      navigator.geolocation.getCurrentPosition(
        async (coarsePos) => {
          const { latitude, longitude, accuracy } = coarsePos.coords;
          const placeName = await reverseGeocodeCoordinates(latitude, longitude);
          onLocationResolved(latitude, longitude, placeName, Math.round(accuracy), false);
        },
        () => {
          handleFallback();
        },
        {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 60000,
        }
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 6000, // 6s gives enough time for hardware GPS without stalling the user
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

    // Initial detection on mount
    if (!globalState.detectedCoordinates && !isDetectionActive) {
      executeLiveLocationDetection();
    } else if (globalState.detectedCoordinates && !state.coordinates) {
      setState({ ...globalState });
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Switch to another selected location on the map
  const setLocationManually = useCallback(async (lat: number, lng: number, name?: string) => {
    let resolvedName = name;
    if (!resolvedName) {
      resolvedName = await reverseGeocodeCoordinates(lat, lng);
    }

    const isOther = globalState.detectedCoordinates
      ? Math.abs(lat - globalState.detectedCoordinates.lat) > 0.0005 ||
        Math.abs(lng - globalState.detectedCoordinates.lng) > 0.0005
      : true;

    // Save user's selected location so it persists
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, name: resolvedName }));
    } catch (e) {}

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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          lat: globalState.detectedCoordinates.lat,
          lng: globalState.detectedCoordinates.lng,
          name: globalState.detectedLocationName || ''
        }));
      } catch (e) {}

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
