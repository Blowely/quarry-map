import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Select, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Divider,
  Alert,
  Tag
} from 'antd';
import { 
  CalculatorOutlined, 
  ClockCircleOutlined, 
  DollarOutlined, 
  TruckOutlined,
  EnvironmentOutlined,
  CompassOutlined
} from '@ant-design/icons';
import { QuarryPoint, Route } from '../types/quarry';
import { trucks, deliveryPoints, calculateDistance, calculateRouteCost } from '../data/logisticsData';

const { Text } = Typography;
const { Option } = Select;

interface RouteCalculatorProps {
  selectedQuarry: QuarryPoint | null;
}

const RouteCalculator: React.FC<RouteCalculatorProps> = ({ selectedQuarry }) => {
  const [selectedTruck, setSelectedTruck] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [calculatedRoute, setCalculatedRoute] = useState<Route | null>(null);

  const availableTrucks = trucks.filter(truck => truck.isAvailable);

  const calculateRoute = () => {
    if (!selectedQuarry || !selectedTruck || !selectedDelivery) return;

    const truck = trucks.find(t => t.id === selectedTruck);
    const delivery = deliveryPoints.find(d => d.id === selectedDelivery);

    if (!truck || !delivery) return;

    // Расчет расстояний
    const distanceToQuarry = calculateDistance(
      truck.coordinates[0], truck.coordinates[1],
      selectedQuarry.coordinates[0], selectedQuarry.coordinates[1]
    );

    const distanceToDelivery = calculateDistance(
      selectedQuarry.coordinates[0], selectedQuarry.coordinates[1],
      delivery.coordinates[0], delivery.coordinates[1]
    );

    const totalDistance = distanceToQuarry + distanceToDelivery;

    // Расчет времени (средняя скорость 60 км/ч + время загрузки/разгрузки)
    const drivingTime = totalDistance / 60;
    const loadingTime = 1; // 1 час на загрузку
    const unloadingTime = 1; // 1 час на разгрузку
    const totalTime = drivingTime + loadingTime + unloadingTime;

    // Расчет стоимости
    const { fuelCost, driverCost, totalCost } = calculateRouteCost(totalDistance, truck, totalTime);

    const route: Route = {
      id: `route-${Date.now()}`,
      truck,
      quarry: selectedQuarry,
      deliveryPoint: delivery,
      distance: Math.round(totalDistance * 100) / 100,
      time: Math.round(totalTime * 100) / 100,
      cost: 0,
      fuelCost: Math.round(fuelCost),
      driverCost: Math.round(driverCost),
      totalCost: Math.round(totalCost)
    };

    setCalculatedRoute(route);
  };

  const resetCalculation = () => {
    setSelectedTruck('');
    setSelectedDelivery('');
    setCalculatedRoute(null);
  };

  useEffect(() => {
    if (selectedQuarry) {
      resetCalculation();
    }
  }, [selectedQuarry]);

  if (!selectedQuarry) {
    return (
      <Card 
        title={
          <Space>
            <CalculatorOutlined style={{ color: '#1890ff' }} />
            <Text strong>Калькулятор маршрута</Text>
          </Space>
        }
        style={{ marginTop: '16px' }}
      >
        <Text type="secondary">Выберите карьер для расчета маршрута</Text>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <CalculatorOutlined style={{ color: '#1890ff' }} />
          <Text strong>Калькулятор маршрута</Text>
        </Space>
      }
      style={{ marginTop: '16px' }}
      extra={
        calculatedRoute && (
          <Button size="small" onClick={resetCalculation}>
            Сбросить
          </Button>
        )
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Выбор грузовика */}
        <div>
          <Text strong>Выберите грузовик:</Text>
          <Select
            style={{ width: '100%', marginTop: '8px' }}
            placeholder="Выберите грузовик"
            value={selectedTruck}
            onChange={setSelectedTruck}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {availableTrucks.map(truck => (
              <Option key={truck.id} value={truck.id}>
                <Space>
                  <TruckOutlined />
                  {truck.name} ({truck.capacity} т)
                </Space>
              </Option>
            ))}
          </Select>
        </div>

        {/* Выбор точки доставки */}
        <div>
          <Text strong>Выберите точку доставки:</Text>
          <Select
            style={{ width: '100%', marginTop: '8px' }}
            placeholder="Выберите точку доставки"
            value={selectedDelivery}
            onChange={setSelectedDelivery}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {deliveryPoints.map(delivery => (
              <Option key={delivery.id} value={delivery.id}>
                <Space>
                  <EnvironmentOutlined />
                  {delivery.name}
                  <Tag color={
                    delivery.urgency === 'high' ? 'red' : 
                    delivery.urgency === 'medium' ? 'orange' : 'green'
                  }>
                    {delivery.urgency === 'high' ? 'Срочно' : 
                     delivery.urgency === 'medium' ? 'Средне' : 'Не срочно'}
                  </Tag>
                </Space>
              </Option>
            ))}
          </Select>
        </div>

        {/* Кнопка расчета */}
        <Button 
          type="primary" 
          size="large"
          icon={<CalculatorOutlined />}
          onClick={calculateRoute}
          disabled={!selectedTruck || !selectedDelivery}
          style={{ width: '100%' }}
        >
          Рассчитать маршрут
        </Button>

        {/* Результаты расчета */}
        {calculatedRoute && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            
            <Alert
              message="Маршрут рассчитан!"
              description={`${calculatedRoute.truck.name} → ${calculatedRoute.quarry.name} → ${calculatedRoute.deliveryPoint.name}`}
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <Statistic
                    title="Расстояние"
                    value={calculatedRoute.distance}
                    suffix="км"
                    prefix={<CompassOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
                  <Statistic
                    title="Время"
                    value={calculatedRoute.time}
                    suffix="ч"
                    prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ fontSize: '18px', color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: '#fff1f0', border: '1px solid #ffccc7' }}>
                  <Statistic
                    title="Общая стоимость"
                    value={calculatedRoute.totalCost}
                    suffix="₽"
                    prefix={<DollarOutlined style={{ color: '#f5222d' }} />}
                    valueStyle={{ fontSize: '18px', color: '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Детализация стоимости */}
            <Card size="small" title="Детализация стоимости" style={{ background: '#fafafa' }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text>Топливо:</Text>
                </Col>
                <Col span={12}>
                  <Text strong style={{ color: '#fa8c16' }}>
                    {calculatedRoute.fuelCost} ₽
                  </Text>
                </Col>
                <Col span={12}>
                  <Text>Зарплата водителя:</Text>
                </Col>
                <Col span={12}>
                  <Text strong style={{ color: '#1890ff' }}>
                    {calculatedRoute.driverCost} ₽
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Итого:</Text>
                </Col>
                <Col span={12}>
                  <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                    {calculatedRoute.totalCost} ₽
                  </Text>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Space>
    </Card>
  );
};

export default RouteCalculator;
