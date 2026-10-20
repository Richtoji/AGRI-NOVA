import { NextResponse } from 'next/server';

// Weather code mapping based on WMO standards (used by Open-Meteo)
const getWeatherCondition = (code: number) => {
  if (code === 0) return { condition: 'Clear Sky', type: 'sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', type: 'partly' };
  if (code === 3) return { condition: 'Overcast', type: 'cloud' };
  if (code >= 45 && code <= 48) return { condition: 'Foggy', type: 'cloud' };
  if (code >= 51 && code <= 57) return { condition: 'Drizzle', type: 'rain' };
  if (code >= 61 && code <= 67) return { condition: 'Rain', type: 'rain' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', type: 'snow' };
  if (code >= 80 && code <= 82) return { condition: 'Rain Showers', type: 'rain' };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', type: 'storm' };
  return { condition: 'Unknown', type: 'cloud' };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('latitude');
    const lngStr = searchParams.get('longitude');

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lngStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // 1. Fetch Location Name using multi-strategy geocoding
    let locationInfo = {
      name: 'Local Farm Area',
      details: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };

    // Strategy 1: BigDataCloud reverse geocode (fast, free, unlimited, HTTPS)
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: AbortSignal.timeout(3500) }
      );
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        const city = bdcData.locality || bdcData.city || bdcData.principalSubdivision;
        const state = bdcData.principalSubdivision || '';
        const country = bdcData.countryName || 'India';
        if (city) {
          locationInfo = {
            name: city,
            details: [city, state, country].filter(Boolean).join(', ')
          };
        }
      }
    } catch (e) {
      // Fall through to Nominatim
    }

    // Strategy 2: OpenStreetMap Nominatim fallback if needed
    if (locationInfo.name === 'Local Farm Area') {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=11&accept-language=en`,
          {
            headers: { 'User-Agent': 'Agri-NOVA-Platform/2.0 (contact@agrinova.in)' },
            signal: AbortSignal.timeout(3500)
          }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.address) {
            const { city, town, village, suburb, neighbourhood, city_district, district, county, state, country } = geoData.address;
            const localArea = city || town || village || district || county || suburb || neighbourhood || city_district || 'Local Area';
            locationInfo = {
              name: localArea,
              details: [localArea, state, country].filter(Boolean).join(', ')
            };
          }
        }
      } catch (err) {
        console.warn('Geocoding fallback reached coordinates string');
      }
    }

    // 2. Fetch Weather Data from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`;
    
    const weatherRes = await fetch(weatherUrl, {
      signal: AbortSignal.timeout(5000)
    });
    
    if (!weatherRes.ok) {
      return NextResponse.json(
        { error: 'Weather API is temporarily unavailable' },
        { status: 502 }
      );
    }

    const weatherData = await weatherRes.json();
    
    const { current, daily } = weatherData;
    
    // Process current weather
    const currentCondition = getWeatherCondition(current?.weather_code || 0);
    const currentFormatted = {
      temperature: Math.round(current?.temperature_2m || 0),
      feelsLike: Math.round(current?.apparent_temperature || 0),
      humidity: current?.relative_humidity_2m || 0,
      windSpeed: current?.wind_speed_10m || 0,
      precipitation: current?.precipitation || 0,
      condition: currentCondition.condition,
      type: currentCondition.type,
      rainProbability: daily?.precipitation_probability_max?.[0] || 0, // Today's rain probability
    };

    // Process 7-day forecast
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = (daily?.time || []).map((dateStr: string, index: number) => {
      const date = new Date(dateStr);
      const conditionInfo = getWeatherCondition(daily?.weather_code?.[index] || 0);
      
      return {
        day: days[date.getDay()],
        date: dateStr,
        hi: Math.round(daily?.temperature_2m_max?.[index] || 0),
        lo: Math.round(daily?.temperature_2m_min?.[index] || 0),
        pop: daily?.precipitation_probability_max?.[index] || 0,
        type: conditionInfo.type,
        condition: conditionInfo.condition
      };
    });

    // Generate Advisory and Warnings
    let warning = null;
    if (currentFormatted.rainProbability > 85 || currentFormatted.precipitation > 20) {
      warning = {
        level: 'CRITICAL',
        title: 'Heavy Rain Warning',
        message: 'Heavy rainfall expected in your area. Consider postponing pesticide spraying, fertilizer application, and outdoor farming activities.'
      };
    } else if (currentFormatted.rainProbability > 70) {
      warning = {
        level: 'WARNING',
        title: 'Rain Warning',
        message: 'Significant rain expected. Ensure proper drainage for sensitive crops.'
      };
    } else if (currentFormatted.rainProbability > 40) {
      warning = {
        level: 'ADVISORY',
        title: 'Rain Advisory',
        message: 'Moderate chance of rain today. Monitor conditions before applying fertilizers.'
      };
    }

    let advisoryText = "Today's weather conditions are suitable for general farming activities.";
    let advisoryType = "GOOD";
    
    if (currentFormatted.rainProbability > 60) {
      advisoryText = "Rain is expected today. Avoid pesticide spraying immediately before rainfall.";
      advisoryType = "RAIN";
    } else if (currentFormatted.temperature > 35) {
      advisoryText = "High temperatures are expected. Ensure adequate irrigation.";
      advisoryType = "HOT";
    } else if (currentFormatted.humidity > 85) {
      advisoryText = "High humidity may increase fungal disease risk. Monitor crops.";
      advisoryType = "HUMID";
    }

    return NextResponse.json({
      location: locationInfo,
      current: currentFormatted,
      forecast: forecast,
      warning,
      advisory: {
        type: advisoryType,
        text: advisoryText
      }
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching weather data' },
      { status: 500 }
    );
  }
}
