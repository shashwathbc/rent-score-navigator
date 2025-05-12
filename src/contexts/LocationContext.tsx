
import { createContext, useContext, useState, ReactNode } from "react";

interface LocationContextType {
  state: string;
  city: string;
  zipCode: string;
  address: string;
  setLocation: (location: { state?: string; city?: string; zipCode?: string; address?: string }) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const setLocation = (location: { state?: string; city?: string; zipCode?: string; address?: string }) => {
    if (location.state !== undefined) setState(location.state);
    if (location.city !== undefined) setCity(location.city);
    if (location.zipCode !== undefined) setZipCode(location.zipCode);
    if (location.address !== undefined) setAddress(location.address);
  };

  return (
    <LocationContext.Provider
      value={{ state, city, zipCode, address, setLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
