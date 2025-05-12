
import { useQAP } from "../contexts/QAPContext";
import { useLocation } from "../contexts/LocationContext";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ScoreCalculator = () => {
  const { qapData, updateCategoryScore, scorePercentage, totalScore } = useQAP();
  const { state } = useLocation();
  const { toast } = useToast();

  const handleScoreChange = (categoryId: string, value: number[]) => {
    const points = value[0];
    updateCategoryScore(categoryId, points);
    
    toast({
      title: "Score Updated",
      description: `${categoryId} score set to ${points} points`,
      duration: 1500,
    });
  };

  if (!state) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>QAP Score Calculator</CardTitle>
          <CardDescription>Select a state to begin calculating your QAP score</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="sticky top-0 z-10 bg-card border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>QAP Score Calculator</CardTitle>
            <CardDescription>
              {state} QAP Scoring Criteria ({qapData.totalMaxPoints} max points)
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`text-lg px-3 py-1 ${
              scorePercentage >= 80 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                : scorePercentage >= 60
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {scorePercentage.toFixed(1)}%
          </Badge>
        </div>
        <div className="mt-4">
          <Progress value={scorePercentage} className="h-2" />
          <p className="text-center mt-2 text-sm text-muted-foreground">
            {totalScore} of {qapData.totalMaxPoints} points
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-6">
          {qapData.categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={category.id} className="text-sm font-medium">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="border-b border-dotted border-muted-foreground cursor-help">
                          {category.name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{category.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="text-sm font-medium">
                  {category.currentPoints} / {category.maxPoints}
                </div>
              </div>
              <Slider
                id={category.id}
                defaultValue={[0]}
                min={0}
                max={category.maxPoints}
                step={1}
                value={[category.currentPoints]}
                onValueChange={(value) => handleScoreChange(category.id, value)}
                className="py-4"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCalculator;
