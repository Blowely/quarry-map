export interface Quarry {
  date: string;
  name: string;
  company: string;
  material: string;
  contact: string;
  price: string;
  unit: string;
  density: string;
  module: string;
  filterCoeff: string;
  fraction: string;
  strength: string;
  frostResistance: string;
  coordinates: string;
  transport: string;
  schedule: string;
}

export interface QuarryPoint {
  id: string;
  name: string;
  company: string;
  materials: Material[];
  contact: string;
  coordinates: [number, number];
  transport: string;
  schedule: string;
}

export interface Material {
  name: string;
  price: string;
  unit: string;
  density: string;
  module: string;
  filterCoeff: string;
  fraction: string;
  strength: string;
  frostResistance: string;
}
