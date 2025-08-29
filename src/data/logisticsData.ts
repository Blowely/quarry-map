import { Truck, DeliveryPoint } from '../types/quarry';

// Тестовые грузовики в разных районах Москвы
export const trucks: Truck[] = [
  {
    id: 'truck-1',
    name: 'КАМАЗ-5320',
    type: 'КАМАЗ',
    capacity: 8,
    fuelConsumption: 25,
    fuelPrice: 55,
    driverSalary: 500,
    coordinates: [55.7558, 37.6176], // Центр Москвы
    isAvailable: true
  },
  {
    id: 'truck-2',
    name: 'КАМАЗ-65115',
    type: 'КАМАЗ',
    capacity: 15,
    fuelConsumption: 32,
    fuelPrice: 55,
    driverSalary: 600,
    coordinates: [55.7800, 37.5800], // Север Москвы
    isAvailable: true
  },
  {
    id: 'truck-3',
    name: 'МАЗ-5337',
    type: 'МАЗ',
    capacity: 12,
    fuelConsumption: 28,
    fuelPrice: 55,
    driverSalary: 550,
    coordinates: [55.7200, 37.6500], // Юг Москвы
    isAvailable: false
  },
  {
    id: 'truck-4',
    name: 'ГАЗ-3307',
    type: 'ГАЗ',
    capacity: 4.5,
    fuelConsumption: 18,
    fuelPrice: 55,
    driverSalary: 400,
    coordinates: [55.7500, 37.5500], // Запад Москвы
    isAvailable: true
  }
];

// Тестовые точки доставки в разных районах Москвы
export const deliveryPoints: DeliveryPoint[] = [
  {
    id: 'delivery-1',
    name: 'Строительная площадка "Москва-Сити"',
    address: 'Пресненская наб., 8, стр. 1, Москва',
    coordinates: [55.7494, 37.5364], // Москва-Сити
    material: 'Песок',
    quantity: 25,
    urgency: 'high'
  },
  {
    id: 'delivery-2',
    name: 'ЖК "Парк Легенд"',
    address: 'Ленинградское ш., 39, стр. 1, Москва',
    coordinates: [55.8344, 37.4864], // Северо-запад
    material: 'Щебень',
    quantity: 18,
    urgency: 'medium'
  },
  {
    id: 'delivery-3',
    name: 'ТЦ "Афимолл"',
    address: 'Пресненская наб., 2, Москва',
    coordinates: [55.7485, 37.5374], // Москва-Сити
    material: 'Песок',
    quantity: 12,
    urgency: 'low'
  },
  {
    id: 'delivery-4',
    name: 'Офисный центр "Экспоцентр"',
    address: 'Краснопресненская наб., 14, Москва',
    coordinates: [55.7474, 37.5384], // Москва-Сити
    material: 'Щебень',
    quantity: 30,
    urgency: 'high'
  },
  {
    id: 'delivery-5',
    name: 'Стройплощадка "Зарядье"',
    address: 'ул. Варварка, 6, Москва',
    coordinates: [55.7500, 37.6300], // Восток Москвы
    material: 'Песок',
    quantity: 20,
    urgency: 'medium'
  },
  {
    id: 'delivery-6',
    name: 'ЖК "Сколково Парк"',
    address: 'Сколковское ш., 31, Москва',
    coordinates: [55.7000, 37.3500], // Запад Москвы
    material: 'Щебень',
    quantity: 15,
    urgency: 'low'
  }
];

// Функция расчета расстояния между двумя точками (формула гаверсинуса)
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Функция расчета стоимости маршрута
export function calculateRouteCost(
  distance: number,
  truck: Truck,
  time: number
): { fuelCost: number; driverCost: number; totalCost: number } {
  const fuelCost = (distance / 100) * truck.fuelConsumption * truck.fuelPrice;
  const driverCost = time * truck.driverSalary;
  const totalCost = fuelCost + driverCost;
  
  return { fuelCost, driverCost, totalCost };
}
