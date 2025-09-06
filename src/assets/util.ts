import * as THREE from "three"

export interface Star {
  name: StarName;
  star: THREE.Group<THREE.Object3DEventMap>;
  rotate: () => void;
  data: StarData
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

export type StarName = 'star1' | 'star2' | 'star3'

export const COLORS = { black: "#000000" }

export const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const DOM = {
  root: document.querySelector(':root') as HTMLElement,
  body: document.querySelector('body') as HTMLElement,
  main: document.querySelector('.main') as HTMLElement,
  data: document.querySelector(".data") as HTMLElement,
  next: document.querySelector("#next") as HTMLElement,
  previous: document.querySelector("#previous") as HTMLElement,
  type: document.querySelector('.type') as HTMLElement,
  index: document.querySelector('#index') as HTMLElement,
  indexBox: document.querySelector('.index') as HTMLElement,
  coreFocus: document.querySelector('.coreFocus') as HTMLElement,
  danger: document.querySelector(".danger") as HTMLElement,
  topology: document.querySelector(".topology") as HTMLElement,
  ui: document.querySelector('.data') as HTMLElement,
  vx: document.querySelector('.vx') as HTMLElement,
  ctrl: document.querySelector('.controls') as HTMLElement,
  load: document.querySelector('.loading') as HTMLElement,
  num: document.querySelector('.loadpercent') as HTMLElement,
  graphData: document.querySelector('.graphdata') as HTMLElement,
  control: document.querySelector(".control") as HTMLElement,
  controlText: document.querySelector(".controlText") as HTMLElement,
  symbol: document.querySelector('.symbol') as HTMLElement,
  timedate: document.querySelector(".timedate") as HTMLElement,
  // nodelists
  units: document.querySelectorAll('.unit') as NodeListOf<HTMLElement>,
  coords: document.querySelectorAll('.coord') as NodeListOf<HTMLElement>,
  path: document.querySelectorAll(".path") as NodeListOf<HTMLElement>,
  // animations
  animations: document.getAnimations() as CSSAnimation[],
}