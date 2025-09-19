import React from 'react';
import { Card, Row, Col, Button, Space, Typography, Statistic, Alert, Divider, message } from 'antd';
import { 
  CalculatorOutlined, 
  FileTextOutlined, 
  TruckOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { QuarryPoint, DeliveryPoint } from '../types/quarry';
import { TariffCalculation } from '../types/tariff';

const { Title, Text } = Typography;

interface FinalCalculationProps {
  selectedQuarry: QuarryPoint | null;
  selectedDeliveryPoint: DeliveryPoint | null;
  selectedMaterial: string;
  selectedWeight: number;
  selectedUnit: string;
  calculation: TariffCalculation | null;
  onCalculate: () => void;
  onGenerateKP: () => void;
  onPlanRoute: () => void;
  loading?: boolean;
}

const FinalCalculation: React.FC<FinalCalculationProps> = ({
  selectedQuarry,
  selectedDeliveryPoint,
  selectedMaterial,
  selectedWeight,
  selectedUnit,
  calculation,
  onCalculate,
  onGenerateKP,
  onPlanRoute,
  loading = false
}) => {
  const canCalculate = selectedQuarry && selectedDeliveryPoint && selectedMaterial && selectedWeight > 0;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <CalculatorOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        Финальный расчет и планирование
      </Title>

      {/* Информация о выбранных параметрах */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 12 }}>
          <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          Выбранные параметры
        </Title>
        
        <Row gutter={16}>
          <Col span={8}>
            <Space direction="vertical" size={4}>
              <Text strong>Карьер:</Text>
              <Text>{selectedQuarry?.name || 'Не выбран'}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {selectedQuarry?.company || 'Компания не указана'}
              </Text>
            </Space>
          </Col>
          
          <Col span={8}>
            <Space direction="vertical" size={4}>
              <Text strong>Точка доставки:</Text>
              <Text>{selectedDeliveryPoint?.name || 'Не выбрана'}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {selectedDeliveryPoint?.address || 'Адрес не указан'}
              </Text>
            </Space>
          </Col>
          
          <Col span={8}>
            <Space direction="vertical" size={4}>
              <Text strong>Материал:</Text>
              <Text>{selectedMaterial || 'Не выбран'}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {selectedWeight} {selectedUnit}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Кнопка расчета */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={4}>
              <Text strong>Готов к расчету</Text>
              <Text type="secondary">
                {canCalculate 
                  ? 'Все параметры выбраны, можно рассчитать стоимость' 
                  : 'Выберите все необходимые параметры для расчета'
                }
              </Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<CalculatorOutlined />}
              onClick={onCalculate}
              loading={loading}
              disabled={!canCalculate}
            >
              Рассчитать стоимость
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Результаты расчета */}
      {calculation && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            Результаты расчета
          </Title>
          
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic
                title="Стоимость материала"
                value={calculation.materialCost}
                precision={2}
                suffix="руб."
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Стоимость доставки"
                value={calculation.deliveryCost}
                precision={2}
                suffix="руб."
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Итоговая стоимость"
                value={calculation.totalCost}
                precision={2}
                suffix="руб."
                valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title={`Цена за ${calculation.unit}`}
                value={calculation.pricePerUnit}
                precision={2}
                suffix="руб."
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Информация о карьере:</Text>
              <br />
              <Text>Название: {calculation.quarryName}</Text>
              <br />
              <Text>Компания: {calculation.quarryCompany}</Text>
              <br />
              <Text>Контакты: {calculation.quarryContact}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Информация о материале:</Text>
              <br />
              <Text>Название: {calculation.materialName}</Text>
              <br />
              <Text>Плотность: {calculation.materialDensity || 'Не указана'}</Text>
              <br />
              <Text>Фракция: {calculation.materialFraction || 'Не указана'}</Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* Кнопки действий */}
      {calculation && (
        <Card size="small">
          <Title level={5} style={{ marginBottom: 12 }}>
            <TruckOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Дополнительные действия
          </Title>
          
          <Space wrap>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={onGenerateKP}
            >
              Сгенерировать КП
            </Button>
            <Button
              icon={<TruckOutlined />}
              onClick={onPlanRoute}
            >
              Планировать маршрут
            </Button>
            <Button
              onClick={() => message.info('Функция отправки заявки в разработке')}
            >
              Отправить заявку
            </Button>
          </Space>
        </Card>
      )}

      {/* Предупреждение если не все выбрано */}
      {!canCalculate && (
        <Alert
          message="Не все параметры выбраны"
          description="Для расчета необходимо выбрать карьер, точку доставки, материал и указать количество"
          type="warning"
          showIcon
        />
      )}
    </div>
  );
};

export default FinalCalculation;
