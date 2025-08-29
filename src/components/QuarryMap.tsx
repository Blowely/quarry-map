import React, { useEffect, useRef, useState } from 'react';
import { QuarryPoint } from '../types/quarry';
import { MAPS_CONFIG } from '../config/maps';
import { Alert } from 'antd';

declare global {
  interface Window {
    ymaps: any;
  }
}

interface QuarryMapProps {
  quarries: QuarryPoint[];
  selectedQuarry: QuarryPoint | null;
  onQuarrySelect: (quarry: QuarryPoint) => void;
}

const QuarryMap: React.FC<QuarryMapProps> = ({ quarries, selectedQuarry, onQuarrySelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [placemarks, setPlacemarks] = useState<any[]>([]);
  const [error, setError] = useState<string>('');



  useEffect(() => {
    console.log('QuarryMap: Инициализация карты');
    console.log('QuarryMap: window.ymaps существует:', !!window.ymaps);
    
    if (!window.ymaps) {
      console.log('QuarryMap: Загружаем API Яндекс карт');
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/${MAPS_CONFIG.YANDEX_VERSION}/?apikey=${MAPS_CONFIG.YANDEX_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        console.log('QuarryMap: API Яндекс карт загружен');
        initMap();
      };
      script.onerror = () => {
        console.error('QuarryMap: Ошибка загрузки API Яндекс карт');
        setError('Ошибка загрузки Яндекс карт');
      };
      document.head.appendChild(script);
    } else {
      console.log('QuarryMap: API Яндекс карт уже загружен');
      initMap();
    }
  }, []);

  const initMap = () => {
    console.log('QuarryMap: initMap вызвана');
    if (!mapRef.current) {
      console.error('QuarryMap: mapRef.current не существует');
      return;
    }

    try {
      console.log('QuarryMap: Вызываем ymaps.ready');
      window.ymaps.ready(() => {
        console.log('QuarryMap: ymaps.ready выполнен');
        const newMap = new window.ymaps.Map(mapRef.current, {
          center: MAPS_CONFIG.DEFAULT_CENTER,
          zoom: MAPS_CONFIG.DEFAULT_ZOOM,
          controls: ['zoomControl', 'fullscreenControl']
        });

        console.log('QuarryMap: Карта создана:', newMap);
        setMap(newMap);
        setError('');
      });
    } catch (err) {
      console.error('QuarryMap: Ошибка в initMap:', err);
      setError('Ошибка инициализации карты');
    }
  };

  useEffect(() => {
    console.log('QuarryMap: useEffect для меток вызван');
    console.log('QuarryMap: map существует:', !!map);
    console.log('QuarryMap: количество карьеров:', quarries.length);
    
    if (!map || quarries.length === 0) {
      console.log('QuarryMap: Выходим из useEffect - нет карты или карьеров');
      return;
    }

    try {
      console.log('QuarryMap: Очищаем геообъекты на карте');
      // Очищаем все геообъекты на карте
      map.geoObjects.removeAll();

      console.log('QuarryMap: Создаем метки для карьеров');
      const newPlacemarks = quarries.map(quarry => {
        const placemark = new window.ymaps.Placemark(
          quarry.coordinates,
          {
            balloonContentHeader: quarry.name,
            balloonContentBody: `
              <div>
                <p><strong>Компания:</strong> ${quarry.company || 'Не указано'}</p>
                <p><strong>Материалы:</strong> ${quarry.materials.length}</p>
                <p><strong>Контакты:</strong> ${quarry.contact || 'Не указано'}</p>
              </div>
            `,
            balloonContentFooter: `
              <button onclick="window.selectQuarry('${quarry.id}')" style="background: #1890ff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Подробнее
              </button>
            `
          },
          {
            preset: 'islands#blueDotIcon',
            iconColor: '#1890ff'
          }
        );

        placemark.events.add('click', () => {
          console.log('Клик по метке карьера:', quarry.name);
          onQuarrySelect(quarry);
        });

        console.log('QuarryMap: Добавляем метку на карту для карьера:', quarry.name);
        map.geoObjects.add(placemark);
        return placemark;
      });

      console.log('QuarryMap: Метки созданы, обновляем состояние');
      setPlacemarks(newPlacemarks);

      // Добавляем глобальную функцию для вызова из балуна
      (window as any).selectQuarry = (id: string) => {
        const quarry = quarries.find(q => q.id === id);
        if (quarry) {
          onQuarrySelect(quarry);
        }
      };
      
      console.log('QuarryMap: useEffect для меток завершен');
    } catch (err) {
      console.error('QuarryMap: Ошибка при создании меток:', err);
      setError('Ошибка отображения меток на карте');
    }
  }, [map, quarries, onQuarrySelect]);

  // Отдельный useEffect для обновления внешнего вида выбранной метки
  useEffect(() => {
    if (!map || placemarks.length === 0) return;

    console.log('QuarryMap: Обновляем внешний вид меток для selectedQuarry:', selectedQuarry?.name);
    
    placemarks.forEach((placemark, index) => {
      const quarry = quarries[index];
      if (quarry) {
        const isSelected = selectedQuarry?.id === quarry.id;
        placemark.options.set({
          preset: isSelected ? 'islands#redDotIcon' : 'islands#blueDotIcon',
          iconColor: isSelected ? '#ff4d4f' : '#1890ff'
        });
      }
    });
  }, [selectedQuarry, map, placemarks, quarries]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Alert
          message="Ошибка загрузки карты"
          description={error}
          type="error"
          showIcon
        />
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
