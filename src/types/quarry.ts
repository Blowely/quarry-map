export interface Quarry {
  id: string;
  name: string;
  company: string;
  materials: Material[];
  contact: string;
  coordinates: [number, number];
  transport?: string;
  schedule?: string;
}

export interface QuarryPoint {
  id: string;
  name: string;
  company: string;
  materials: Material[];
  contact: string;
  coordinates: [number, number];
  transport?: string;
  schedule?: string;
  hasTariff?: boolean;
}

export interface Material {
  name: string;
  price?: string;
  unit?: string;
  density?: string;
  module?: string;
  fraction?: string;
}

export interface Truck {
  id: string;
  name: string;
  type: 'КАМАЗ' | 'МАЗ' | 'ГАЗ';
  capacity: number; // тонн
  fuelConsumption: number; // л/100км
  fuelPrice: number; // руб/л
  driverSalary: number; // руб/час
  coordinates: [number, number];
  isAvailable: boolean;
}

export interface DeliveryPoint {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  material: string;
  quantity: number; // тонн
  urgency: 'low' | 'medium' | 'high';
}

export interface Route {
  id: string;
  truck: Truck;
  quarry: QuarryPoint;
  deliveryPoint: DeliveryPoint;
  distance: number; // км
  time: number; // часы
  cost: number; // руб
  fuelCost: number; // руб
  driverCost: number; // руб
  totalCost: number; // руб
}
