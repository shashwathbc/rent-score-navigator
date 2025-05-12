
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface SetViewOnChangeProps {
  coords: [number, number]; 
  zoom?: number;
}

const SetViewOnChange = ({ coords, zoom = 12 }: SetViewOnChangeProps) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(coords, zoom);
  }, [coords, zoom, map]);
  
  return null;
};

export default SetViewOnChange;
