"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ShipData, ShipFeature, ShipFeatureCollection } from "../ships";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { Map as MapLibreMap, MapLayerMouseEvent ,MapGeoJSONFeature} from "maplibre-gl";
import { Map, Source, Layer, Popup } from "@vis.gl/react-maplibre";
import { Card, CardContent } from "@/components/ui/card";
import { Maximize2, Minimize2 } from "lucide-react";
import { useShipStore } from "@/store/shipStore";


const CENTER_LAT = 37.636665;
const CENTER_LON = 24.761767;
const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/ships";

const BBOX: [number, number, number, number]  = [18.960943, 34.583369, 34.627447, 40.851118]; // [west, south, east, north]
const MIN_ZOOM = 5;
const MAX_ZOOM = 15;

async function createImageFromSVG(svgString: string) {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.src = url;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  URL.revokeObjectURL(url);
  return img;
}

export default function MapPanel() {
  const [shipsDict, setShipsDict] = useState<Record<string, ShipData>>({});
  const [shipsData, setShipsData] = useState<ShipFeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });
  const [selectedFeature, setSelectedFeature] = useState<MapGeoJSONFeature | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const addShip = useShipStore((state) => state.addShip);

  useEffect(() => {
    const sse = new EventSource(API_URL);

    sse.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data) as ShipData;
        const { Metadata } = parsedData;

        setShipsDict((prev) => {
          const next = { ...prev };
          next[Metadata.MMSI] = parsedData;
          return next;
        });
        addShip(Metadata.MMSI)
      } catch (error) {
        console.error('Error parsing SSE data:', error, event.data);
      }
    };

    return () => {
      sse.close();
    };
  }, []);

  useEffect(() => {
    const features:ShipFeature[] = Object.values(shipsDict).map((ship) => {
      const { Metadata, PositionReport } = ship;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            PositionReport.Longitude,
            PositionReport.Latitude
          ],
        },
        properties: {
          ShipName: Metadata.ShipName ?? 'N/A',
          MMSI: Metadata.MMSI ?? 'N/A',
          NavigationalStatus: PositionReport.NavigationalStatus ?? 'N/A',
          cog: PositionReport.Cog ?? 0,
        },
      };
    });

    setShipsData({
      type: 'FeatureCollection',
      features,
    });
  }, [shipsDict]);

  const onMapLoad = useCallback(async (evt: { target: MapLibreMap }) => {
    const map = evt.target;
    mapRef.current = map;

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <polygon points="10,1 15,19 10,15 5,19" fill="blue" stroke="black" stroke-width="1" />
      </svg>
    `;
    const iconImage = await createImageFromSVG(svgString);
    map.addImage('ship-icon', iconImage);

    map.setMaxBounds(BBOX);
    map.setMinZoom(MIN_ZOOM);
    map.setMaxZoom(MAX_ZOOM);

    map.on('click', 'ships-layer', (e: MapLayerMouseEvent) => {
      if (!e.features?.length) return;
      setSelectedFeature(e.features[0]);
    });

    map.on('mouseenter', 'ships-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'ships-layer', () => {
      map.getCanvas().style.cursor = '';
    });
  }, []);

  const toggleFullScreen = () => {
    if (isFullScreen) {
      document.exitFullscreen?.();
    } else {
      mapRef.current?.getContainer().requestFullscreen?.();
    }
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const exitHandler = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener("fullscreenchange", exitHandler);
    return () => {
      document.removeEventListener("fullscreenchange", exitHandler);
    };
  }, []);

  const shipsLayer = {
    id: 'ships-layer',
    type: 'symbol',
    layout: {
      'icon-image': 'ship-icon',
      'icon-size': 1.0,
      'icon-allow-overlap': true,
      'icon-rotate': ['get', 'cog'],
      'text-field': ['get', 'ShipName'],
      'text-anchor': 'top',
      'text-offset': [0, 1.2],
      'text-size': 12
    }
  };


  const navigationalStatusMap: Record<number, string> = {
    0: "Under way using engine",
    1: "At anchor",
    2: "Not under command",
    3: "Restricted maneuverability",
    4: "Constrained by her draught",
    5: "Moored",
    6: "Aground",
    7: "Engaged in fishing",
    8: "Under way sailing",
    9: "Reserved for future amendment of navigational status",
    10: "Reserved for future amendment of navigational status",
    11: "Power-driven vessel towing astern (regional use)",
    12: "Power-driven vessel pushing ahead or towing alongside (regional use)",
    13: "Reserved for future use",
    14: "AIS-SART (active), MOB-AIS, EPIRB-AIS",
    15: "Undefined"
  };


  let popupEl = null;
  if (selectedFeature) {
    const { geometry, properties } = selectedFeature;

    // Ensure geometry is a Point
    if (geometry.type === "Point") {
      const [longitude, latitude] = geometry.coordinates as [number, number]; // ✅ Fix TypeScript issue

      const statusDescription = navigationalStatusMap[properties.NavigationalStatus] || "Unknown";

      popupEl = (
          <Popup
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              closeOnClick={false}
              onClose={() => setSelectedFeature(null)}
          >
            <div style={{ fontSize: '12px' }}>
              <strong>Ship Name:</strong> {properties.ShipName}<br />
              <strong>MMSI:</strong> {properties.MMSI}<br />
              <strong>Status:</strong> {statusDescription}<br />
            </div>
          </Popup>
      );
    }
  }



  // Render
  return (
      <Card className="w-full h-[40vh]  border-none shadow-xl bg-white/80 backdrop-blur">
        <CardContent className="p-0 h-full">
          <button
              onClick={toggleFullScreen}
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1000,
                backgroundColor: "#ffffff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "5px 10px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
          >
            {isFullScreen ? <Minimize2/> : <Maximize2/>} {isFullScreen ? "Exit Full Screen" : "Full Screen"}
          </button>

          <Map
              initialViewState={{
                longitude: CENTER_LON,
                latitude: CENTER_LAT,
                zoom: 6
              }}
              style={{width: '100%', height: 600}}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              onLoad={onMapLoad}
              mapLib={maplibregl}
          >
            <Source id="ships" type="geojson" data={shipsData}>
              <Layer {...shipsLayer} />
            </Source>
            {popupEl}
          </Map>
        </CardContent>
      </Card>
  );
}
