import { QuarryPoint, Material } from '../types/quarry';

interface CSVQuarry {
  name: string;
  coordinates: string;
  company?: string;
  contact?: string;
  transport?: string;
  schedule?: string;
  material?: string;
  price?: string;
  unit?: string;
  density?: string;
  module?: string;
  fraction?: string;
}

export function parseCSVData(csvText: string): QuarryPoint[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1);
  
  const quarries: CSVQuarry[] = [];
  
  data.forEach(line => {
    const values = line.split(',').map(v => v.trim());
    const quarry: CSVQuarry = {
      name: values[0] || '',
      coordinates: values[1] || '',
      company: values[2] || '',
      contact: values[3] || '',
      transport: values[4] || '',
      schedule: values[5] || '',
      material: values[6] || '',
      price: values[7] || '',
      unit: values[8] || '',
      density: values[9] || '',
      module: values[10] || '',
      fraction: values[11] || ''
    };
    
    if (quarry.name && quarry.coordinates) {
      quarries.push(quarry);
    }
  });
  
  // Группируем материалы по карьерам
  const quarryMap = new Map<string, QuarryPoint>();
  
  quarries.forEach((quarry, index) => {
    if (!quarry.name || !quarry.coordinates || quarry.coordinates === '') {
      return;
    }
    
    const coords = parseCoordinates(quarry.coordinates);
    if (!coords) return;
    
    const key = `${quarry.name}-${coords[0]}-${coords[1]}`;
    
    if (!quarryMap.has(key)) {
      const quarryPoint: QuarryPoint = {
        id: (index + 1).toString(),
        name: quarry.name,
        company: quarry.company || 'Не указана',
        materials: [],
        contact: quarry.contact || 'Не указан',
        coordinates: coords,
        transport: quarry.transport,
        schedule: quarry.schedule
      };
      quarryMap.set(key, quarryPoint);
    }
    
    const quarryPoint = quarryMap.get(key)!;
    
    if (quarry.material && quarry.material.trim() !== '') {
      const material: Material = {
        name: quarry.material,
        price: quarry.price || '',
        unit: quarry.unit || '',
        density: quarry.density || '',
        module: quarry.module || '',
        fraction: quarry.fraction || ''
      };
      
      quarryPoint.materials.push(material);
    }
  });
  
  return Array.from(quarryMap.values());
}

function parseCoordinates(coordString: string): [number, number] | null {
  try {
    const coords = coordString.split(',').map(c => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return [coords[0], coords[1]];
    }
  } catch (error) {
    console.error('Ошибка парсинга координат:', coordString, error);
  }
  return null;
}
