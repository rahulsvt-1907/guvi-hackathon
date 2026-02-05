
export enum Language {
  Tamil = 'Tamil',
  English = 'English',
  Hindi = 'Hindi',
  Malayalam = 'Malayalam',
  Telugu = 'Telugu'
}

export enum Classification {
  AI_GENERATED = 'AI_GENERATED',
  HUMAN = 'HUMAN'
}

export interface DetectionResponse {
  status: 'success' | 'error';
  language: Language;
  classification: Classification;
  confidenceScore: number;
  explanation: string;
  message?: string;
}

export interface DetectionResult extends DetectionResponse {
  timestamp: string;
  id: string;
  fileName: string;
}

export interface VoiceDetectionRequest {
  language: Language;
  audioFormat: 'mp3';
  audioBase64: string;
}
