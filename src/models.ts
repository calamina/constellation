import * as THREE from "three"

export interface Star {
  model: THREE.Group<THREE.Object3DEventMap>;
  rotate: () => void;
  data?: StarData
}

export interface StarData {
  index: number,
  color: string,
  hue: number,
  name: string,
  scientific: string,
  galaxy: string,
  distance: string,
  type: string,
  inhab: string,
  units: number[]
}