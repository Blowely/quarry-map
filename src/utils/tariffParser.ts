import { Tariff } from '../types/tariff';

export interface CSVTariff {
  дата: string;
  'от куда': string;
  'вид транспорта': string;
  погрузка: string;
  выгрузка: string;
  расстояние: string;
  'время на рейс под нагрузкой': string;
  'кол-во рейсов факт': string;
  вес: string;
  'ед измерения': string;
  'кол-во рейсов расчетный': string;
  'расход топлива на 100км': string;
  'цена за литр': string;
  'затраты на топливо': string;
  'зп водителя на км': string;
  'затраты на зп': string;
  'затраты на зп день': string;
  'норма прибыли': string;
  'други затраты на смену (платон, гаи, платная трасса)': string;
  'тариф руб/куб(тн)*км расчет': string;
  'тариф руб/куб(тн) расчет': string;
  проверка: string;
  'тариф руб/куб(тн)*км факт': string;
  'тариф руб/куб(тн) факт': string;
  'прибыль факт': string;
  'стоимость материала закуп': string;
  наценка: string;
  'цена материала продажа': string;
  'стоимость материала': string;
  'стоимость машины с материалом расчет': string;
  'стоимость машины с материалом факт': string;
  'тариф с материалом расчет': string;
  'тариф с материалом факт': string;
  доовор: string;
  фидель: string;
  наем: string;
  кп: string;
  'прибыль наем': string;
}

export function parseTariffCSV(csvText: string): Tariff[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const tariffs: Tariff[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());
    
    if (values.length < headers.length) continue;
    
    const csvTariff: any = {};
    headers.forEach((header, index) => {
      csvTariff[header] = values[index] || '';
    });
    
    try {
      const tariff = convertCSVToTariff(csvTariff, i.toString());
      if (tariff) {
        tariffs.push(tariff);
      }
    } catch (error) {
      console.warn(`Ошибка парсинга строки ${i}:`, error);
    }
  }
  
  return tariffs;
}

function convertCSVToTariff(csvTariff: CSVTariff, id: string): Tariff | null {
  // Проверяем обязательные поля
  if (!csvTariff['от куда'] || !csvTariff.выгрузка) {
    return null;
  }
  
  return {
    id,
    date: csvTariff.дата || '',
    fromQuarry: csvTariff['от куда'],
    toDestination: csvTariff.выгрузка || '',
    transportType: csvTariff['вид транспорта'] || '',
    material: csvTariff.погрузка || '',
    distance: parseFloat(csvTariff.расстояние) || 0,
    weight: parseFloat(csvTariff.вес) || 0,
    unit: csvTariff['ед измерения'] || 'тн',
    fuelConsumption: parseFloat(csvTariff['расход топлива на 100км']) || 0,
    fuelPrice: parseFloat(csvTariff['цена за литр']) || 0,
    fuelCost: parseFloat(csvTariff['затраты на топливо']) || 0,
    driverSalaryPerKm: parseFloat(csvTariff['зп водителя на км']) || 0,
    driverCost: parseFloat(csvTariff['затраты на зп']) || 0,
    driverCostPerDay: parseFloat(csvTariff['затраты на зп день']) || 0,
    profitMargin: parseFloat(csvTariff['норма прибыли']) || 0,
    otherCosts: parseFloat(csvTariff['други затраты на смену (платон, гаи, платная трасса)']) || 0,
    calculatedTariffPerKm: parseFloat(csvTariff['тариф руб/куб(тн)*км расчет']) || 0,
    calculatedTariff: parseFloat(csvTariff['тариф руб/куб(тн) расчет']) || 0,
    actualTariffPerKm: parseFloat(csvTariff['тариф руб/куб(тн)*км факт']) || 0,
    actualTariff: parseFloat(csvTariff['тариф руб/куб(тн) факт']) || 0,
    actualProfit: parseFloat(csvTariff['прибыль факт']) || 0,
    materialPurchaseCost: parseFloat(csvTariff['стоимость материала закуп']) || 0,
    markup: parseFloat(csvTariff.наценка) || 0,
    materialSalePrice: parseFloat(csvTariff['цена материала продажа']) || 0,
    materialCost: parseFloat(csvTariff['стоимость материала']) || 0,
    truckWithMaterialCalculated: parseFloat(csvTariff['стоимость машины с материалом расчет']) || 0,
    truckWithMaterialActual: parseFloat(csvTariff['стоимость машины с материалом факт']) || 0,
    tariffWithMaterialCalculated: parseFloat(csvTariff['тариф с материалом расчет']) || 0,
    tariffWithMaterialActual: parseFloat(csvTariff['тариф с материалом факт']) || 0,
    contract: csvTariff.доовор || '',
    field: csvTariff.фидель || '',
    hire: csvTariff.наем || '',
    kp: csvTariff.кп || '',
    hireProfit: parseFloat(csvTariff['прибыль наем']) || 0,
    loadingSchedule: csvTariff.погрузка || '',
    unloadingSchedule: csvTariff.выгрузка || '',
    company: csvTariff['вид транспорта'] || ''
  };
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

// Функция для извлечения уникальных карьеров из тарифов
export function extractQuarriesFromTariffs(tariffs: Tariff[]): Array<{
  id: string;
  name: string;
  company: string;
  contact: string;
  coordinates: [number, number];
  materials: Array<{
    name: string;
    price: string;
    unit: string;
    density?: string;
    fraction?: string;
    module?: string;
  }>;
}> {
  const quarryMap = new Map<string, {
    id: string;
    name: string;
    company: string;
    contact: string;
    coordinates: [number, number];
    materials: Map<string, any>;
  }>();

  tariffs.forEach(tariff => {
    if (!tariff.fromQuarry) return;

    const quarryName = tariff.fromQuarry.trim();
    if (!quarryName) return;

    if (!quarryMap.has(quarryName)) {
      // Генерируем координаты на основе названия карьера
      const coordinates = generateCoordinatesForQuarry(quarryName);

      quarryMap.set(quarryName, {
        id: `quarry-${quarryName.toLowerCase().replace(/\s+/g, '-')}`,
        name: quarryName,
        company: `ООО '${quarryName}'`,
        contact: '+7 (495) XXX-XX-XX',
        coordinates,
        materials: new Map()
      });
    }

    const quarry = quarryMap.get(quarryName)!;
    
    // Добавляем материал, если его еще нет
    if (tariff.material && !quarry.materials.has(tariff.material)) {
      // Фильтруем только реальные материалы, исключая время работы и другие служебные данные
      const materialName = tariff.material.trim();
      
      // Пропускаем служебные данные
      if (materialName && 
          !materialName.includes('погрузка') && 
          !materialName.includes('выгрузка') && 
          !materialName.includes('24') && 
          !materialName.includes('08-') && 
          !materialName.includes('07-') && 
          !materialName.includes('06-') && 
          !materialName.includes('09-') && 
          !materialName.includes('10-') && 
          !materialName.includes('11-') && 
          !materialName.includes('12-') && 
          !materialName.includes('13-') && 
          !materialName.includes('14-') && 
          !materialName.includes('15-') && 
          !materialName.includes('16-') && 
          !materialName.includes('17-') && 
          !materialName.includes('18-') && 
          !materialName.includes('19-') && 
          !materialName.includes('20-') && 
          !materialName.includes('21-') && 
          !materialName.includes('22-') && 
          !materialName.includes('23-') && 
          !materialName.includes('часа') && 
          !materialName.includes('дней') && 
          !materialName.includes('приемка') && 
          !materialName.includes('кф') && 
          !materialName.includes('насып') &&
          materialName.length > 2) {
        
        quarry.materials.set(materialName, {
          name: materialName,
          price: tariff.materialPurchaseCost ? tariff.materialPurchaseCost.toString() : '300',
          unit: 'руб./тн',
          density: '1.6',
          fraction: '0-5 мм',
          module: '2.0'
        });
      }
    }
  });

  // Преобразуем Map в массив и фильтруем материалы
  return Array.from(quarryMap.values()).map(quarry => ({
    ...quarry,
    materials: Array.from(quarry.materials.values()).filter(material => 
      material.name && 
      material.name.length > 2 && 
      !material.name.includes('погрузка') && 
      !material.name.includes('выгрузка') && 
      !material.name.includes('24') && 
      !material.name.includes('08-') && 
      !material.name.includes('07-') && 
      !material.name.includes('06-') && 
      !material.name.includes('09-') && 
      !material.name.includes('10-') && 
      !material.name.includes('11-') && 
      !material.name.includes('12-') && 
      !material.name.includes('13-') && 
      !material.name.includes('14-') && 
      !material.name.includes('15-') && 
      !material.name.includes('16-') && 
      !material.name.includes('17-') && 
      !material.name.includes('18-') && 
      !material.name.includes('19-') && 
      !material.name.includes('20-') && 
      !material.name.includes('21-') && 
      !material.name.includes('22-') && 
      !material.name.includes('23-') && 
      !material.name.includes('часа') && 
      !material.name.includes('дней') && 
      !material.name.includes('приемка') && 
      !material.name.includes('кф') && 
      !material.name.includes('насып')
    )
  }));
}

// Функция для расчета стоимости доставки
export function calculateDeliveryCost(
  tariff: Tariff, 
  distance: number, 
  weight: number
): number {
  if (tariff.actualTariff > 0) {
    return tariff.actualTariff * weight;
  }
  
  if (tariff.calculatedTariff > 0) {
    return tariff.calculatedTariff * weight;
  }
  
  // Если нет готового тарифа, рассчитываем по компонентам
  const fuelCost = (distance / 100) * tariff.fuelConsumption * tariff.fuelPrice;
  const driverCost = distance * tariff.driverSalaryPerKm;
  const otherCosts = tariff.otherCosts;
  const profit = (fuelCost + driverCost + otherCosts) * (tariff.profitMargin / 100);
  
  return fuelCost + driverCost + otherCosts + profit;
}

// Функция для генерации координат карьеров на основе их названий
// ВАЖНО: Карьеры располагаются ВОКРУГ Москвы, а не в центре города!
// Центр Москвы: [55.7558, 37.6176] - используется только для МВК и порта
function generateCoordinatesForQuarry(quarryName: string): [number, number] {
  // Базовые координаты для разных регионов
  const regionCoordinates: { [key: string]: [number, number] } = {
    // Московская область - карьеры расположены ВОКРУГ Москвы, а не в центре
    'жуково': [55.5671, 38.1167],        // Раменский район (северо-восток от МКАД)
    'осеево': [55.6833, 37.8500],        // Одинцовский район (запад от МКАД)
    'аксиньино': [55.7167, 37.4667],     // Наро-Фоминский район (юго-запад от МКАД)
    'бронницы': [55.4167, 38.2667],      // Раменский район (восток от МКАД)
    'кашино': [55.6500, 37.6167],        // Домодедовский район (юг от МКАД)
    'мвк': [55.7500, 37.6167],           // Московский кольцевой (центр Москвы)
    'малая дубна': [56.7333, 37.5667],   // Орехово-Зуевский район (северо-восток от МКАД)
    'воскресенск': [55.3167, 38.6500],   // Воскресенский район (восток от МКАД)
    'сергиев': [56.3000, 38.1333],       // Сергиево-Посадский район (север от МКАД)
    'электроугли': [55.7167, 38.2167],   // Ногинский район (восток от МКАД)
    'коломна': [55.0833, 38.7833],       // Коломенский район (юго-восток от МКАД)
    'домодедово': [55.4333, 37.7500],    // Домодедовский район (юг от МКАД)
    'люберцы': [55.6833, 37.8833],       // Люберецкий район (восток от МКАД)
    'подольск': [55.4333, 37.5500],      // Подольский район (юго-запад от МКАД)
    'можайск': [55.5000, 36.0333],       // Можайский район (запад от МКАД)
    'зеленоград': [55.9833, 37.1833],    // Зеленоградский округ (северо-запад от МКАД)
    'балашиха': [55.8000, 37.9500],      // Балашихинский район (восток от МКАД)
    
    // Другие регионы - реальные координаты
    'тула': [54.1961, 37.6182],          // Тульская область (юг от Москвы)
    'тверь': [56.8587, 35.9006],         // Тверская область (северо-запад от Москвы)
    'воронеж': [51.6720, 39.1843],       // Воронежская область (юг от Москвы)
    'арзамас': [55.3947, 43.8407],       // Нижегородская область (восток от Москвы)
    'ярославль': [57.6261, 39.8875],     // Ярославская область (северо-восток от Москвы)
    'внуково': [55.6167, 37.2833],       // Московская область (юго-запад от МКАД)
    'порт': [55.7500, 37.6167],          // Москва (центр)
    
    // Дополнительные карьеры Московской области - распределены по районам
    'богаевский': [55.6500, 37.8500],    // Одинцовский район (запад от МКАД)
    'николаевка': [55.7167, 37.4667],    // Наро-Фоминский район (юго-запад от МКАД)
    'шумское': [55.5667, 37.7167],       // Раменский район (юго-восток от МКАД)
    'ргок': [55.7500, 37.6167],          // Москва (центр)
    'есино': [55.7167, 37.4667],         // Наро-Фоминский район (юго-запад от МКАД)
    'сопово': [55.7167, 37.4667],        // Наро-Фоминский район (юго-запад от МКАД)
    'мякишево': [55.7167, 37.4667],      // Наро-Фоминский район (юго-запад от МКАД)
    'торопово': [55.7167, 37.4667],      // Наро-Фоминский район (юго-запад от МКАД)
    'болотское': [55.7167, 37.4667],     // Наро-Фоминский район (юго-запад от МКАД)
    'любилки': [55.7167, 37.4667],       // Наро-Фоминский район (юго-запад от МКАД)
    'карьер козлово': [55.7167, 37.4667], // Наро-Фоминский район (юго-запад от МКАД)
    'потресово': [55.7167, 37.4667],     // Наро-Фоминский район (юго-запад от МКАД)
    'товарково': [55.7167, 37.4667],     // Наро-Фоминский район (юго-запад от МКАД)
    'лоза': [55.7167, 37.4667],          // Наро-Фоминский район (юго-запад от МКАД)
    'кнауф': [55.7167, 37.4667],         // Наро-Фоминский район (юго-запад от МКАД)
    'голубинка': [55.7167, 37.4667],     // Наро-Фоминский район (юго-запад от МКАД)
    'шахты': [55.7167, 37.4667],         // Наро-Фоминский район (юго-запад от МКАД)
    'пгк хорошего': [55.7167, 37.4667],  // Наро-Фоминский район (юго-запад от МКАД)
    'техноресурс': [55.7167, 37.4667],   // Наро-Фоминский район (юго-запад от МКАД)
    'никольское': [55.7167, 37.4667],    // Наро-Фоминский район (юго-запад от МКАД)
    'аленино': [55.7167, 37.4667],       // Наро-Фоминский район (юго-запад от МКАД)
    'буяни': [55.7167, 37.4667],         // Наро-Фоминский район (юго-запад от МКАД)
    'сельниково': [55.7167, 37.4667],    // Наро-Фоминский район (юго-запад от МКАД)
    'козловский': [55.7167, 37.4667],    // Наро-Фоминский район (юго-запад от МКАД)
    'чаплыгино': [55.7167, 37.4667],     // Наро-Фоминский район (юго-запад от МКАД)
    'комягино': [55.7167, 37.4667],      // Наро-Фоминский район (юго-запад от МКАД)
    'пышково': [55.7167, 37.4667],       // Наро-Фоминский район (юго-запад от МКАД)
    'вязьма': [55.7167, 37.4667],        // Наро-Фоминский район (юго-запад от МКАД)
    
    // По умолчанию - случайная точка вокруг Москвы (НЕ в центре)
    'default': [55.7558, 37.6176]
  };

  const normalizedName = quarryName.toLowerCase().trim();
  
  // Ищем точное совпадение или частичное совпадение
  for (const [key, coords] of Object.entries(regionCoordinates)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      // Добавляем случайное смещение для разнообразия (больше для карьеров одного региона)
      const offset = normalizedName.includes('аксиньино') || normalizedName.includes('есино') || 
                    normalizedName.includes('сопово') || normalizedName.includes('мякишево') ||
                    normalizedName.includes('торопово') || normalizedName.includes('болотское') ||
                    normalizedName.includes('любилки') || normalizedName.includes('потресово') ||
                    normalizedName.includes('товарково') || normalizedName.includes('лоза') ||
                    normalizedName.includes('кнауф') || normalizedName.includes('голубинка') ||
                    normalizedName.includes('шахты') || normalizedName.includes('пгк') ||
                    normalizedName.includes('техноресурс') || normalizedName.includes('никольское') ||
                    normalizedName.includes('аленино') || normalizedName.includes('буяни') ||
                    normalizedName.includes('сельниково') || normalizedName.includes('козловский') ||
                    normalizedName.includes('чаплыгино') || normalizedName.includes('комягино') ||
                    normalizedName.includes('пышково') || normalizedName.includes('вязьма') ? 0.05 : 0.02;
      
      return [
        coords[0] + (Math.random() - 0.5) * offset,
        coords[1] + (Math.random() - 0.5) * offset
      ];
    }
  }
  
  // Если не нашли, генерируем случайную точку ВОКРУГ Москвы (НЕ в центре)
  const directions = [
    [55.8500, 37.8500],  // северо-запад от МКАД
    [55.8500, 37.3500],  // северо-восток от МКАД
    [55.6500, 37.3500],  // юго-восток от МКАД
    [55.6500, 37.8500],  // юго-запад от МКАД
    [55.7500, 38.2000],  // север от МКАД
    [55.7500, 37.0000],  // юг от МКАД
    [56.0000, 37.6000],  // запад от МКАД
    [55.5000, 37.6000]   // восток от МКАД
  ];
  
  const randomDirection = directions[Math.floor(Math.random() * directions.length)];
  return [
    randomDirection[0] + (Math.random() - 0.5) * 0.05,
    randomDirection[1] + (Math.random() - 0.5) * 0.05
  ];
}
