
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation } from "../contexts/LocationContext";
import { useQAP } from "@/contexts/QAPContext";
import { useToast } from "@/hooks/use-toast";
import { School, Hospital, Store, Restaurant, Bus, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

// Fix for default marker icon in react-leaflet
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

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

const DEFAULT_POSITION: [number, number] = [37.8, -96.9]; // Center of US
const DEFAULT_ZOOM = 4;

// Component to recenter map when location changes
const SetViewOnChange = ({ coords, zoom }: { coords: [number, number]; zoom: number }) => {
  const map = L.Map && L.map ? L.map('mapid') : null;
  
  useEffect(() => {
    if (map) {
      map.setView(coords, zoom);
    }
  }, [coords, zoom, map]);
  
  return null;
};

// Mock amenity data generator
const generateMockAmenities = (
  center: [number, number], 
  radius: number,
  maxCount: number = 50
) => {
  // Categories of amenities that we're interested in
  const amenityTypes = ['hospital', 'school', 'store', 'restaurant', 'bus_stop', 'pharmacy', 'park', 'library'];
  
  // Calculate a somewhat realistic distribution based on radius
  // Larger radius should yield more amenities, but with diminishing returns
  const scaleFactor = Math.log(radius + 1) / Math.log(10 + 1);
  const count = Math.floor(maxCount * scaleFactor);
  
  const amenities = [];
  
  for (let i = 0; i < count; i++) {
    // Random angle
    const angle = Math.random() * Math.PI * 2;
    // Random distance (in km), biased towards the edge for more realism
    const distance = (0.2 + Math.random() * 0.8) * radius;
    
    // Convert km to lat/lon (rough approximation)
    // 1 degree of latitude is approximately 111 km
    const latOffset = distance * Math.cos(angle) / 111;
    const lonOffset = distance * Math.sin(angle) / (111 * Math.cos(center[0] * (Math.PI / 180)));
    
    const amenityType = amenityTypes[Math.floor(Math.random() * amenityTypes.length)];
    
    amenities.push({
      id: `amenity-${i}`,
      type: amenityType,
      name: `${amenityType.charAt(0).toUpperCase() + amenityType.slice(1)} ${i + 1}`,
      lat: center[0] + latOffset,
      lon: center[1] + lonOffset,
      distance: distance.toFixed(1)
    });
  }
  
  return amenities;
};

// Helper function to get marker colors based on amenity type
const getMarkerColor = (type: string): string => {
  switch (type) {
    case 'hospital': return '#ef4444'; // red
    case 'school': return '#3b82f6'; // blue
    case 'store': return '#22c55e'; // green
    case 'restaurant': return '#f59e0b'; // amber
    case 'bus_stop': return '#8b5cf6'; // purple
    case 'pharmacy': return '#ec4899'; // pink
    case 'park': return '#10b981'; // emerald
    case 'library': return '#6366f1'; // indigo
    default: return '#94a3b8'; // slate
  }
};

// Helper function to get icon based on amenity type
const getAmenityIcon = (type: string) => {
  switch (type) {
    case 'hospital': return <Hospital className="h-4 w-4" />;
    case 'school': return <School className="h-4 w-4" />;
    case 'store': return <Store className="h-4 w-4" />;
    case 'restaurant': return <Restaurant className="h-4 w-4" />;
    case 'bus_stop': return <Bus className="h-4 w-4" />;
    default: return <MapPin className="h-4 w-4" />;
  }
};

// Calculate development location score based on amenities
const calculateLocationScore = (
  amenities: any[], 
  state: string
): { raw: number; normalized: number } => {
  // Get max points based on state
  const maxPoints = state === "Texas" ? 17 : 15;
  
  // Count amenities by type
  const amenityCounts: Record<string, number> = {};
  amenities.forEach(amenity => {
    if (!amenityCounts[amenity.type]) {
      amenityCounts[amenity.type] = 0;
    }
    amenityCounts[amenity.type]++;
  });
  
  // Calculate raw score based on amenity counts
  // This is a simplified scoring model
  let rawScore = 0;
  
  // Base points for variety of amenities (max 5 points)
  rawScore += Math.min(Object.keys(amenityCounts).length * 1.5, 5);
  
  // Points for quantity of amenities (max 10 points)
  // Logarithmic scale to prevent excessive points for very high counts
  rawScore += Math.min(Math.log(amenities.length + 1) * 3, 10);
  
  // Additional points for essential services (max 2 points)
  if (amenityCounts.hospital && amenityCounts.hospital > 0) rawScore += 1;
  if (amenityCounts.school && amenityCounts.school > 0) rawScore += 0.5;
  if (amenityCounts.store && amenityCounts.store > 0) rawScore += 0.5;
  
  // Normalize score to state's maximum points
  const normalizedScore = Math.min(Math.round(rawScore * maxPoints / 17), maxPoints);
  
  return {
    raw: rawScore,
    normalized: normalizedScore
  };
};

const MapView = () => {
  const { state, city } = useLocation();
  const { updateCategoryScore } = useQAP();
  const [position, setPosition] = useState<[number, number]>(DEFAULT_POSITION);
  const [radius, setRadius] = useState<number>(1);
  const [amenities, setAmenities] = useState<any[]>([]);
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
  }, [state, city, toast]);

  // Update amenities when position or radius changes
  useEffect(() => {
    if (state && city && mockCoordinates[state]?.[city]) {
      const newAmenities = generateMockAmenities(position, radius);
      setAmenities(newAmenities);
      
      // Calculate and update location score
      if (state) {
        const score = calculateLocationScore(newAmenities, state);
        updateCategoryScore("location", score.normalized);
      }
    } else {
      setAmenities([]);
    }
  }, [position, radius, state, city, updateCategoryScore]);

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };

  // Group amenities by type for display
  const amenitiesByType: Record<string, any[]> = {};
  amenities.forEach(amenity => {
    if (!amenitiesByType[amenity.type]) {
      amenitiesByType[amenity.type] = [];
    }
    amenitiesByType[amenity.type].push(amenity);
  });

  return (
    <div className="space-y-6">
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md border border-border">
        <MapContainer
          key={`map-${position.join("-")}`}
          center={position}
          zoom={position === DEFAULT_POSITION ? DEFAULT_ZOOM : 12}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {state && city && mockCoordinates[state]?.[city] && (
            <>
              <Marker position={position}>
                <Popup>
                  <div className="text-center">
                    <strong>{city}, {state}</strong>
                    <p className="text-sm">Selected Location</p>
                  </div>
                </Popup>
              </Marker>
              
              <Circle 
                center={position}
                radius={radius * 1000} // Convert km to meters
                pathOptions={{
                  color: 'rgba(59, 130, 246, 0.5)',
                  fillColor: 'rgba(59, 130, 246, 0.2)',
                  fillOpacity: 0.3,
                  weight: 2
                }}
              />
              
              {amenities.map((amenity) => (
                <CircleMarker
                  key={amenity.id}
                  center={[amenity.lat, amenity.lon]}
                  radius={5}
                  pathOptions={{ 
                    color: getMarkerColor(amenity.type),
                    fillColor: getMarkerColor(amenity.type),
                    fillOpacity: 0.7
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{amenity.name}</strong>
                      <p>Type: {amenity.type.replace('_', ' ')}</p>
                      <p>Distance: {amenity.distance} km</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </>
          )}
        </MapContainer>
      </div>
      
      {state && city && (
        <div className="p-4 bg-card rounded-lg shadow-md border border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Proximity Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust radius to calculate score based on nearby amenities
                </p>
              </div>
              <Badge variant="outline" className="text-base">
                {radius} km
              </Badge>
            </div>
            
            <div className="py-2">
              <Slider
                value={[radius]}
                min={1}
                max={10}
                step={0.5}
                onValueChange={handleRadiusChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 km</span>
                <span>10 km</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {Object.entries(amenitiesByType).map(([type, items]) => (
                <div key={type} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                  {getAmenityIcon(type)}
                  <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {items.length}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Amenities:</span>
                <Badge>{amenities.length}</Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium">Location Score:</span>
                <Badge variant="outline" className={
                  calculateLocationScore(amenities, state).normalized >= 10
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }>
                  {calculateLocationScore(amenities, state).normalized} / {state === "Texas" ? 17 : 15}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
