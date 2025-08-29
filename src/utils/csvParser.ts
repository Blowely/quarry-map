import Papa from 'papaparse';
import { Quarry, QuarryPoint, Material } from '../types/quarry';

export const parseCSVData = (csvText: string): QuarryPoint[] => {
  const results = Papa.parse(csvText, { header: true });
  const quarries: Quarry[] = results.data as Quarry[];
  
  const quarryMap = new Map<string, QuarryPoint>();
  
  quarries.forEach((quarry, index) => {
    if (!quarry.name || !quarry.coordinates || quarry.coordinates === '') {
      return;
    }
    
    const coords = parseCoordinates(quarry.coordinates);
    if (!coords) return;
    
    const key = `${quarry.name}-${coords[0]}-${coords[1]}`;
    
    if (!quarryMap.has(key)) {
      quarryMap.set(key, {
        id: key,
        name: quarry.name,
        company: quarry.company || '',
        materials: [],
        contact: quarry.contact || '',
        coordinates: coords,
        transport: quarry.transport || '',
        schedule: quarry.schedule || ''
      });
    }
    
    const quarryPoint = quarryMap.get(key)!;
    
    if (quarry.material && quarry.material.trim() !== '') {
      const material: Material = {
        name: quarry.material,
        price: quarry.price || '',
        unit: quarry.unit || '',
        density: quarry.density || '',
        module: quarry.module || '',
        filterCoeff: quarry.filterCoeff || '',
        fraction: quarry.fraction || '',
        strength: quarry.strength || '',
        frostResistance: quarry.frostResistance || ''
      };
      
      quarryPoint.materials.push(material);
    }
  });
  
  return Array.from(quarryMap.values());
};

const parseCoordinates = (coordString: string): [number, number] | null => {
  try {
    const coords = coordString.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return [coords[0], coords[1]];
    }
  } catch (error) {
    console.error('Error parsing coordinates:', coordString);
  }
  return null;
};
