export const MAPS_CONFIG = {
  YANDEX_API_KEY: process.env.REACT_APP_YANDEX_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
  YANDEX_VERSION: '2.1',
  DEFAULT_CENTER: [55.7558, 37.6176] as [number, number], // Москва
  DEFAULT_ZOOM: 8
};
