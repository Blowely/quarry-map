import React, { useEffect, useRef, useState } from 'react';
import { QuarryPoint } from '../types/quarry';
import { MAPS_CONFIG } from '../config/maps';
import { trucks, deliveryPoints } from '../data/logisticsData';

interface QuarryMapProps {
  quarries: QuarryPoint[];
  selectedQuarry: QuarryPoint | null;
  onQuarrySelect: (quarry: QuarryPoint) => void;
}

const QuarryMap: React.FC<QuarryMapProps> = ({ quarries, selectedQuarry, onQuarrySelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [placemarks, setPlacemarks] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('QuarryMap: useEffect для загрузки API вызван');
    
    // Проверяем, загружен ли уже API
    if ((window as any).ymaps) {
      console.log('QuarryMap: API уже загружен');
      initializeMap();
      return;
    }

    console.log('QuarryMap: Загружаем Yandex Maps API');
    
    // Загружаем Yandex Maps API
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${MAPS_CONFIG.YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    
    script.onload = () => {
      console.log('QuarryMap: API загружен успешно');
      (window as any).ymaps.ready(() => {
        console.log('QuarryMap: API готов к использованию');
        initializeMap();
      });
    };
    
    script.onerror = () => {
      console.error('QuarryMap: Ошибка загрузки API');
      setError('Ошибка загрузки карт');
    };
    
    document.head.appendChild(script);
  }, []);

  const initializeMap = () => {
    console.log('QuarryMap: Инициализируем карту');
    
    if (!mapRef.current) {
      console.error('QuarryMap: mapRef.current не существует');
      return;
    }

    try {
      const newMap = new (window as any).ymaps.Map(mapRef.current, {
        center: MAPS_CONFIG.DEFAULT_CENTER,
        zoom: MAPS_CONFIG.DEFAULT_ZOOM,
        controls: ['zoomControl', 'fullscreenControl']
      });

      console.log('QuarryMap: Карта создана');
      setMap(newMap);
    } catch (err) {
      console.error('QuarryMap: Ошибка создания карты:', err);
      setError('Ошибка создания карты');
    }
  };

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
      
      console.log('QuarryMap: Создаем метки для карьеров');
      const newPlacemarks: any[] = [];
      
      quarries.forEach(quarry => {
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
            preset: 'islands#blueDotIcon',
            iconColor: selectedQuarry?.id === quarry.id ? '#f5222d' : '#1890ff'
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
                </div>
              `,
              hintContent: `${truck.name} (${truck.capacity} т)`
            },
            {
              preset: 'islands#truckIcon',
              iconColor: '#fa8c16'
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
              </div>
            `,
            hintContent: `${delivery.name} (${delivery.material})`
          },
          {
            preset: 'islands#redDotIcon',
            iconColor: delivery.urgency === 'high' ? '#f5222d' : 
                       delivery.urgency === 'medium' ? '#fa8c16' : '#52c41a'
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

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '600px',
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
};

export default QuarryMap;
