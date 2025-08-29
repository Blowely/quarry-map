import React, { useEffect, useRef, useState, useCallback } from 'react';
import { QuarryPoint } from '../types/quarry';
import { MAPS_CONFIG } from '../config/maps';
import { trucks, deliveryPoints } from '../data/logisticsData';
import MapLegend from './MapLegend';


interface QuarryMapProps {
  quarries: QuarryPoint[];
  selectedQuarry: QuarryPoint | null;
  onQuarrySelect: (quarry: QuarryPoint) => void;
  onTruckSelect?: (truck: any) => void;
  onDeliverySelect?: (delivery: any) => void;
}

const QuarryMap: React.FC<QuarryMapProps> = ({ quarries, selectedQuarry, onQuarrySelect, onTruckSelect, onDeliverySelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placemarks, setPlacemarks] = useState<any[]>([]);
  const [routeLine, setRouteLine] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [apiLoaded, setApiLoaded] = useState(false);

  // Функция для отрисовки маршрута
  const drawRoute = useCallback((startCoords: [number, number], middleCoords: [number, number], endCoords: [number, number]) => {
    if (!map) return;

    // Удаляем предыдущий маршрут
    if (routeLine) {
      map.geoObjects.remove(routeLine);
    }

    try {
      // Создаем маршрут через точки
      const route = new (window as any).ymaps.GeoObject({
        geometry: {
          type: 'LineString',
          coordinates: [startCoords, middleCoords, endCoords]
        },
        properties: {
          hintContent: 'Маршрут доставки'
        }
      }, {
        strokeColor: '#ff0000',
        strokeWidth: 4,
        strokeStyle: 'solid'
      });

      // Добавляем стрелки направления
      const arrow = new (window as any).ymaps.GeoObject({
        geometry: {
          type: 'Point',
          coordinates: middleCoords
        },
        properties: {
          hintContent: 'Направление'
        }
      }, {
        preset: 'islands#redArrowIcon'
      });

      // Группируем маршрут и стрелку
      const routeGroup = new (window as any).ymaps.GeoObjectCollection();
      routeGroup.add(route);
      routeGroup.add(arrow);

      map.geoObjects.add(routeGroup);
      setRouteLine(routeGroup);

      // Центрируем карту на маршруте
      map.setBounds(routeGroup.geometry.getBounds(), { checkZoomRange: true });

      console.log('Маршрут отрисован на карте');
    } catch (err) {
      console.error('Ошибка отрисовки маршрута:', err);
    }
  }, [map, routeLine]);

  // Функция для сброса маршрута
  const clearRoute = useCallback(() => {
    if (map && routeLine) {
      map.geoObjects.remove(routeLine);
      setRouteLine(null);
      console.log('Маршрут сброшен');
    }
  }, [map, routeLine]);

  // Добавляем функции в глобальную область для вызова из калькулятора
  useEffect(() => {
    if (map) {
      (window as any).drawRouteOnMap = drawRoute;
      (window as any).clearRouteOnMap = clearRoute;
    }
  }, [map, drawRoute, clearRoute]);

  useEffect(() => {
    console.log('QuarryMap: useEffect для загрузки API вызван');
    
    // Проверяем, загружен ли уже API
    if ((window as any).ymaps) {
      console.log('QuarryMap: API уже загружен');
      setApiLoaded(true);
      return;
    }

    console.log('QuarryMap: Загружаем Yandex Maps API');
    
    // Загружаем Yandex Maps API
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${MAPS_CONFIG.YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    
    script.onload = () => {
      console.log('QuarryMap: API загружен успешно');
      setApiLoaded(true);
    };
    
    script.onerror = () => {
      console.error('QuarryMap: Ошибка загрузки API');
      setError('Ошибка загрузки карт');
    };
    
    document.head.appendChild(script);
  }, []);

  // useEffect для инициализации карты после загрузки API
  useEffect(() => {
    if (!apiLoaded || !mapRef.current) return;

    console.log('QuarryMap: Инициализируем карту');
    
    try {
      (window as any).ymaps.ready(() => {
        const newMap = new (window as any).ymaps.Map(mapRef.current, {
          center: MAPS_CONFIG.DEFAULT_CENTER,
          zoom: MAPS_CONFIG.DEFAULT_ZOOM,
          controls: ['zoomControl', 'fullscreenControl']
        });

        console.log('QuarryMap: Карта создана');
        setMap(newMap);
        setError('');
      });
    } catch (err) {
      console.error('QuarryMap: Ошибка создания карты:', err);
      setError('Ошибка создания карты');
    }
  }, [apiLoaded]);

  // useEffect для создания меток карьеров
  useEffect(() => {
    console.log('QuarryMap: useEffect для меток вызван');
    console.log('QuarryMap: map существует:', !!map);
    console.log('QuarryMap: количество карьеров:', quarries.length);
    
    if (!map || quarries.length === 0) {
      console.log('QuarryMap: Карта не готова или нет карьеров');
      return;
    }

    try {
      console.log('QuarryMap: Очищаем геообъекты на карте');
      map.geoObjects.removeAll();
      
      // Сбрасываем маршрут при обновлении меток
      setRouteLine(null);
      
      console.log('QuarryMap: Создаем метки для карьеров');
      const newPlacemarks: any[] = [];
      
      quarries.forEach(quarry => {
        console.log('QuarryMap: Создаем метку для карьера:', quarry.name, 'координаты:', quarry.coordinates);
        
        const placemark = new (window as any).ymaps.Placemark(
          quarry.coordinates,
          {
            balloonContentHeader: quarry.name,
            balloonContentBody: `
              <div style="padding: 8px;">
                <p><strong>Компания:</strong> ${quarry.company || 'Не указана'}</p>
                <p><strong>Контакты:</strong> ${quarry.contact || 'Не указаны'}</p>
                <p><strong>Материалы:</strong> ${quarry.materials.length} шт.</p>
                <button onclick="window.selectQuarry('${quarry.id}')" style="
                  background: #1890ff; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer;
                ">
                  Выбрать карьер
                </button>
              </div>
            `,
            hintContent: quarry.name
          },
          {
            iconLayout: 'default#image',
            iconImageHref: selectedQuarry?.id === quarry.id ? '/icons/quarry-selected.svg' : '/icons/quarry.svg',
            iconImageSize: [32, 32],
            iconImageOffset: [-16, -16]
          }
        );

        placemark.events.add('click', () => {
          console.log('Клик по метке карьера:', quarry.name);
          onQuarrySelect(quarry);
        });

        console.log('QuarryMap: Добавляем метку на карту для карьера:', quarry.name);
        map.geoObjects.add(placemark);
        newPlacemarks.push(placemark);
      });

      // Добавляем грузовики на карту
      console.log('QuarryMap: Добавляем грузовики на карту');
      trucks.forEach(truck => {
        if (truck.isAvailable) {
          const truckPlacemark = new (window as any).ymaps.Placemark(
            truck.coordinates,
            {
              balloonContentHeader: truck.name,
              balloonContentBody: `
                <div style="padding: 8px;">
                  <p><strong>Тип:</strong> ${truck.type}</p>
                  <p><strong>Грузоподъемность:</strong> ${truck.capacity} т</p>
                  <p><strong>Расход топлива:</strong> ${truck.fuelConsumption} л/100км</p>
                  <p><strong>Статус:</strong> <span style="color: #52c41a;">Доступен</span></p>
                  <button onclick="window.selectTruck('${truck.id}')" style="
                    background: #fa8c16; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer;
                  ">
                    Выбрать грузовик
                  </button>
                </div>
              `,
              hintContent: `${truck.name} (${truck.capacity} т)`
            },
            {
              iconLayout: 'default#image',
              iconImageHref: '/icons/truck.svg',
              iconImageSize: [36, 36],
              iconImageOffset: [-18, -18]
            }
          );
          
          map.geoObjects.add(truckPlacemark);
          newPlacemarks.push(truckPlacemark);
        }
      });

      // Добавляем точки доставки на карту
      console.log('QuarryMap: Добавляем точки доставки на карту');
      deliveryPoints.forEach(delivery => {
        const deliveryPlacemark = new (window as any).ymaps.Placemark(
          delivery.coordinates,
          {
            balloonContentHeader: delivery.name,
            balloonContentBody: `
              <div style="padding: 8px;">
                <p><strong>Адрес:</strong> ${delivery.address}</p>
                <p><strong>Материал:</strong> ${delivery.material}</p>
                <p><strong>Количество:</strong> ${delivery.quantity} т</p>
                <p><strong>Срочность:</strong> 
                  <span style="color: ${
                    delivery.urgency === 'high' ? '#f5222d' : 
                    delivery.urgency === 'medium' ? '#fa8c16' : '#52c41a'
                  };">
                    ${delivery.urgency === 'high' ? 'Высокая' : 
                      delivery.urgency === 'medium' ? 'Средняя' : 'Низкая'}
                  </span>
                </p>
                <button onclick="window.selectDelivery('${delivery.id}')" style="
                  background: #f5222d; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer;
                ">
                  Выбрать точку доставки
                </button>
              </div>
            `,
            hintContent: `${delivery.name} (${delivery.material})`
          },
                      {
              iconLayout: 'default#image',
              iconImageHref: delivery.urgency === 'high' ? '/icons/delivery-high.svg' : 
                             delivery.urgency === 'medium' ? '/icons/delivery-medium.svg' : '/icons/delivery-low.svg',
              iconImageSize: [32, 32],
              iconImageOffset: [-16, -16]
            }
        );
        
        map.geoObjects.add(deliveryPlacemark);
        newPlacemarks.push(deliveryPlacemark);
      });

      console.log('QuarryMap: Метки созданы, обновляем состояние');
      setPlacemarks(newPlacemarks);

      // Добавляем функцию для выбора карьера из балуна
      (window as any).selectQuarry = (id: string) => {
        const quarry = quarries.find(q => q.id === id);
        if (quarry) {
          onQuarrySelect(quarry);
        }
      };

      // Добавляем функцию для выбора грузовика из балуна
      (window as any).selectTruck = (id: string) => {
        const truck = trucks.find(t => t.id === id);
        if (truck && onTruckSelect) {
          onTruckSelect(truck);
        }
      };

      // Добавляем функцию для выбора точки доставки из балуна
      (window as any).selectDelivery = (id: string) => {
        const delivery = deliveryPoints.find(d => d.id === id);
        if (delivery && onDeliverySelect) {
          onDeliverySelect(delivery);
        }
      };

      console.log('QuarryMap: useEffect для меток завершен');
    } catch (err) {
      console.error('QuarryMap: Ошибка создания меток:', err);
      setError('Ошибка отображения меток на карте');
    }
  }, [map, quarries, onQuarrySelect]);

  // useEffect для обновления внешнего вида меток при изменении selectedQuarry
  useEffect(() => {
    if (!map || placemarks.length === 0) return;

    console.log('QuarryMap: Обновляем внешний вид меток для selectedQuarry:', selectedQuarry?.name);

    placemarks.forEach((placemark, index) => {
      if (index < quarries.length) { // Только для меток карьеров
        const quarry = quarries[index];
        const isSelected = selectedQuarry?.id === quarry.id;
        
        placemark.options.set({
          iconColor: isSelected ? '#f5222d' : '#1890ff'
        });
      }
    });
  }, [selectedQuarry?.id, placemarks, quarries, map]);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#f5222d',
        background: '#fff1f0',
        border: '1px solid #ffccc7',
        borderRadius: '8px'
      }}>
        <strong>Ошибка:</strong> {error}
      </div>
    );
  }

  if (!apiLoaded) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#1890ff',
        background: '#f0f9ff',
        border: '1px solid #91d5ff',
        borderRadius: '8px'
      }}>
        <strong>Загрузка карты...</strong>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
      <MapLegend />
    </div>
  );
};

export default QuarryMap;
