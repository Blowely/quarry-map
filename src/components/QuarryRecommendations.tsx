import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Button, Space, Typography, Alert, Statistic, Tag, Divider } from 'antd';
import { 
  EnvironmentOutlined, 
  PhoneOutlined, 
  ShopOutlined, 
  CheckCircleOutlined,
  StarOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { QuarryPoint } from '../types/quarry';
import { Tariff } from '../types/tariff';
import { findTariffsByQuarryAndMaterial, calculateDeliveryCost } from '../utils/tariffParser';

const { Title, Text } = Typography;

interface QuarryRecommendationsProps {
  quarries: QuarryPoint[];
  selectedMaterial: string;
  selectedWeight: number;
  selectedUnit: string;
  selectedDeliveryPoint: any;
  tariffs: Tariff[];
  onQuarrySelect: (quarry: QuarryPoint) => void;
  selectedQuarry?: QuarryPoint | null;
}

const QuarryRecommendations: React.FC<QuarryRecommendationsProps> = ({
  quarries,
  selectedMaterial,
  selectedWeight,
  selectedUnit,
  selectedDeliveryPoint,
  tariffs,
  onQuarrySelect,
  selectedQuarry
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Находим подходящие карьеры и рассчитываем приоритеты
  useEffect(() => {
    if (!selectedMaterial || !selectedWeight) {
      setRecommendations([]);
      return;
    }

    const suitableQuarries = quarries.filter(quarry => 
      quarry.materials.some(mat => mat.name === selectedMaterial)
    );

    const recommendationsWithPriority = suitableQuarries.map(quarry => {
      const material = quarry.materials.find(mat => mat.name === selectedMaterial);
      const relevantTariffs = findTariffsByQuarryAndMaterial(tariffs, quarry.name, selectedMaterial);
      
      // Рассчитываем стоимость доставки
      let deliveryCost = 0;
      let hasTariff = false;
      if (relevantTariffs.length > 0) {
        const bestTariff = relevantTariffs[0];
        deliveryCost = calculateDeliveryCost(bestTariff, bestTariff.distance, selectedWeight);
        hasTariff = true;
      }

      // Стоимость материала
      const materialCost = (parseFloat(material?.price || '0') || 0) * selectedWeight;
      const totalCost = materialCost + deliveryCost;

      // Приоритет: есть тариф (1000), количество материалов (1-100), расстояние
      const priority = (hasTariff ? 1000 : 0) + quarry.materials.length + (quarry.coordinates ? 1 : 0);

      return {
        ...quarry,
        material,
        hasTariff,
        deliveryCost,
        materialCost,
        totalCost,
        priority,
        pricePerUnit: totalCost / selectedWeight
      };
    });

    // Сортируем по приоритету
    const sortedRecommendations = recommendationsWithPriority
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5); // Показываем только топ-5

    setRecommendations(sortedRecommendations);
  }, [quarries, selectedMaterial, selectedWeight, tariffs]);

  const getPriorityColor = (index: number) => {
    if (index === 0) return '#52c41a';
    if (index === 1) return '#1890ff';
    if (index === 2) return '#fa8c16';
    return '#8c8c8c';
  };

  const getPriorityText = (index: number) => {
    if (index === 0) return 'Лучший выбор';
    if (index === 1) return 'Хороший вариант';
    if (index === 2) return 'Альтернатива';
    return 'Другие варианты';
  };

  if (recommendations.length === 0) {
    return (
      <div>
        <Title level={4} style={{ marginBottom: 16 }}>
          <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Рекомендации карьеров
        </Title>
        
        <Alert
          message="Нет подходящих карьеров"
          description="Для выбранного материала не найдено подходящих карьеров"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        Рекомендуемые карьеры
      </Title>

      <Alert
        message={`Найдено ${recommendations.length} подходящих карьеров для материала "${selectedMaterial}"`}
        description="Карьеры отсортированы по приоритету: наличие тарифов, количество материалов, расстояние"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[12, 12]}>
        {recommendations.map((quarry, index) => (
          <Col span={24} key={quarry.id}>
            <Card
              hoverable
              size="small"
              style={{
                cursor: 'pointer',
                border: selectedQuarry?.id === quarry.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                backgroundColor: selectedQuarry?.id === quarry.id ? '#f6ffed' : 'white'
              }}
              onClick={() => onQuarrySelect(quarry)}
            >
              <Row align="middle" justify="space-between">
                <Col flex="auto">
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Space>
                          <Tag color={getPriorityColor(index)} style={{ margin: 0 }}>
                            #{index + 1} {getPriorityText(index)}
                          </Tag>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          <Text strong style={{ fontSize: '16px' }}>{quarry.name}</Text>
                          {quarry.hasTariff && (
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                              Есть тариф
                            </Tag>
                          )}
                        </Space>
                      </Col>
                      <Col>
                        <Space>
                          <StarOutlined style={{ color: '#faad14' }} />
                          <Text strong style={{ color: getPriorityColor(index) }}>
                            {quarry.priority} баллов
                          </Text>
                        </Space>
                      </Col>
                    </Row>

                    <Row align="middle" justify="space-between">
                      <Col span={12}>
                        <Space direction="vertical" size={4}>
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            <ShopOutlined /> {quarry.company || 'Компания не указана'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            <PhoneOutlined /> {quarry.contact || 'Контакты не указаны'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            Материалов: {quarry.materials.length} шт.
                          </Text>
                        </Space>
                      </Col>
                      
                      <Col span={12}>
                        <Row gutter={8}>
                          <Col span={8}>
                            <Statistic
                              title="Материал"
                              value={quarry.materialCost}
                              precision={0}
                              suffix="руб."
                              valueStyle={{ fontSize: '14px', color: '#1890ff' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title="Доставка"
                              value={quarry.deliveryCost}
                              precision={0}
                              suffix="руб."
                              valueStyle={{ fontSize: '14px', color: '#fa8c16' }}
                            />
                          </Col>
                          <Col span={8}>
                            <Statistic
                              title="Итого"
                              value={quarry.totalCost}
                              precision={0}
                              suffix="руб."
                              valueStyle={{ fontSize: '14px', color: '#52c41a', fontWeight: 'bold' }}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>

                    <Divider style={{ margin: '8px 0' }} />
                    
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Цена за {selectedUnit}: <Text strong>{quarry.pricePerUnit.toFixed(2)} руб.</Text>
                        </Text>
                      </Col>
                      <Col>
                        <Button
                          type={selectedQuarry?.id === quarry.id ? 'primary' : 'default'}
                          size="small"
                          icon={<TruckOutlined />}
                        >
                          {selectedQuarry?.id === quarry.id ? 'Выбран' : 'Выбрать'}
                        </Button>
                      </Col>
                    </Row>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedQuarry && (
        <Alert
          message={`Выбран карьер: ${selectedQuarry.name}`}
          description={`Компания: ${selectedQuarry.company || 'Не указана'}`}
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default QuarryRecommendations;
