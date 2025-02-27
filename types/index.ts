type Landmark = {
  x: number;
  y: number;
  z: number;
};

type HandLandmarks = {
  // hand: 'Right' | 'Left';
  landmarks: Landmark[];
};
