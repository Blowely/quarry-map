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
  const [placemarks, setPlacemarks] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/${MAPS_CONFIG.YANDEX_VERSION}/?apikey=${MAPS_CONFIG.YANDEX_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => setError('Ошибка загрузки Яндекс карт');
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    try {
      window.ymaps.ready(() => {
        const newMap = new window.ymaps.Map(mapRef.current, {
          center: MAPS_CONFIG.DEFAULT_CENTER,
          zoom: MAPS_CONFIG.DEFAULT_ZOOM,
          controls: ['zoomControl', 'fullscreenControl']
        });

        setMap(newMap);
        setError('');
      });
    } catch (err) {
      setError('Ошибка инициализации карты');
    }
  };

  useEffect(() => {
    if (!map || quarries.length === 0) return;

    try {
      // Удаляем старые метки
      placemarks.forEach(placemark => {
        map.geoObjects.remove(placemark);
      });

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
            preset: selectedQuarry?.id === quarry.id ? 'islands#redDotIcon' : 'islands#blueDotIcon',
            iconColor: selectedQuarry?.id === quarry.id ? '#ff4d4f' : '#1890ff'
          }
        );

        placemark.events.add('click', () => {
          onQuarrySelect(quarry);
        });

        map.geoObjects.add(placemark);
        return placemark;
      });

      setPlacemarks(newPlacemarks);

      // Добавляем глобальную функцию для вызова из балуна
      (window as any).selectQuarry = (id: string) => {
        const quarry = quarries.find(q => q.id === id);
        if (quarry) {
          onQuarrySelect(quarry);
        }
      };
    } catch (err) {
      setError('Ошибка отображения меток на карте');
    }
  }, [map, quarries, selectedQuarry, placemarks, onQuarrySelect]);

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
