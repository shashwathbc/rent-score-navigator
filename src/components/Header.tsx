
import { ThemeToggle } from "./ThemeToggle";
import { useLocation } from "@/contexts/LocationContext";
import { useQAP } from "@/contexts/QAPContext";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { state, city, zipCode } = useLocation();
  const { scorePercentage } = useQAP();
  
  const locationText = [state, city, zipCode].filter(Boolean).join(", ");

  return (
    <header className="w-full py-4 px-6 border-b shadow-sm bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">LIHTC QAP Score Calculator</h1>
          {scorePercentage > 0 && (
            <Badge variant="outline" className="ml-2">
              Score: {scorePercentage.toFixed(1)}%
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          {locationText && (
            <span className="text-sm font-medium text-muted-foreground">
              {locationText}
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
