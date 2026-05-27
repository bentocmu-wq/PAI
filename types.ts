export interface BradenScore {
  sensoryPerception: number;
  moisture: number;
  activity: number;
  mobility: number;
  nutrition: number;
  frictionShear: number;
}

export interface PushScore {
  length: number;
  width: number;
  depth: number; // เพิ่มความลึก
  exudateAmount: number;
  tissueType: number;
}

export interface TissuePercentages {
  necrotic: number;
  slough: number;
  granulation: number;
  epithelial: number;
}

export interface WoundAnalysisResult {
  visualEvidence: string;
  anatomicalLocation: string;
  infectionSigns: string[];
  stage: string;
  tissueType: string;
  dimensionsDescription: string;
  exudateLevel: string;
  surroundingSkin: string;
  aiConfidence: string;
  careRecommendations: string[];
  tissuePercentages: TissuePercentages;
  visualBradenHints: {
    moistureObservation: string;
    frictionObservation: string;
  };
  pushToolHints: {
    exudateScore: number;
    tissueScore: number;
    reasoning: string;
    estimatedLength: number;
    estimatedWidth: number;
  };
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  MANUAL_BRADEN = 'MANUAL_BRADEN',
  MANUAL_PUSH = 'MANUAL_PUSH',
  AR_CAPTURE = 'AR_CAPTURE'
}