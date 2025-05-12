
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { QAPData, CategoryScore, texasQAPData, californiaQAPData } from "../data/qapData";
import { useLocation } from "./LocationContext";

interface QAPContextType {
  qapData: QAPData;
  updateCategoryScore: (categoryId: string, points: number) => void;
  scorePercentage: number;
  totalScore: number;
}

const QAPContext = createContext<QAPContextType | undefined>(undefined);

export function QAPProvider({ children }: { children: ReactNode }) {
  const { state } = useLocation();
  const [qapData, setQapData] = useState<QAPData>(texasQAPData);
  const [scorePercentage, setScorePercentage] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);

  // Update QAP data based on selected state
  useEffect(() => {
    if (state === "California") {
      setQapData({...californiaQAPData});
    } else if (state === "Texas") {
      setQapData({...texasQAPData});
    }
  }, [state]);

  // Calculate score percentage whenever qapData changes
  useEffect(() => {
    const currentTotalScore = qapData.categories.reduce(
      (sum, category) => sum + category.currentPoints,
      0
    );
    setTotalScore(currentTotalScore);
    setScorePercentage(
      qapData.totalMaxPoints > 0
        ? (currentTotalScore / qapData.totalMaxPoints) * 100
        : 0
    );
  }, [qapData]);

  const updateCategoryScore = (categoryId: string, points: number) => {
    setQapData(prevData => {
      const updatedCategories = prevData.categories.map(category => {
        if (category.id === categoryId) {
          // Ensure points don't exceed max
          const validPoints = Math.min(points, category.maxPoints);
          return { ...category, currentPoints: validPoints };
        }
        return category;
      });
      
      return { ...prevData, categories: updatedCategories };
    });
  };

  return (
    <QAPContext.Provider value={{ qapData, updateCategoryScore, scorePercentage, totalScore }}>
      {children}
    </QAPContext.Provider>
  );
}

export function useQAP() {
  const context = useContext(QAPContext);
  if (context === undefined) {
    throw new Error("useQAP must be used within a QAPProvider");
  }
  return context;
}
