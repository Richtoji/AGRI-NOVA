"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Maximize, Minimize, RotateCcw, Target, Globe, Compass, CheckCircle2 } from 'lucide-react';

// Custom clean SVG markers without external asset dependencies
const createFarmIcon = () => {
  return L.divIcon({
    className: 'custom-farm-icon-marker',
    html: `
      <div style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #059669; border: 2.5px solid #ffffff; box-shadow: 0 3px 10px rgba(5,150,105,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px; user-select: none;">
          🌱
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

const createSelectedIcon = () => {
  return L.divIcon({
    className: 'custom-selected-icon-marker',
    html: `
      <div style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 3px 10px rgba(37,99,235,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px; user-select: none;">
          📍
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

interface FarmMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  detectedCoordinates?: { lat: number; lng: number } | null;
  isDetectedLocation?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  onResetToDetected?: () => void;
  onPinLocation?: (lat: number, lng: number) => void;
}

// SequentialMapController smoothly manages the two-phase zoom:
// Phase 1: Loads and centers specifically on the 3 km radius (zoom: 15)
// Phase 2: Smoothly expands to the whole regional map (zoom: 13)
function SequentialMapController({
  lat,
  lng,
  zoomMode,
}: {
  lat: number;
  lng: number;
  zoomMode: 'radius3km' | 'wholeMap';
}) {
  const map = useMap();
  const lastStateRef = useRef<string>('');

  useEffect(() => {
    const targetZoom = zoomMode === 'radius3km' ? 15 : 13;
    const stateKey = `${lat.toFixed(4)}_${lng.toFixed(4)}_${zoomMode}`;

    if (lastStateRef.current === stateKey) return;
    lastStateRef.current = stateKey;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const dLat = Math.abs(currentCenter.lat - lat);
    const dLng = Math.abs(currentCenter.lng - lng);

    // Only animate if coordinates or target zoom have genuinely changed
    if (dLat > 0.0001 || dLng > 0.0001 || currentZoom !== targetZoom) {
      map.flyTo([lat, lng], targetZoom, {
        duration: 1.6,
        easeLinearity: 0.25,
      });
    }
  }, [lat, lng, zoomMode, map]);

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
  onResetToDetected,
  onPinLocation,
}: FarmMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomMode, setZoomMode] = useState<'radius3km' | 'wholeMap'>('radius3km');
  const [phaseProgress, setPhaseProgress] = useState<'loading_3km' | 'expanded_whole'>('loading_3km');

  const farmIcon = useMemo(() => createFarmIcon(), []);
  const selectedIcon = useMemo(() => createSelectedIcon(), []);

  // When location changes or component mounts:
  // 1. Immediately focus 3 km radius
  // 2. After 2.3 seconds, expand smoothly to whole regional map
  useEffect(() => {
    setZoomMode('radius3km');
    setPhaseProgress('loading_3km');

    const timer = setTimeout(() => {
      setZoomMode('wholeMap');
      setPhaseProgress('expanded_whole');
    }, 2300);

    return () => clearTimeout(timer);
  }, [latitude, longitude]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
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
    <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden relative z-0 bg-gray-100 group isolate">
      <style>{`
        .custom-farm-icon-marker, .custom-selected-icon-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          font-family: inherit;
        }
        .farm-radius-tooltip {
          background: rgba(6, 78, 59, 0.9) !important;
          border: 1px solid rgba(52, 211, 153, 0.4) !important;
          color: #ffffff !important;
          border-radius: 9999px !important;
          padding: 2px 8px !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        .farm-radius-tooltip::before {
          border-top-color: rgba(6, 78, 59, 0.9) !important;
        }
      `}</style>

      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 3 KM RADIUS ZONE CIRCLE - Loaded first for immediate farm focus */}
        <Circle
          center={[latitude, longitude]}
          radius={3000}
          pathOptions={{
            color: '#059669',
            fillColor: '#10b981',
            fillOpacity: zoomMode === 'radius3km' ? 0.22 : 0.14,
            weight: zoomMode === 'radius3km' ? 3 : 2,
            dashArray: '6, 6',
          }}
        >
          <Tooltip permanent={false} direction="top" offset={[0, -10]} className="farm-radius-tooltip">
            🎯 3 km Farm Radius Zone (3,000m)
          </Tooltip>
          <Popup>
            <div className="text-center font-sans p-1">
              <span className="font-bold text-xs text-emerald-800 block">🎯 3 km Farm Agricultural Zone</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                Exact 3,000-meter local microclimate, soil &amp; cultivation boundary around your farm.
              </span>
            </div>
          </Popup>
        </Circle>

        {/* Active Location Marker */}
        <Marker position={[latitude, longitude]} icon={isDetectedLocation ? farmIcon : selectedIcon}>
          <Popup>
            <div className="text-center font-bold text-gray-900 text-xs p-1">
              {isDetectedLocation ? '🌱 Detected Farm Location' : '📍 Selected Location'} <br />
              <span className="text-[11px] font-medium text-gray-600 block mt-1">{locationName}</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
              <div className="mt-1.5 flex flex-col gap-1">
                {onPinLocation && !isDetectedLocation && (
                  <button
                    type="button"
                    onClick={() => onPinLocation(latitude, longitude)}
                    className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded-md cursor-pointer w-full transition-colors"
                  >
                    📌 Pin As My Farm Location
                  </button>
                )}
                {!isDetectedLocation && onResetToDetected && (
                  <button
                    type="button"
                    onClick={onResetToDetected}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 cursor-pointer w-full"
                  >
                    ↺ Reset to Detected Farm
                  </button>
                )}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* If viewing another selected location, also display the user's detected farm location as reference */}
        {!isDetectedLocation && detectedCoordinates && (
          <>
            <Circle
              center={[detectedCoordinates.lat, detectedCoordinates.lng]}
              radius={3000}
              pathOptions={{
                color: '#059669',
                fillColor: '#10b981',
                fillOpacity: 0.1,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            />
            <Marker position={[detectedCoordinates.lat, detectedCoordinates.lng]} icon={farmIcon}>
              <Popup>
                <div className="text-center font-bold text-gray-900 text-xs p-1">
                  🌱 Your Primary Farm GPS <br />
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {detectedCoordinates.lat.toFixed(4)}, {detectedCoordinates.lng.toFixed(4)}
                  </span>
                  {onResetToDetected && (
                    <button
                      type="button"
                      onClick={onResetToDetected}
                      className="mt-2 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded-md cursor-pointer w-full"
                    >
                      Return to Farm Location
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        <SequentialMapController lat={latitude} lng={longitude} zoomMode={zoomMode} />
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
      </MapContainer>

      {/* Sequential Phase Indicator Banner */}
      <div className="absolute top-2 left-2 z-[1000] flex flex-wrap items-center gap-1.5 pointer-events-auto">
        {phaseProgress === 'loading_3km' ? (
          <div className="bg-emerald-900/90 text-white backdrop-blur-xs px-3 py-1 rounded-full shadow-md border border-emerald-400/40 text-[10px] font-bold flex items-center gap-1.5 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>Phase 1: 3 km Farm Radius Loaded</span>
            <span className="text-[9px] text-emerald-200 font-mono">3,000m</span>
          </div>
        ) : (
          <div className="bg-gray-900/90 text-white backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md border border-white/20 text-[10px] font-bold flex items-center gap-1.5 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Whole Map Active</span>
            <span className="text-[9px] text-emerald-300 font-normal border-l border-white/20 pl-1.5">3 km Zone Highlighted</span>
          </div>
        )}
      </div>

      {/* Interactive Phase Toggle & Fullscreen Controls */}
      <div className="absolute top-2 right-2 z-[1000] flex items-center gap-1 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-xs border border-gray-200 shadow-md rounded-lg p-0.5 flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setZoomMode('radius3km')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              zoomMode === 'radius3km'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Focus on 3 km Farm Radius"
          >
            <Target className="w-3 h-3" />
            <span>3 km</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomMode('wholeMap')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              zoomMode === 'wholeMap'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="View Whole Regional Map"
          >
            <Globe className="w-3 h-3" />
            <span>Whole Map</span>
          </button>
        </div>

        {onResetToDetected && !isDetectedLocation && (
          <button
            type="button"
            onClick={onResetToDetected}
            className="bg-white/95 hover:bg-white text-emerald-700 hover:text-emerald-800 p-1.5 rounded-lg shadow-md border border-emerald-300 transition-all cursor-pointer"
            title="Reset map view back to detected farm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className="bg-white/95 hover:bg-white border border-gray-200 shadow-md rounded-lg p-1.5 text-gray-700 hover:text-emerald-600 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-[1000]">
        <div className="bg-black/65 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[9px] font-medium shadow-xs flex items-center gap-1.5">
          <span>🎯 Green circle marks exact 3 km agricultural radius</span>
          <span className="text-gray-400">•</span>
          <span>Click anywhere to inspect</span>
        </div>
      </div>
    </div>
  );
}
