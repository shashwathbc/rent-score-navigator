import { useState, useEffect } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { useQAP } from "@/contexts/QAPContext";
import { Slider } from "@/components/ui/slider";
import { CircleMarker, Popup, Circle, useMap } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { School, Hospital, Store, Restaurant, Bus, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock coordinates for demonstration
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

// Mock amenity data generator (in a real app, this would be an API call to OSM)
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

// Component to show the radius on the map
const RadiusCircle = ({ center, radius }: { center: [number, number]; radius: number }) => {
  const map = useMap();
  
  useEffect(() => {
    const circle = new LeafletCircle(latLng(center[0], center[1]), {
      radius: radius * 1000, // Convert km to meters
      color: 'rgba(59, 130, 246, 0.5)',
      fillColor: 'rgba(59, 130, 246, 0.2)',
      fillOpacity: 0.3,
      weight: 2
    });
    
    circle.addTo(map);
    map.fitBounds(circle.getBounds());
    
    return () => {
      map.removeLayer(circle);
    };
  }, [center, radius, map]);
  
  return null;
};

// Component to display amenities on the map
const AmenityMarkers = ({ amenities }: { amenities: any[] }) => {
  return (
    <>
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
  );
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

const ProximityAnalysis = () => {
  const { state, city } = useLocation();
  const { qapData, updateCategoryScore } = useQAP();
  const { toast } = useToast();
  
  const [radius, setRadius] = useState<number>(1);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  // Update position when location changes
  useEffect(() => {
    if (state && city && mockCoordinates[state]?.[city]) {
      setPosition(mockCoordinates[state][city]);
    } else {
      setPosition(null);
    }
  }, [state, city]);
  
  // Update amenities when position or radius changes
  useEffect(() => {
    if (position) {
      const newAmenities = generateMockAmenities(position, radius);
      setAmenities(newAmenities);
      
      // Calculate and update location score
      const score = calculateLocationScore(newAmenities, state);
      updateCategoryScore("location", score.normalized);
      
      toast({
        title: "Amenities Updated",
        description: `Found ${newAmenities.length} amenities within ${radius} km radius`,
        duration: 1500,
      });
    }
  }, [position, radius, state, updateCategoryScore, toast]);
  
  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };
  
  if (!position) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proximity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a state and city to view nearby amenities</p>
        </CardContent>
      </Card>
    );
  }
  
  // Group amenities by type
  const amenitiesByType: Record<string, any[]> = {};
  amenities.forEach(amenity => {
    if (!amenitiesByType[amenity.type]) {
      amenitiesByType[amenity.type] = [];
    }
    amenitiesByType[amenity.type].push(amenity);
  });
  
  return (
    <div>
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
        
        {/* Display the radius circle on the map */}
        {position && (
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
        )}
        
        {/* Display amenity markers on the map */}
        {position && amenities.map((amenity) => (
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
  );
};

export default ProximityAnalysis;
