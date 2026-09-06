"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default Leaflet icon in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// FIX FOR NEXT.JS FAST REFRESH: Forcefully clear Leaflet's container cache
const originalInit = (L.Map.prototype as any).initialize;
(L.Map.prototype as any).initialize = function(id: any, options: any) {
  const el = typeof id === 'string' ? document.getElementById(id) : id;
  if (el && el._leaflet_id) {
    el._leaflet_id = null;
  }
  originalInit.call(this, id, options);
};

interface FarmMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

function MapUpdater({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function FarmMap({ latitude, longitude, locationName, onLocationSelect }: FarmMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div key={Math.random()} className="w-full h-full rounded-xl overflow-hidden relative z-0">
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', minHeight: '130px' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center font-bold text-gray-900 text-xs">
              Your Farm Location <br/>
              <span className="text-[10px] font-normal text-gray-500">{locationName}</span>
            </div>
          </Popup>
        </Marker>
        <MapUpdater lat={latitude} lng={longitude} />
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
      </MapContainer>
    </div>
  );
}
