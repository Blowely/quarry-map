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
              <div style="
                padding: 16px; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 280px;
              ">
                <div style="
                  display: flex; 
                  align-items: center; 
                  gap: 8px; 
                  margin-bottom: 16px;
                  padding-bottom: 12px;
                  border-bottom: 1px solid #f0f0f0;
                ">
                  <div style="
                    width: 32px; 
                    height: 32px; 
                    background: linear-gradient(135deg, #1890ff, #40a9ff);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                  ">⛏️</div>
                  <div>
                    <div style="font-weight: 600; font-size: 16px; color: #262626;">${quarry.name}</div>
                    <div style="font-size: 12px; color: #8c8c8c;">Карьер</div>
                  </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Компания:</span>
                    <span style="font-weight: 500; color: #262626; text-align: right; max-width: 150px;">${quarry.company || 'Не указана'}</span>
                  </div>
                  
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Контакты:</span>
                    <span style="font-weight: 500; color: #262626; text-align: right; max-width: 150px;">${quarry.contact || 'Не указаны'}</span>
                  </div>
                  
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Материалы:</span>
                    <span style="font-weight: 500; color: #262626;">${quarry.materials.length} шт.</span>
                  </div>
                </div>
                
                <button onclick="window.selectQuarry('${quarry.id}')" style="
                  background: linear-gradient(135deg, #1890ff, #40a9ff);
                  color: white; 
                  border: none; 
                  padding: 12px 20px; 
                  border-radius: 8px; 
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  width: 100%;
                  transition: all 0.2s ease;
                  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(24, 144, 255, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(24, 144, 255, 0.3)'">
                  ⛏️ Выбрать карьер
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
              <div style="
                padding: 16px; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 280px;
              ">
                <div style="
                  display: flex; 
                  align-items: center; 
                  gap: 8px; 
                  margin-bottom: 16px;
                  padding-bottom: 12px;
                  border-bottom: 1px solid #f0f0f0;
                ">
                  <div style="
                    width: 32px; 
                    height: 32px; 
                    background: linear-gradient(135deg, #fa8c16, #ffa940);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                  ">🚛</div>
                  <div>
                    <div style="font-weight: 600; font-size: 16px; color: #262626;">${truck.name}</div>
                    <div style="font-size: 12px; color: #8c8c8c;">Грузовой транспорт</div>
                  </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Тип:</span>
                    <span style="font-weight: 500; color: #262626;">${truck.type}</span>
                  </div>
                  
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Грузоподъемность:</span>
                    <span style="font-weight: 500; color: #262626;">${truck.capacity} т</span>
                  </div>
                  
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Расход топлива:</span>
                    <span style="font-weight: 500; color: #262626;">${truck.fuelConsumption} л/100км</span>
                  </div>
                </div>
                
                <div style="
                  display: flex; 
                  align-items: center; 
                  gap: 6px; 
                  margin-bottom: 16px;
                  padding: 8px 12px;
                  background: #f6ffed;
                  border: 1px solid #b7eb8f;
                  border-radius: 6px;
                ">
                  <div style="
                    width: 8px; 
                    height: 8px; 
                    background: #52c41a; 
                    border-radius: 50%;
                  "></div>
                  <span style="color: #389e0d; font-size: 13px; font-weight: 500;">Доступен для заказа</span>
                </div>
                
                <button onclick="window.selectTruck('${truck.id}')" style="
                  background: linear-gradient(135deg, #fa8c16, #ffa940);
                  color: white; 
                  border: none; 
                  padding: 12px 20px; 
                  border-radius: 8px; 
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  width: 100%;
                  transition: all 0.2s ease;
                  box-shadow: 0 2px 8px rgba(250, 140, 22, 0.3);
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(250, 140, 22, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(250, 140, 22, 0.3)'">
                  🚛 Выбрать грузовик
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
              <div style="
                padding: 16px; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 300px;
              ">
                <div style="
                  display: flex; 
                  align-items: center; 
                  gap: 8px; 
                  margin-bottom: 16px;
                  padding-bottom: 12px;
                  border-bottom: 1px solid #f0f0f0;
                ">
                  <div style="
                    width: 32px; 
                    height: 32px; 
                    background: linear-gradient(135deg, ${
                      delivery.urgency === 'high' ? '#f5222d, #ff4d4f' : 
                      delivery.urgency === 'medium' ? '#fa8c16, #ffa940' : '#52c41a, #73d13d'
                    });
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                  ">🏢</div>
                  <div>
                    <div style="font-weight: 600; font-size: 16px; color: #262626;">${delivery.name}</div>
                    <div style="font-size: 12px; color: #8c8c8c;">Точка доставки</div>
                  </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Адрес:</span>
                    <span style="font-weight: 500; color: #262626; text-align: right; max-width: 150px;">${delivery.address}</span>
                  </div>
                  
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Материал:</span>
                    <span style="font-weight: 500; color: #262626;">${delivery.material}</span>
                  </div>
                  
                  <div style="
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: #fafafa;
                    border-radius: 6px;
                  ">
                    <span style="color: #595959; font-size: 13px;">Количество:</span>
                    <span style="font-weight: 500; color: #262626;">${delivery.quantity} т</span>
                  </div>
                </div>
                
                <div style="
                  display: flex; 
                  align-items: center; 
                  gap: 6px; 
                  margin-bottom: 16px;
                  padding: 8px 12px;
                  background: ${
                    delivery.urgency === 'high' ? '#fff2f0' : 
                    delivery.urgency === 'medium' ? '#fff7e6' : '#f6ffed'
                  };
                  border: 1px solid ${
                    delivery.urgency === 'high' ? '#ffccc7' : 
                    delivery.urgency === 'medium' ? '#ffd591' : '#b7eb8f'
                  };
                  border-radius: 6px;
                ">
                  <div style="
                    width: 8px; 
                    height: 8px; 
                    background: ${
                      delivery.urgency === 'high' ? '#f5222d' : 
                      delivery.urgency === 'medium' ? '#fa8c16' : '#52c41a'
                    }; 
                    border-radius: 50%;
                  "></div>
                  <span style="
                    color: ${
                      delivery.urgency === 'high' ? '#a8071a' : 
                      delivery.urgency === 'medium' ? '#ad6800' : '#389e0d'
                    }; 
                    font-size: 13px; 
                    font-weight: 500;
                  ">Срочность: ${
                    delivery.urgency === 'high' ? 'Высокая' : 
                    delivery.urgency === 'medium' ? 'Средняя' : 'Низкая'
                  }</span>
                </div>
                
                <button onclick="window.selectDelivery('${delivery.id}')" style="
                  background: linear-gradient(135deg, ${
                    delivery.urgency === 'high' ? '#f5222d, #ff4d4f' : 
                    delivery.urgency === 'medium' ? '#fa8c16, #ffa940' : '#52c41a, #73d13d'
                  });
                  color: white; 
                  border: none; 
                  padding: 12px 20px; 
                  border-radius: 8px; 
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 14px;
                  width: 100%;
                  transition: all 0.2s ease;
                  box-shadow: 0 2px 8px rgba(${
                    delivery.urgency === 'high' ? '245, 34, 45' : 
                    delivery.urgency === 'medium' ? '250, 140, 22' : '82, 196, 26'
                  }, 0.3);
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(${
                  delivery.urgency === 'high' ? '245, 34, 45' : 
                  delivery.urgency === 'medium' ? '250, 140, 22' : '#52c41a'
                }, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(${
                  delivery.urgency === 'high' ? '245, 34, 45' : 
                  delivery.urgency === 'medium' ? '250, 140, 22' : '82, 196, 26'
                }, 0.3)'">
                  🏢 Выбрать точку доставки
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
