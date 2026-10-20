"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Maximize, Minimize, RotateCcw } from 'lucide-react';

// Custom modern SVG markers using L.divIcon to avoid broken asset paths
const createFarmDetectedIcon = () => {
  return L.divIcon({
    className: 'custom-farm-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #059669; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
          🌱
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createSelectedLocationIcon = () => {
  return L.divIcon({
    className: 'custom-selected-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">
          📍
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// FIX FOR NEXT.JS FAST REFRESH: Clear Leaflet's container cache safely
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
  detectedCoordinates?: { lat: number; lng: number } | null;
  isDetectedLocation?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  onResetToDetected?: () => void;
}

// Smoothly animates camera to new coordinates when user picks another location or resets
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, {
      duration: 1.2,
      easeLinearity: 0.25
    });
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

export default function FarmMap({
  latitude,
  longitude,
  locationName,
  detectedCoordinates,
  isDetectedLocation = true,
  onLocationSelect,
  onResetToDetected
}: FarmMapProps) {
  const position: [number, number] = [latitude, longitude];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const farmIcon = React.useMemo(() => createFarmDetectedIcon(), []);
  const selectedIcon = React.useMemo(() => createSelectedLocationIcon(), []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden relative z-0 bg-gray-100 group">
      <div className="w-full h-full relative z-0">
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

          {/* Active Location Marker */}
          <Marker
            position={position}
            icon={isDetectedLocation ? farmIcon : selectedIcon}
          >
            <Popup>
              <div className="text-center font-bold text-gray-900 text-xs p-1">
                {isDetectedLocation ? "🌱 Detected Farm Location" : "📍 Selected Location"} <br/>
                <span className="text-[11px] font-medium text-gray-600 block mt-1">{locationName}</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
                {!isDetectedLocation && onResetToDetected && (
                  <button
                    onClick={onResetToDetected}
                    className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 cursor-pointer w-full"
                  >
                    ↺ Reset to Detected Farm
                  </button>
                )}
              </div>
            </Popup>
          </Marker>

          {/* If viewing another location, also show the user's detected farm location as a reference */}
          {!isDetectedLocation && detectedCoordinates && (
            <Marker
              position={[detectedCoordinates.lat, detectedCoordinates.lng]}
              icon={farmIcon}
            >
              <Popup>
                <div className="text-center font-bold text-gray-900 text-xs p-1">
                  🌱 Your Detected Farm GPS <br/>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {detectedCoordinates.lat.toFixed(4)}, {detectedCoordinates.lng.toFixed(4)}
                  </span>
                  {onResetToDetected && (
                    <button
                      onClick={onResetToDetected}
                      className="mt-2 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded-md cursor-pointer w-full"
                    >
                      Return to Farm Location
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          <MapUpdater lat={latitude} lng={longitude} />
          {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
        </MapContainer>
      </div>

      {/* Floating Status & Reset Control Bar on Map */}
      <div className="absolute top-2 left-2 z-[1000] flex flex-wrap items-center gap-1.5 pointer-events-auto">
        {isDetectedLocation ? (
          <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-sm text-[10px] font-bold text-emerald-700 border border-emerald-200/80 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5 shrink-0" />
            <span className="truncate max-w-[150px]">Live Farm GPS</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="bg-blue-600 text-white px-2.5 py-1 rounded-full shadow-sm text-[10px] font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-white mr-1.5 shrink-0" />
              <span className="truncate max-w-[130px]">Selected Place</span>
            </div>
            {onResetToDetected && (
              <button
                type="button"
                onClick={onResetToDetected}
                className="bg-white/95 hover:bg-white text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-full shadow-sm text-[10px] font-bold border border-emerald-300 flex items-center transition-all cursor-pointer"
                title="Reset map view back to detected farm location"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset to Farm
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Toggle Button */}
      <button 
        type="button"
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 z-[1000] bg-white/95 hover:bg-white border border-gray-200 shadow-md rounded-lg p-1.5 text-gray-700 hover:text-emerald-600 transition-colors opacity-90 hover:opacity-100 cursor-pointer"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
      </button>

      {/* Bottom Hint */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-[1000]">
        <div className="bg-black/60 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[9px] font-medium shadow-xs">
          Click map to select another location
        </div>
      </div>
    </div>
  );
}
