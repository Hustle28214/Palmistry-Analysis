import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PalmAnalysis {
  id: string;
  imageUrl: string;
  timestamp: number;
  result: {
    handType: string;
    lifeLine: string;
    heartLine: string;
    headLine: string;
    personality: string[];
    fortune: string;
    health: string;
    career: string;
    love: string;
  };
}

interface AppState {
  analyses: PalmAnalysis[];
  currentImage: string | null;
  isAnalyzing: boolean;
  addAnalysis: (analysis: PalmAnalysis) => void;
  setCurrentImage: (imageUrl: string | null) => void;
  setAnalyzing: (analyzing: boolean) => void;
  deleteAnalysis: (id: string) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      analyses: [],
      currentImage: null,
      isAnalyzing: false,
      
      addAnalysis: (analysis) => {
        set((state) => ({
          analyses: [analysis, ...state.analyses]
        }));
      },
      
      setCurrentImage: (imageUrl) => {
        set({ currentImage: imageUrl });
      },
      
      setAnalyzing: (analyzing) => {
        set({ isAnalyzing: analyzing });
      },
      
      deleteAnalysis: (id) => {
        set((state) => ({
          analyses: state.analyses.filter(analysis => analysis.id !== id)
        }));
      },
      
      clearHistory: () => {
        set({ analyses: [] });
      }
    }),
    {
      name: 'palm-analysis-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ analyses: state.analyses })
    }
  )
);