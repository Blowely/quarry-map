import { QuarryPoint } from '../types/quarry';

export const quarriesData: QuarryPoint[] = [
  {
    id: '1',
    name: 'Аленино',
    company: 'ООО "Фирма ММС"',
    materials: [
      {
        name: 'Мытый песок',
        price: 'р.390,00',
        unit: 'м3',
        density: '1,55',
        module: '1,8',
        filterCoeff: '',
        fraction: '',
        strength: '',
        frostResistance: ''
      }
    ],
    contact: '89166809518',
    coordinates: [56.106931, 38.629356],
    transport: 'Тонары + Одиночки',
    schedule: '08-17 х 7'
  },
  {
    id: '2',
    name: 'Буяни',
    company: 'ООО "ГидроМехСервис"',
    materials: [
      {
        name: 'Мытый песок',
        price: 'р.300,00',
        unit: 'м3',
        density: '1,55',
        module: '1,9',
        filterCoeff: '',
        fraction: '',
        strength: '',
        frostResistance: ''
      }
    ],
    contact: '89067788518',
    coordinates: [56.061952, 38.637596],
    transport: 'Тонары + Одиночки',
    schedule: '08-18 х 7'
  },
  {
    id: '3',
    name: 'Жуково',
    company: 'ООО "Алмаз"',
    materials: [
      {
        name: 'Мытый песок',
        price: 'р.650,00',
        unit: 'м3',
        density: '1,55',
        module: '1,8',
        filterCoeff: '3',
        fraction: '',
        strength: '',
        frostResistance: ''
      },
      {
        name: 'Карьерный песок',
        price: 'р.650,00',
        unit: 'м3',
        density: '1,5',
        module: '2',
        filterCoeff: '3',
        fraction: '',
        strength: '',
        frostResistance: ''
      }
    ],
    contact: '84959683745',
    coordinates: [55.508838, 38.025244],
    transport: 'Одиночки',
    schedule: '24 х 7'
  },
  {
    id: '4',
    name: 'Октябрьский',
    company: 'ООО "Седрус"',
    materials: [
      {
        name: 'Мытый песок',
        price: 'р.650,00',
        unit: 'м3',
        density: '1,5',
        module: '1,5',
        filterCoeff: '',
        fraction: '',
        strength: '',
        frostResistance: ''
      }
    ],
    contact: '89035130688',
    coordinates: [55.111284, 39.005193],
    transport: 'Одиночки',
    schedule: '08-16:30 х 5'
  },
  {
    id: '5',
    name: 'Сельниково',
    company: 'ООО "АгроПромНеруд"',
    materials: [
      {
        name: 'Мытый песок',
        price: 'р.550,00',
        unit: 'м3',
        density: '1,55',
        module: '1,6',
        filterCoeff: '1,3',
        fraction: '',
        strength: '',
        frostResistance: ''
      }
    ],
    contact: '89859206466',
    coordinates: [55.133321, 39.157734],
    transport: 'Тонары + Одиночки',
    schedule: '08-18 х 7'
  }
];
