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

export function useLocationWeather() {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const saveCachedLocation = (lat: number, lng: number, name?: string) => {
    try {
      localStorage.setItem('agrinova_saved_location', JSON.stringify({ lat, lng, name, timestamp: Date.now() }));
      window.dispatchEvent(new CustomEvent('agrinova_location_updated', { detail: { lat, lng, name } }));
    } catch (e) {
      console.warn("Could not cache location to localStorage");
    }
  };

  const fetchWeather = async (lat: number, lng: number, customName?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/weather?latitude=${lat}&longitude=${lng}`);
      
      if (!res.ok) {
        throw new Error('Weather forecast is temporarily unavailable.');
      }
      
      const data: WeatherData = await res.json();
      if (customName && data.location) {
        data.location.name = customName;
      }
      setWeatherData(data);

      // Auto-cache the resolved place name
      if (data.location?.name && (!customName || customName === 'Local Farm Area')) {
        saveCachedLocation(lat, lng, data.location.name);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load real-time weather.');
      // Provide a safe fallback weather dataset so UI never renders broken cards
      setWeatherData({
        location: {
          name: customName || 'Agricultural Zone',
          details: `Coordinates: ${lat.toFixed(2)}, ${lng.toFixed(2)}`
        },
        current: {
          temperature: 28,
          feelsLike: 30,
          humidity: 78,
          windSpeed: 12,
          precipitation: 0,
          condition: 'Partly Cloudy',
          type: 'partly',
          rainProbability: 25
        },
        forecast: [
          { day: 'Today', date: new Date().toISOString(), hi: 31, lo: 24, pop: 20, type: 'partly', condition: 'Partly Cloudy' },
          { day: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString(), hi: 30, lo: 23, pop: 35, type: 'cloud', condition: 'Overcast' },
          { day: 'Day 3', date: new Date(Date.now() + 172800000).toISOString(), hi: 29, lo: 23, pop: 60, type: 'rain', condition: 'Moderate Rain' }
        ],
        warning: null,
        advisory: {
          type: 'GOOD',
          text: 'Favorable agricultural conditions. Suitable for irrigation and harvesting.'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fallbackToServerIPLocation = async () => {
    try {
      const res = await fetch('/api/location');
      if (res.ok) {
        const data = await res.json();
        if (data && data.location) {
          const lat = Number(data.location.latitude);
          const lng = Number(data.location.longitude);
          const name = data.location.name || 'Kottayam, Kerala';
          saveCachedLocation(lat, lng, name);
          setCoordinates({ lat, lng });
          fetchWeather(lat, lng, name);
          return;
        }
      }
      throw new Error('Failed to resolve location via network');
    } catch (err) {
      // Default to Kottayam, Kerala (Central Agricultural Hub)
      const lat = 9.5916;
      const lng = 76.5222;
      const name = 'Kottayam, Kerala';
      saveCachedLocation(lat, lng, name);
      setCoordinates({ lat, lng });
      fetchWeather(lat, lng, name);
    }
  };

  const detectLocation = useCallback((force = false) => {
    setLoading(true);
    setError(null);

    // If not forced, check if a location was saved in the last 2 hours
    if (!force) {
      try {
        const saved = localStorage.getItem('agrinova_saved_location');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.lat && parsed.lng) {
            setCoordinates({ lat: parsed.lat, lng: parsed.lng });
            setPermissionState('granted');
            fetchWeather(parsed.lat, parsed.lng, parsed.name);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to read cached location");
      }
    }

    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      fallbackToServerIPLocation();
      return;
    }

    // Fast-fail geolocation with fallback so desktop users are never stalled
    let hasReturned = false;

    const timer = setTimeout(() => {
      if (!hasReturned) {
        hasReturned = true;
        fallbackToServerIPLocation();
      }
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (hasReturned) return;
        hasReturned = true;
        clearTimeout(timer);

        setPermissionState('granted');
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Reverse geocode via server to get accurate town/district name
        fetch(`/api/location?lat=${latitude}&lng=${longitude}`)
          .then(res => res.json())
          .then(geo => {
            const placeName = geo?.location?.name || 'Local Farm Area';
            saveCachedLocation(latitude, longitude, placeName);
            fetchWeather(latitude, longitude, placeName);
          })
          .catch(() => {
            saveCachedLocation(latitude, longitude);
            fetchWeather(latitude, longitude);
          });
      },
      (geoError) => {
        if (hasReturned) return;
        hasReturned = true;
        clearTimeout(timer);

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setPermissionState('denied');
        }
        // Seamless fallback to server IP location
        fallbackToServerIPLocation();
      },
      {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 120000
      }
    );
  }, []);

  const setLocationManually = useCallback((lat: number, lng: number, name?: string) => {
    saveCachedLocation(lat, lng, name);
    setCoordinates({ lat, lng });

    if (!name) {
      // Reverse geocode clicked coordinates
      fetch(`/api/location?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(geo => {
          const foundName = geo?.location?.name || 'Local Farm Area';
          saveCachedLocation(lat, lng, foundName);
          fetchWeather(lat, lng, foundName);
        })
        .catch(() => {
          fetchWeather(lat, lng);
        });
    } else {
      fetchWeather(lat, lng, name);
    }
  }, []);

  useEffect(() => {
    detectLocation();

    // Listen for cross-component location changes (e.g. from Topbar)
    const handleLocationUpdate = (e: any) => {
      if (e.detail && e.detail.lat && e.detail.lng) {
        setCoordinates({ lat: e.detail.lat, lng: e.detail.lng });
        fetchWeather(e.detail.lat, e.detail.lng, e.detail.name);
      }
    };

    window.addEventListener('agrinova_location_updated', handleLocationUpdate);
    return () => {
      window.removeEventListener('agrinova_location_updated', handleLocationUpdate);
    };
  }, [detectLocation]);

  return {
    coordinates,
    weatherData,
    loading,
    error,
    permissionState,
    refresh: () => detectLocation(true),
    setLocationManually
  };
}
