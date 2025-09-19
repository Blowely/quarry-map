import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Typography, Alert } from 'antd';
import { EnvironmentOutlined, ShopOutlined, TruckOutlined } from '@ant-design/icons';
import { DeliveryPoint } from '../types/quarry';

const { Title, Text } = Typography;

interface DeliveryPointSelectorProps {
  onDeliverySelect: (delivery: DeliveryPoint) => void;
  selectedDelivery?: DeliveryPoint | null;
}

const DeliveryPointSelector: React.FC<DeliveryPointSelectorProps> = ({ 
  onDeliverySelect, 
  selectedDelivery 
}) => {
  const [deliveryPoints] = useState<DeliveryPoint[]>([
    {
      id: '1',
      name: 'Офисный центр "Экспоцентр"',
      address: 'Москва, Краснопресненская наб., 14',
      coordinates: [55.7558, 37.6176],
      material: 'Бетон',
      quantity: 50,
      urgency: 'high'
    },
    {
      id: '2', 
      name: 'ЖК "Сколково Парк"',
      address: 'Московская обл., Одинцовский р-н, д. Сколково',
      coordinates: [55.7000, 37.3000],
      material: 'Песок',
      quantity: 100,
      urgency: 'medium'
    },
    {
      id: '3',
      name: 'Торговый центр "Мега"',
      address: 'Москва, ул. Поклонная, 3',
      coordinates: [55.7400, 37.5000],
      material: 'Щебень',
      quantity: 75,
      urgency: 'low'
    },
    {
      id: '4',
      name: 'Промзона "Зеленоград"',
      address: 'Москва, Зеленоград, промзона',
      coordinates: [55.9800, 37.1800],
      material: 'Гравий',
      quantity: 200,
      urgency: 'high'
    }
  ]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#fa8c16';
      case 'low': return '#52c41a';
      default: return '#8c8c8c';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Срочно';
      case 'medium': return 'Средний приоритет';
      case 'low': return 'Не срочно';
      default: return 'Не указано';
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        Выберите точку доставки
      </Title>
      
      <Alert
        message="Выберите куда нужно доставить материал"
        description="Система автоматически найдет подходящие карьеры после выбора точки доставки"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[12, 12]}>
        {deliveryPoints.map((point) => (
          <Col span={24} key={point.id}>
            <Card
              hoverable
              size="small"
              style={{
                cursor: 'pointer',
                border: selectedDelivery?.id === point.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                backgroundColor: selectedDelivery?.id === point.id ? '#f6ffed' : 'white'
              }}
              onClick={() => onDeliverySelect(point)}
            >
              <Row align="middle" justify="space-between">
                <Col flex="auto">
                  <Space direction="vertical" size={4}>
                    <Space>
                      <ShopOutlined style={{ color: '#1890ff' }} />
                      <Text strong style={{ fontSize: '16px' }}>{point.name}</Text>
                      <Text 
                        style={{ 
                          color: getUrgencyColor(point.urgency),
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {getUrgencyText(point.urgency)}
                      </Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {point.address}
                    </Text>
                    <Space>
                      <TruckOutlined style={{ color: '#fa8c16' }} />
                      <Text style={{ fontSize: '13px' }}>
                        Нужно: <Text strong>{point.quantity} тн</Text> • 
                        Материал: <Text strong>{point.material}</Text>
                      </Text>
                    </Space>
                  </Space>
                </Col>
                <Col>
                  <Button
                    type={selectedDelivery?.id === point.id ? 'primary' : 'default'}
                    size="small"
                  >
                    {selectedDelivery?.id === point.id ? 'Выбрано' : 'Выбрать'}
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedDelivery && (
        <Alert
          message={`Выбрана точка доставки: ${selectedDelivery.name}`}
          description={`Адрес: ${selectedDelivery.address}`}
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default DeliveryPointSelector;
