import { Tariff } from '../types/tariff';
import { extractQuarriesFromTariffs } from '../utils/tariffParser';
import { QuarryPoint } from '../types/quarry';

// Демо данные тарифов для тестирования
export const tariffsData: Tariff[] = [
  {
    id: '1',
    date: '2024-01-15',
    fromQuarry: 'Жуково',
    toDestination: 'Москва-Сити',
    transportType: 'Тонар',
    material: 'Песок',
    distance: 45,
    weight: 32,
    unit: 'тн',
    fuelConsumption: 45,
    fuelPrice: 55,
    fuelCost: 2475,
    driverSalaryPerKm: 24,
    driverCost: 1080,
    driverCostPerDay: 3240,
    profitMargin: 15,
    otherCosts: 500,
    calculatedTariffPerKm: 8.5,
    calculatedTariff: 382.5,
    actualTariffPerKm: 8.0,
    actualTariff: 360.0,
    actualProfit: 540,
    materialPurchaseCost: 250,
    markup: 20,
    materialSalePrice: 300,
    materialCost: 9600,
    truckWithMaterialCalculated: 13440,
    truckWithMaterialActual: 13200,
    tariffWithMaterialCalculated: 420.0,
    tariffWithMaterialActual: 412.5,
    contract: 'Договор №123',
    field: 'Поле 1',
    hire: 'Наем',
    kp: 'КП-001',
    hireProfit: 600,
    loadingSchedule: '24/7',
    unloadingSchedule: '8-20',
    company: 'Транспортная компания'
  },
  {
    id: '2',
    date: '2024-01-15',
    fromQuarry: 'Осеево',
    toDestination: 'Южная Рокада',
    transportType: 'Тонар',
    material: 'Песок',
    distance: 65,
    weight: 30,
    unit: 'тн',
    fuelConsumption: 45,
    fuelPrice: 55,
    fuelCost: 3217.5,
    driverSalaryPerKm: 26,
    driverCost: 1690,
    driverCostPerDay: 6760,
    profitMargin: 12,
    otherCosts: 400,
    calculatedTariffPerKm: 7.2,
    calculatedTariff: 216.0,
    actualTariffPerKm: 6.8,
    actualTariff: 204.0,
    actualProfit: 408,
    materialPurchaseCost: 220,
    markup: 18,
    materialSalePrice: 260,
    materialCost: 7800,
    truckWithMaterialCalculated: 12680,
    truckWithMaterialActual: 12240,
    tariffWithMaterialCalculated: 422.7,
    tariffWithMaterialActual: 408.0,
    contract: 'Договор №124',
    field: 'Поле 2',
    hire: 'Наем',
    kp: 'КП-002',
    hireProfit: 480,
    loadingSchedule: '8-20',
    unloadingSchedule: '24/7',
    company: 'Транспортная компания'
  },
  {
    id: '3',
    date: '2024-01-15',
    fromQuarry: 'Аксиньино',
    toDestination: 'Электроугли',
    transportType: 'Одиночка',
    material: 'Песок карьерный',
    distance: 42,
    weight: 28,
    unit: 'тн',
    fuelConsumption: 60,
    fuelPrice: 58,
    fuelCost: 2923.2,
    driverSalaryPerKm: 29,
    driverCost: 1218,
    driverCostPerDay: 6090,
    profitMargin: 18,
    otherCosts: 350,
    calculatedTariffPerKm: 8.1,
    calculatedTariff: 226.8,
    actualTariffPerKm: 7.8,
    actualTariff: 218.4,
    actualProfit: 393,
    materialPurchaseCost: 200,
    markup: 25,
    materialSalePrice: 250,
    materialCost: 7000,
    truckWithMaterialCalculated: 11491.2,
    truckWithMaterialActual: 11351.4,
    tariffWithMaterialCalculated: 410.4,
    tariffWithMaterialActual: 405.4,
    contract: 'Договор №125',
    field: 'Поле 3',
    hire: 'Наем',
    kp: 'КП-003',
    hireProfit: 450,
    loadingSchedule: '24/7',
    unloadingSchedule: '24/7',
    company: 'Транспортная компания'
  }
];

// Функция для загрузки тарифов из CSV файла
export async function loadTariffsFromCSV(): Promise<Tariff[]> {
  try {
    const response = await fetch('/data/tariffs.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    
    // Импортируем парсер динамически
    const { parseTariffCSV } = await import('../utils/tariffParser');
    return parseTariffCSV(csvText);
  } catch (error) {
    console.warn('Не удалось загрузить тарифы из CSV, используем демо данные:', error);
    return tariffsData;
  }
}

// Функция для поиска тарифов по карьеру и материалу
export function findTariffsByQuarryAndMaterial(
  tariffs: Tariff[], 
  quarryName: string, 
  materialName: string
): Tariff[] {
  return tariffs.filter(tariff => 
    tariff.fromQuarry.toLowerCase().includes(quarryName.toLowerCase()) &&
    tariff.material.toLowerCase().includes(materialName.toLowerCase())
  );
}

// Функция для поиска тарифов по направлению
export function findTariffsByDestination(
  tariffs: Tariff[], 
  destinationName: string
): Tariff[] {
  return tariffs.filter(tariff => 
    tariff.toDestination.toLowerCase().includes(destinationName.toLowerCase())
  );
}

// Функция для получения уникальных направлений
export function getUniqueDestinations(tariffs: Tariff[]): string[] {
  const destinations = new Set<string>();
  tariffs.forEach(tariff => {
    if (tariff.toDestination) {
      destinations.add(tariff.toDestination);
    }
  });
  return Array.from(destinations);
}

// Функция для получения уникальных карьеров из тарифов
export function getUniqueQuarriesFromTariffs(tariffs: Tariff[]): string[] {
  const quarries = new Set<string>();
  tariffs.forEach(tariff => {
    if (tariff.fromQuarry) {
      quarries.add(tariff.fromQuarry);
    }
  });
  return Array.from(quarries);
}

// Функция для загрузки карьеров из тарифов
export async function loadQuarriesFromTariffs(): Promise<QuarryPoint[]> {
  try {
    const response = await fetch('/data/tariffs.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    
    // Импортируем парсер динамически
    const { parseTariffCSV } = await import('../utils/tariffParser');
    const tariffs = parseTariffCSV(csvText);
    
    // Извлекаем карьеры из тарифов
    const quarries = extractQuarriesFromTariffs(tariffs);
    
    console.log('Загружено карьеров из тарифов:', quarries.length);
    return quarries;
  } catch (error) {
    console.warn('Не удалось загрузить карьеры из тарифов, используем демо данные:', error);
    return [];
  }
}
