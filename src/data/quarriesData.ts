import { QuarryPoint } from '../types/quarry';

export const quarriesData: QuarryPoint[] = [
  {
    id: '1',
    name: 'Аленино',
    company: 'ООО "СтройМатериалы"',
    materials: [
      {
        name: 'Песок',
        price: '450',
        unit: 'м³',
        density: '1,55',
        module: '1,8',
        fraction: '0-5'
      }
    ],
    contact: '84951234567',
    coordinates: [55.1234, 37.5678],
    transport: 'Самовывоз',
    schedule: 'Пн-Пт 8:00-18:00'
  },
  {
    id: '2',
    name: 'Буяни',
    company: 'ООО "ГидроМехСервис"',
    materials: [
      {
        name: 'Щебень',
        price: '1200',
        unit: 'м³',
        density: '1,55',
        module: '1,9',
        fraction: '5-20'
      }
    ],
    contact: '89067788518',
    coordinates: [55.2345, 37.6789],
    transport: 'Доставка',
    schedule: 'Пн-Сб 7:00-19:00'
  },
  {
    id: '3',
    name: 'Жуково',
    company: 'ООО "Алмаз"',
    materials: [
      {
        name: 'Песок',
        price: '480',
        unit: 'м³',
        density: '1,55',
        module: '1,8',
        fraction: '0-5'
      },
      {
        name: 'Щебень',
        price: '1250',
        unit: 'м³',
        density: '1,5',
        module: '2',
        fraction: '20-40'
      }
    ],
    contact: '84959683745',
    coordinates: [55.3456, 37.7890],
    transport: 'Самовывоз, доставка',
    schedule: 'Ежедневно 6:00-22:00'
  },
  {
    id: '4',
    name: 'Октябрьский',
    company: 'ООО "СтройИнвест"',
    materials: [
      {
        name: 'Песок',
        price: '460',
        unit: 'м³',
        density: '1,5',
        module: '1,5',
        fraction: '0-3'
      }
    ],
    contact: '84957894563',
    coordinates: [55.4567, 37.8901],
    transport: 'Доставка',
    schedule: 'Пн-Пт 9:00-17:00'
  },
  {
    id: '5',
    name: 'Сельниково',
    company: 'ООО "КарьерСтрой"',
    materials: [
      {
        name: 'Щебень',
        price: '1180',
        unit: 'м³',
        density: '1,55',
        module: '1,6',
        fraction: '5-20'
      }
    ],
    contact: '84956789012',
    coordinates: [55.5678, 37.9012],
    transport: 'Самовывоз',
    schedule: 'Пн-Сб 8:00-20:00'
  }
];
