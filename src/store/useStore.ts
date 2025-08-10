import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PalmAnalysis {
  id: string;
  imageUrl: string;
  timestamp: number;
  result: {
    // Legacy fields for backward compatibility
    handType?: string;
    lifeLine?: string;
    heartLine?: string;
    headLine?: string;
    personality?: string[];
    fortune?: string;
    health?: string;
    career?: string;
    love?: string;
    mbtiType?: string;
    mbtiDescription?: string;
    
    // New detailed structure
    basicFeatures?: {
      handType: string;
      handSize: string;
      skinTexture: string;
      palmThickness: string;
      fingerLength: string;
      nailShape: string;
      thumbAnalysis: string;
    };
    
    palmLines?: {
      lifeLine?: {
        description: string;
        healthImplications: string;
        energyLevel: string;
        lifeStages: string;
      };
      heartLine?: {
        description: string;
        emotionalStyle: string;
        relationshipPattern: string;
        empathyLevel: string;
      };
      headLine?: {
        description: string;
        thinkingStyle: string;
        decisionMaking: string;
        learningStyle: string;
        creativity: string;
      };
      fateLine?: string;
      marriageLine?: string;
      otherLines?: string;
    };
    
    psychologicalProfile?: {
      mbtiPrediction: string;
      cognitiveStyle: string;
      emotionalPattern: string;
      behaviorTendency: string;
      stressResponse: string;
      socialStyle: string;
      motivationDrivers: string;
      unconsciousTraits: string;
      // Legacy fields
      thinkingPattern?: string;
      decisionStyle?: string;
      socialTendency?: string;
      communicationStyle?: string;
    };
    
    detailedAnalysis?: {
      strengths: string[];
      challenges: string[];
      personalityTraits: string[];
      communicationStyle: string;
      leadershipPotential: string;
      adaptability: string;
      handTexture?: string;
      fingerFlexibility?: string;
      palmTemperature?: string;
      vascularDistribution?: string;
      muscleDevelopment?: string;
      skinElasticity?: string;
      nailHealth?: string;
      bloodVessels?: string;
      // Legacy fields
      fingerProportions?: string;
      nailShape?: string;
      palmThickness?: string;
      skinTexture?: string;
      mountAnalysis?: string;
      minorLines?: string;
    };
    
    practicalAdvice?: {
       careerGuidance: {
         suitableFields: string[];
         workStyle: string;
         developmentPath: string;
         skillsToImprove: string[];
         industryRecommendations?: string;
         leadershipStyle?: string;
       };
       relationshipAdvice: {
         loveStyle: string;
         communicationTips: string;
         conflictResolution: string;
         partnerCompatibility?: string;
         familyRelations?: string;
       };
       personalDevelopment: {
         learningRecommendations: string;
         timeManagement: string;
         stressManagement: string;
         healthTips: string;
         emotionalIntelligence?: string;
         creativityDevelopment?: string;
       };
       actionPlan: {
         shortTerm: string[];
         longTerm: string[];
         dailyPractices: string[];
         weeklyGoals?: string[];
         monthlyTargets?: string[];
       };
       // Legacy fields
       careerSuggestions?: string[];
       learningTips?: string[];
       legacyRelationshipAdvice?: string[];
       personalGrowth?: string[];
     };
    
    scientificBasis?: {
      psychologyTheory: string;
      behaviorScience: string;
      neuroscience: string;
    };
    
    lifeExperiences?: {
      careerHistory: string;
      educationalBackground: string;
      majorLifeEvents: string;
      hobbiesAndInterests: string;
      travelExperiences: string;
      relationshipHistory: string;
      healthChallenges: string;
      personalGrowth: string;
    };
    
    lifeStages?: {
      childhood: {
        period: string;
        keyEvents: string[];
        personalityDevelopment: string;
        challenges: string[];
        achievements: string[];
      };
      adolescence: {
        period: string;
        keyEvents: string[];
        personalityDevelopment: string;
        challenges: string[];
        achievements: string[];
      };
      youngAdult: {
        period: string;
        keyEvents: string[];
        personalityDevelopment: string;
        challenges: string[];
        achievements: string[];
      };
      middleAge: {
        period: string;
        keyEvents: string[];
        personalityDevelopment: string;
        challenges: string[];
        achievements: string[];
      };
      matureAge: {
        period: string;
        keyEvents: string[];
        personalityDevelopment: string;
        challenges: string[];
        achievements: string[];
      };
    };
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