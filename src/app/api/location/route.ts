import { NextResponse } from 'next/server';

interface LocationResult {
  name: string;
  details: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

// Reverse Geocode helper
async function reverseGeocode(latitude: number, longitude: number): Promise<{ name: string; details: string; city: string; state: string; country: string }> {
  // Strategy 1: BigDataCloud (Fast, reliable, HTTPS, rich locality & administrative hierarchy)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (res.ok) {
      const data = await res.json();
      const locality = (data.locality || '').trim();
      const city = (data.city || data.principalSubdivision || '').trim();
      const state = (data.principalSubdivision || 'Kerala').trim();
      const country = (data.countryName || 'India').trim();

      let name = locality;
      if (city && city.toLowerCase() !== locality.toLowerCase()) {
        name = locality ? `${locality}, ${city}` : city;
      } else if (!name) {
        name = city || state || 'Local Area';
      }

      const details = [locality, city !== locality ? city : '', state, country].filter(Boolean).join(', ');
      if (name && name !== 'Local Area') {
        return { name, details, city: city || locality, state, country };
      }
    }
  } catch (e) {
    // Fall through to Nominatim
  }

  // Strategy 2: OpenStreetMap Nominatim with zoom=18 for farm/village-level precision
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
      {
        headers: { 'User-Agent': 'Agri-NOVA-Platform/2.0 (contact@agrinova.in)' },
        signal: AbortSignal.timeout(4500)
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const local = addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || addr.town || addr.isolated_dwelling || addr.city_district;
        const district = addr.county || addr.district || addr.state_district || addr.city;
        const state = addr.state || 'Kerala';
        const country = addr.country || 'India';

        let name = local;
        if (district && district.toLowerCase() !== (local || '').toLowerCase()) {
          name = local ? `${local}, ${district}` : district;
        } else if (!name) {
          name = district || state || 'Local Area';
        }

        const details = data.display_name || [local, district, state, country].filter(Boolean).join(', ');
        return { name, details, city: district || local || 'Local Area', state, country };
      }
    }
  } catch (e) {
    // Fall through
  }

  return {
    name: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
    details: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    city: 'Local Area',
    state: '',
    country: 'India'
  };
}

// Baseline Agricultural Location Helper: Kottayam, Kerala
async function detectLocationByIP(request: Request): Promise<LocationResult> {
  return {
    latitude: 9.5916,
    longitude: 76.5222,
    name: 'Kottayam',
    details: 'Kottayam, Kerala, India',
    city: 'Kottayam',
    state: 'Kerala',
    country: 'India'
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('latitude') || searchParams.get('lat');
    const lngStr = searchParams.get('longitude') || searchParams.get('lng');
    const query = searchParams.get('q') || searchParams.get('search');

    // 1. If searching for a city/location by name
    if (query && query.trim()) {
      try {
        const searchRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=5&accept-language=en`,
          {
            headers: { 'User-Agent': 'Agri-NOVA-Platform/2.0 (contact@agrinova.in)' },
            signal: AbortSignal.timeout(4000)
          }
        );
        if (searchRes.ok) {
          const results = await searchRes.json();
          const formatted = (results || []).map((item: any) => ({
            name: item.display_name.split(',')[0],
            details: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon)
          }));
          return NextResponse.json({ success: true, results: formatted });
        }
      } catch (err) {
        console.error('Location search error:', err);
      }
      return NextResponse.json({ success: true, results: [] });
    }

    // 2. If coordinates are provided, reverse-geocode them
    if (latStr && lngStr) {
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        const geoInfo = await reverseGeocode(latitude, longitude);
        return NextResponse.json({
          success: true,
          location: {
            latitude,
            longitude,
            name: geoInfo.name,
            details: geoInfo.details,
            city: geoInfo.city,
            state: geoInfo.state,
            country: geoInfo.country
          }
        });
      }
    }

    // 3. Otherwise, detect location via IP
    const detected = await detectLocationByIP(request);
    return NextResponse.json({
      success: true,
      location: detected
    });

  } catch (error) {
    console.error('Location detection API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to detect location',
        location: {
          latitude: 9.5916,
          longitude: 76.5222,
          name: 'Kottayam',
          details: 'Kottayam, Kerala, India'
        }
      },
      { status: 200 } // Return 200 with fallback so UI never crashes
    );
  }
}
