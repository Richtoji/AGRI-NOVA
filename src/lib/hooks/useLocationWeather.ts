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

  const fetchWeather = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/weather?latitude=${lat}&longitude=${lng}`);
      
      if (!res.ok) {
        throw new Error('Weather information is temporarily unavailable.');
      }
      
      const data = await res.json();
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || 'Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    const fallbackToIPLocation = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const lat = Number(data.latitude);
            const lng = Number(data.longitude);
            setCoordinates({ lat, lng });
            fetchWeather(lat, lng);
            return;
          }
        }
        throw new Error('IP location failed');
      } catch (err) {
        setError('Unable to determine your current location. Please enable GPS or check connection.');
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      fallbackToIPLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionState('granted');
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        fetchWeather(latitude, longitude);
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setPermissionState('denied');
        }
        // Always try to fallback to IP if geolocation fails for any reason
        fallbackToIPLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 
      }
    );
  }, []);

  const setLocationManually = useCallback((lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    fetchWeather(lat, lng);
  }, []);

  useEffect(() => {
    // Initial detection on mount
    detectLocation();
  }, [detectLocation]);

  return {
    coordinates,
    weatherData,
    loading,
    error,
    permissionState,
    refresh: detectLocation,
    setLocationManually
  };
}
