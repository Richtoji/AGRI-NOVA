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

  const detectLocation = useCallback((force = false) => {
    setLoading(true);
    setError(null);

    const saveCachedLocation = (lat: number, lng: number) => {
      try {
        localStorage.setItem('agrinova_cached_location', JSON.stringify({ lat, lng, timestamp: Date.now() }));
      } catch (e) {
        console.warn("Failed to cache location");
      }
    };

    // 1. Check if user previously set a manual location (unless forcing a refresh)
    if (!force) {
      try {
        const saved = localStorage.getItem('agrinova_saved_location');
        if (saved) {
          const { lat, lng } = JSON.parse(saved);
          if (lat && lng) {
            setCoordinates({ lat, lng });
            fetchWeather(lat, lng);
            return;
          }
        }
        
        // 2. Check cached automatic location (valid for 1 hour)
        const cached = localStorage.getItem('agrinova_cached_location');
        if (cached) {
          const { lat, lng, timestamp } = JSON.parse(cached);
          if (lat && lng && timestamp && (Date.now() - timestamp < 3600000)) {
            setCoordinates({ lat, lng });
            fetchWeather(lat, lng);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to read location from localStorage");
      }
    }

    const fallbackToIPLocation = async () => {
      try {
        const res = await fetch('http://ip-api.com/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.lat && data.lon) {
            const lat = Number(data.lat);
            const lng = Number(data.lon);
            saveCachedLocation(lat, lng);
            setCoordinates({ lat, lng });
            fetchWeather(lat, lng);
            return;
          }
        }

        // Second fallback
        const res2 = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.latitude && data2.longitude) {
            const lat = Number(data2.latitude);
            const lng = Number(data2.longitude);
            saveCachedLocation(lat, lng);
            setCoordinates({ lat, lng });
            fetchWeather(lat, lng);
            return;
          }
        }

        // Third fallback
        const res3 = await fetch('https://ipapi.co/json/');
        if (res3.ok) {
          const data3 = await res3.json();
          if (data3.latitude && data3.longitude) {
            const lat = Number(data3.latitude);
            const lng = Number(data3.longitude);
            saveCachedLocation(lat, lng);
            setCoordinates({ lat, lng });
            fetchWeather(lat, lng);
            return;
          }
        }

        throw new Error('All IP location services failed');
      } catch (err) {
        console.warn("Location detection failed. Defaulting to Central India.");
        // Ultimate fallback to a central agricultural location (e.g. Nagpur)
        const lat = 21.1458;
        const lng = 79.0882;
        saveCachedLocation(lat, lng);
        setCoordinates({ lat, lng });
        fetchWeather(lat, lng);
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
        saveCachedLocation(latitude, longitude);
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
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0 
      }
    );
  }, []);

  const setLocationManually = useCallback((lat: number, lng: number) => {
    try {
      localStorage.setItem('agrinova_saved_location', JSON.stringify({ lat, lng }));
    } catch (e) {
      console.warn("Failed to save location to localStorage");
    }
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
    refresh: () => detectLocation(true),
    setLocationManually
  };
}
