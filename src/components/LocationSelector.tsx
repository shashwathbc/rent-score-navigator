
import { useState, useEffect } from "react";
import { useLocation } from "../contexts/LocationContext";
import { getStateOptions, getCityOptions, getZipCodeOptions } from "../data/locationData";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, MapPin } from "lucide-react";

const LocationSelector = () => {
  const { state, city, zipCode, address, setLocation } = useLocation();
  const [stateOptions, setStateOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [zipCodeOptions, setZipCodeOptions] = useState<string[]>([]);

  // Load initial state options
  useEffect(() => {
    setStateOptions(getStateOptions());
  }, []);

  // Update city options when state changes
  useEffect(() => {
    if (state) {
      setCityOptions(getCityOptions(state));
      setLocation({ city: "", zipCode: "" }); // Reset city and zip when state changes
    } else {
      setCityOptions([]);
    }
  }, [state]);

  // Update zipcode options when city changes
  useEffect(() => {
    if (state && city) {
      setZipCodeOptions(getZipCodeOptions(state, city));
      setLocation({ zipCode: "" }); // Reset zip when city changes
    } else {
      setZipCodeOptions([]);
    }
  }, [city, state]);

  const handleStateChange = (value: string) => {
    setLocation({ state: value });
  };

  const handleCityChange = (value: string) => {
    setLocation({ city: value });
  };

  const handleZipCodeChange = (value: string) => {
    setLocation({ zipCode: value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation({ address: e.target.value });
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Location Selection</h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="state-select">State</Label>
          <Select value={state} onValueChange={handleStateChange}>
            <SelectTrigger id="state-select" className="w-full">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {stateOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city-select">City</Label>
          <Select 
            value={city} 
            onValueChange={handleCityChange} 
            disabled={!state}
          >
            <SelectTrigger id="city-select" className="w-full">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip-select">Zip Code</Label>
          <Select 
            value={zipCode} 
            onValueChange={handleZipCodeChange} 
            disabled={!city}
          >
            <SelectTrigger id="zip-select" className="w-full">
              <SelectValue placeholder="Select zip code" />
            </SelectTrigger>
            <SelectContent>
              {zipCodeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address-input">Address</Label>
          <div className="relative">
            <Input
              id="address-input"
              placeholder="Enter full address"
              value={address}
              onChange={handleAddressChange}
              className="pl-9"
            />
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
