
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation } from "../contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";

// Fix for default marker icon in react-leaflet
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Mock coordinates for demonstration - in a real app, you would geocode the address
const mockCoordinates: Record<string, Record<string, [number, number]>> = {
  "Texas": {
    "Austin": [30.2672, -97.7431],
    "Dallas": [32.7767, -96.7970],
    "Houston": [29.7604, -95.3698],
    "San Antonio": [29.4241, -98.4936],
    "Fort Worth": [32.7555, -97.3308]
  },
  "California": {
    "Los Angeles": [34.0522, -118.2437],
    "San Francisco": [37.7749, -122.4194],
    "San Diego": [32.7157, -117.1611],
    "Sacramento": [38.5816, -121.4944],
    "San Jose": [37.3382, -121.8863]
  }
};

// Fix default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const DEFAULT_POSITION: [number, number] = [37.8, -96.9]; // Center of US
const DEFAULT_ZOOM = 4;

// Component to recenter map when location changes
const SetViewOnChange = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, coords === DEFAULT_POSITION ? DEFAULT_ZOOM : 12);
  }, [coords, map]);
  return null;
};

const MapView = () => {
  const { state, city } = useLocation();
  const [position, setPosition] = useState<[number, number]>(DEFAULT_POSITION);
  const { toast } = useToast();
  
  useEffect(() => {
    if (state && city && mockCoordinates[state]?.[city]) {
      setPosition(mockCoordinates[state][city]);
      toast({
        title: "Map Updated",
        description: `Showing location for ${city}, ${state}`,
      });
    } else if (state && !city) {
      // Set view to state level if only state is selected
      const firstCity = Object.keys(mockCoordinates[state] || {})[0];
      if (firstCity) {
        const statePos = mockCoordinates[state][firstCity];
        setPosition(statePos);
      } else {
        setPosition(DEFAULT_POSITION);
      }
    } else {
      setPosition(DEFAULT_POSITION);
    }
  }, [state, city]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md border border-border">
      <MapContainer
        key={`map-${position.join("-")}`}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <SetViewOnChange coords={position} />
        
        {state && city && mockCoordinates[state]?.[city] && (
          <Marker position={position}>
            <Popup>
              <div className="text-center">
                <strong>{city}, {state}</strong>
                <p className="text-sm">Selected Location</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
