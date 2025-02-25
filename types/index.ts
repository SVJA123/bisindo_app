// types/index.ts
export interface HandLandmarks {
    x: number;
    y: number;
    z: number;
  }
  
  export interface HandResults {
    multiHandLandmarks: HandLandmarks[][]; // Array of hands, each with an array of landmarks
  }