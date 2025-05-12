
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { QAPProvider } from "@/contexts/QAPContext";
import Header from "@/components/Header";
import LocationSelector from "@/components/LocationSelector";
import MapView from "@/components/MapView";
import ScoreCalculator from "@/components/ScoreCalculator";
import ReportExport from "@/components/ReportExport";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  return (
    <ThemeProvider>
      <LocationProvider>
        <QAPProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Panel */}
              <div className="space-y-6">
                <LocationSelector />
                <MapView />
                <div className="bg-card p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Export Report</h2>
                  <ReportExport />
                </div>
              </div>
              
              {/* Right Panel */}
              <div>
                <ScoreCalculator />
              </div>
            </main>
            
            <footer className="py-4 px-6 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  LIHTC QAP Score Calculator &copy; {new Date().getFullYear()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Data for demonstration purposes only
                </p>
              </div>
            </footer>
          </div>
        </QAPProvider>
      </LocationProvider>
    </ThemeProvider>
  );
};

export default Index;
