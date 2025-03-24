export interface Document {
    id: string;
    title: string;
    type: 'pdf' | 'url';
    contentPath: string;
    currentPosition?: number;
  }
  
  export interface ReaderSettings {
    readingMode: 'face_detection' | 'accelerometer';
    scrollSpeed: number;
    theme: 'light' | 'dark';
  }
  
  export interface ReadingProgress {
    position: number;
    timestamp: Date;
  }