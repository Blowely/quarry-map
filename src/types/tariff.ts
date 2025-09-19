export interface Tariff {
  id: string;
  date: string;
  fromQuarry: string; // "от куда" - название карьера
  toDestination: string; // куда везти
  transportType: string; // вид транспорта
  material: string; // материал
  distance: number; // расстояние в км
  weight: number; // вес в тоннах
  unit: string; // единица измерения (тн, м3)
  fuelConsumption: number; // расход топлива на 100км
  fuelPrice: number; // цена за литр
  fuelCost: number; // затраты на топливо
  driverSalaryPerKm: number; // зп водителя на км
  driverCost: number; // затраты на зп
  driverCostPerDay: number; // затраты на зп день
  profitMargin: number; // норма прибыли
  otherCosts: number; // другие затраты (платон, гаи, платная трасса)
  calculatedTariffPerKm: number; // тариф руб/куб(тн)*км расчет
  calculatedTariff: number; // тариф руб/куб(тн) расчет
  actualTariffPerKm: number; // тариф руб/куб(тн)*км факт
  actualTariff: number; // тариф руб/куб(тн) факт
  actualProfit: number; // прибыль факт
  materialPurchaseCost: number; // стоимость материала закуп
  markup: number; // наценка
  materialSalePrice: number; // цена материала продажа
  materialCost: number; // стоимость материала
  truckWithMaterialCalculated: number; // стоимость машины с материалом расчет
  truckWithMaterialActual: number; // стоимость машины с материалом факт
  tariffWithMaterialCalculated: number; // тариф с материалом расчет
  tariffWithMaterialActual: number; // тариф с материалом факт
  contract: string; // договор
  field: string; // фидель
  hire: string; // наем
  kp: string; // кп
  hireProfit: number; // прибыль наем
  loadingSchedule: string; // график погрузки
  unloadingSchedule: string; // график выгрузки
  company: string; // компания-перевозчик
}

export interface TariffCalculation {
  quarryId: string;
  materialId: string;
  destinationId: string;
  transportType: string;
  distance: number;
  weight: number;
  unit: string;
  
  // Результаты расчета
  materialCost: number; // стоимость материала из карьера
  deliveryCost: number; // стоимость доставки из тарифов
  totalCost: number; // итоговая стоимость
  pricePerUnit: number; // цена за единицу (м3/тн)
  pricePerKm: number; // цена за км
  
  // Детализация
  fuelCost: number;
  driverCost: number;
  otherCosts: number;
  profit: number;
  
  // Информация о карьере
  quarryName: string;
  quarryCompany: string;
  quarryContact: string;
  
  // Информация о материале
  materialName: string;
  materialDensity?: number;
  materialFraction?: string;
  materialModule?: string;
}

export interface Destination {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  region: string;
  type: 'construction' | 'residential' | 'industrial' | 'other';
  workingHours: string;
  contactPerson?: string;
  contactPhone?: string;
}
