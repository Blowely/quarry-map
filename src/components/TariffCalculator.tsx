import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Form, 
  Select, 
  InputNumber, 
  Input,
  Button, 
  Space, 
  Typography, 
  Divider, 
  Row, 
  Col, 
  Statistic, 
  Alert, 
  message
} from 'antd';
import { 
  CalculatorOutlined, 
  FileTextOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { QuarryPoint, Material } from '../types/quarry';
import { Tariff, TariffCalculation } from '../types/tariff';
import { loadTariffsFromCSV, findTariffsByQuarryAndMaterial, getUniqueDestinations } from '../data/tariffsData';
import { calculateDeliveryCost } from '../utils/tariffParser';

const { Title, Text } = Typography;
const { Option } = Select;

interface TariffCalculatorProps {
  quarries: QuarryPoint[];
  selectedDestination?: string;
  selectedMaterial?: string;
  onDestinationChange?: (destination: string) => void;
  onMaterialChange?: (material: string) => void;
  onQuarrySelect?: (quarry: QuarryPoint) => void;
}

const TariffCalculator: React.FC<TariffCalculatorProps> = ({ 
  quarries, 
  selectedDestination = '', 
  selectedMaterial = '',
  onDestinationChange,
  onMaterialChange,
  onQuarrySelect
}) => {
  const [form] = Form.useForm();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [calculation, setCalculation] = useState<TariffCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [suitableQuarries, setSuitableQuarries] = useState<QuarryPoint[]>([]);

  // Автоматическая загрузка тарифов при запуске
  useEffect(() => {
    const loadTariffs = async () => {
      try {
        const loadedTariffs = await loadTariffsFromCSV();
        setTariffs(loadedTariffs);
        console.log('TariffCalculator: Загружено тарифов:', loadedTariffs.length);
      } catch (error) {
        console.error('TariffCalculator: Ошибка загрузки тарифов:', error);
      }
    };
    
    loadTariffs();
  }, []);

  // Автоматический поиск карьеров при изменении направления или материала
  useEffect(() => {
    if (selectedDestination && selectedMaterial) {
      findSuitableQuarries(selectedDestination, selectedMaterial);
    }
  }, [selectedDestination, selectedMaterial, tariffs, quarries]);

  // Получаем уникальные материалы из всех карьеров
  const allMaterials = useMemo(() => {
    const materials = new Set<string>();
    quarries.forEach(quarry => {
      quarry.materials.forEach(material => {
        materials.add(material.name);
      });
    });
    return Array.from(materials);
  }, [quarries]);

  // Получаем уникальные направления из тарифов
  const allDestinations = useMemo(() => {
    return getUniqueDestinations(tariffs);
  }, [tariffs]);

  // Функция поиска подходящих карьеров
  const findSuitableQuarries = (destination: string, material: string) => {
    if (!destination || !material) {
      setSuitableQuarries([]);
      return;
    }

    // Ищем тарифы для данного направления и материала
    const relevantTariffs = tariffs.filter(tariff => 
      tariff.toDestination === destination && 
      tariff.fromQuarry.toLowerCase().includes(material.toLowerCase())
    );

    // Получаем карьеры, которые имеют этот материал
    const quarriesWithMaterial = quarries.filter(quarry => 
      quarry.materials.some(mat => mat.name === material)
    );

    // Сортируем карьеры по приоритету:
    // 1. Есть тарифы для данного направления
    // 2. Количество материалов в карьере
    // 3. Название карьера
    const sortedQuarries = quarriesWithMaterial
      .map(quarry => {
        const hasTariff = relevantTariffs.some(tariff => 
          tariff.fromQuarry === quarry.name
        );
        const materialCount = quarry.materials.length;
        
        return {
          ...quarry,
          priority: hasTariff ? 1000 : 0,
          materialCount,
          hasTariff
        };
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        if (a.materialCount !== b.materialCount) {
          return b.materialCount - a.materialCount;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5); // Показываем только топ-5

    setSuitableQuarries(sortedQuarries);
  };



  // Расчет тарифа
  const calculateTariff = () => {
    const values = form.getFieldsValue();
    if (!values.quarryId || !values.materialId || !values.destination || !values.weight) {
      message.warning('Заполните все обязательные поля');
      return;
    }

    setLoading(true);

    try {
      const selectedQuarry = quarries.find(q => q.id === values.quarryId);
      const selectedMaterial = selectedQuarry?.materials.find(m => m.name === values.materialId);
      
      if (!selectedQuarry || !selectedMaterial) {
        message.error('Карьер или материал не найден');
        return;
      }

      // Ищем подходящие тарифы
      const matchingTariffs = findTariffsByQuarryAndMaterial(
        tariffs, 
        selectedQuarry.name, 
        values.materialId
      );

      if (matchingTariffs.length === 0) {
        message.warning('Тарифы для данного направления не найдены');
        setLoading(false);
        return;
      }

      // Берем первый подходящий тариф (можно улучшить логику выбора)
      const bestTariff = matchingTariffs[0];
      
      // Рассчитываем стоимость доставки
      const deliveryCost = calculateDeliveryCost(
        bestTariff, 
        bestTariff.distance, 
        values.weight
      );

      // Стоимость материала
      const materialCost = (parseFloat(selectedMaterial.price || '0') || 0) * values.weight;

      // Итоговая стоимость
      const totalCost = materialCost + deliveryCost;

      const newCalculation: TariffCalculation = {
        quarryId: values.quarryId,
        materialId: values.materialId,
        destinationId: values.destination,
        transportType: bestTariff.transportType,
        distance: bestTariff.distance,
        weight: values.weight,
        unit: values.unit || 'тн',
        
        materialCost,
        deliveryCost,
        totalCost,
        pricePerUnit: totalCost / values.weight,
        pricePerKm: totalCost / bestTariff.distance,
        
        fuelCost: bestTariff.fuelCost,
        driverCost: bestTariff.driverCost,
        otherCosts: bestTariff.otherCosts,
        profit: bestTariff.actualProfit,
        
        quarryName: selectedQuarry.name,
        quarryCompany: selectedQuarry.company || 'Не указана',
        quarryContact: selectedQuarry.contact || 'Не указаны',
        
        materialName: selectedMaterial.name,
        materialDensity: selectedMaterial.density ? parseFloat(selectedMaterial.density) : undefined,
        materialFraction: selectedMaterial.fraction,
        materialModule: selectedMaterial.module
      };

      setCalculation(newCalculation);
      message.success('Расчет выполнен успешно!');
    } catch (error) {
      message.error('Ошибка при расчете');
      console.error('Ошибка расчета:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики изменений полей
  const handleDestinationChange = (value: string) => {
    onDestinationChange?.(value);
    if (selectedMaterial) {
      findSuitableQuarries(value, selectedMaterial);
    }
  };

  const handleMaterialChange = (value: string) => {
    onMaterialChange?.(value);
    if (selectedDestination) {
      findSuitableQuarries(selectedDestination, value);
    }
  };

  // Сброс формы
  const resetForm = () => {
    form.resetFields();
    setCalculation(null);
    setSuitableQuarries([]);
    onDestinationChange?.('');
    onMaterialChange?.('');
  };

  // Обработчик выбора карьера
  const handleQuarrySelect = (quarry: QuarryPoint) => {
    form.setFieldsValue({ quarryId: quarry.id });
    onQuarrySelect?.(quarry);
  };

  // Генерация КП
  const generateKP = () => {
    if (!calculation) return;
    
    const kpText = `
КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ

Карьер: ${calculation.quarryName}
Компания: ${calculation.quarryCompany}
Контакты: ${calculation.quarryContact}

Материал: ${calculation.materialName}
Количество: ${calculation.weight} ${calculation.unit}
Направление: ${calculation.destinationId}

СТОИМОСТЬ:
- Материал: ${calculation.materialCost.toFixed(2)} руб.
- Доставка: ${calculation.deliveryCost.toFixed(2)} руб.
- ИТОГО: ${calculation.totalCost.toFixed(2)} руб.

Цена за ${calculation.unit}: ${calculation.pricePerUnit.toFixed(2)} руб.
Цена за км: ${calculation.pricePerKm.toFixed(2)} руб.

Условия поставки: согласно договору
Срок действия: 30 дней
    `;
    
    const blob = new Blob([kpText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `КП_${calculation.quarryName}_${calculation.materialName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('КП сгенерировано и скачано');
  };

  return (
    <Card 
      title={
        <Space>
          <CalculatorOutlined style={{ color: '#1890ff' }} />
          <span>Автоматизированный калькулятор тарифов</span>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      {/* Информация о загруженных тарифах */}
      <div style={{ marginBottom: 16 }}>
        <Alert
          message={`Загружено тарифов: ${tariffs.length}`}
          description="Тарифы автоматически загружены из файла tariffs.csv"
          type="info"
          showIcon
        />
      </div>

      {/* Форма расчета */}
      <Form
        form={form}
        layout="vertical"
        onFinish={calculateTariff}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Направление доставки"
              name="destination"
              rules={[{ required: true, message: 'Выберите направление' }]}
            >
              <Select 
                placeholder="Выберите направление" 
                showSearch
                onChange={handleDestinationChange}
              >
                {allDestinations.map(destination => (
                  <Option key={destination} value={destination}>
                    <Space>
                      <ShopOutlined />
                      {destination}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Материал"
              name="materialId"
              rules={[{ required: true, message: 'Выберите материал' }]}
            >
              <Select 
                placeholder="Выберите материал" 
                showSearch
                onChange={handleMaterialChange}
              >
                {allMaterials.map(material => (
                  <Option key={material} value={material}>
                    {material}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={8}>
            <Form.Item
              label="Количество"
              name="weight"
              rules={[{ required: true, message: 'Укажите количество' }]}
            >
              <InputNumber
                placeholder="Количество"
                min={0.1}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Единица измерения"
              name="unit"
              initialValue="тн"
            >
              <Select>
                <Option value="тн">Тонны (тн)</Option>
                <Option value="м3">Кубические метры (м³)</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={16}>
            <Form.Item label=" ">
              <Space size="small" wrap>
                <Button 
                  type="primary" 
                  icon={<CalculatorOutlined />}
                  onClick={calculateTariff}
                  loading={loading}
                  size="small"
                >
                  Рассчитать
                </Button>
                <Button 
                  onClick={resetForm}
                  size="small"
                >
                  Сбросить
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>

        {/* Скрытое поле для выбранного карьера */}
        <Form.Item name="quarryId" hidden>
          <Input />
        </Form.Item>

        {/* Блок с подходящими карьерами */}
        {suitableQuarries.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Divider orientation="left">
              <Text strong>Рекомендуемые карьеры для выбранного материала</Text>
            </Divider>
            <Row gutter={[8, 8]}>
              {suitableQuarries.map((quarry, index) => (
                <Col span={24} key={quarry.id}>
                  <Card 
                    size="small" 
                    hoverable
                    style={{ 
                      cursor: 'pointer',
                      border: form.getFieldValue('quarryId') === quarry.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                    }}
                    onClick={() => handleQuarrySelect(quarry)}
                  >
                    <Row align="middle" justify="space-between">
                      <Col flex="auto">
                        <Space>
                          <Text strong>#{index + 1}</Text>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          <Text strong>{quarry.name}</Text>
                          {quarry.hasTariff && (
                            <Text type="success" style={{ fontSize: '12px' }}>
                              ✓ Есть тариф
                            </Text>
                          )}
                        </Space>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {quarry.company || 'Компания не указана'} • {quarry.materials.length} материалов
                        </Text>
                      </Col>
                      <Col>
                        <Button 
                          type={form.getFieldValue('quarryId') === quarry.id ? 'primary' : 'default'}
                          size="small"
                        >
                          {form.getFieldValue('quarryId') === quarry.id ? 'Выбран' : 'Выбрать'}
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Form>

      {/* Результаты расчета */}
      {calculation && (
        <>
          <Divider />
          
          <Alert
            message="Расчет выполнен успешно!"
            description="Тариф рассчитан на основе данных о карьере и транспортных услугах"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

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
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Цена за единицу"
                value={calculation.pricePerUnit}
                precision={2}
                suffix={`руб./${calculation.unit}`}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>

          {/* Детализация расчета */}
          <Card size="small" title="Детализация расчета" style={{ marginBottom: 16 }}>
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

          {/* Кнопки действий */}
          <Space size="small" wrap>
            <Button 
              type="primary" 
              icon={<FileTextOutlined />}
              onClick={generateKP}
              size="small"
            >
              Сгенерировать КП
            </Button>
            <Button 
              icon={<TruckOutlined />}
              onClick={() => message.info('Функция планирования маршрута в разработке')}
              size="small"
            >
              Планировать маршрут
            </Button>
          </Space>
        </>
      )}

      {/* Статистика по тарифам */}
      {tariffs.length > 0 && (
        <>
          <Divider />
          <Card size="small" title="Статистика по тарифам">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Всего тарифов"
                  value={tariffs.length}
                  suffix="шт."
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Уникальных карьеров"
                  value={new Set(tariffs.map(t => t.fromQuarry)).size}
                  suffix="шт."
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Уникальных направлений"
                  value={new Set(tariffs.map(t => t.toDestination)).size}
                  suffix="шт."
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Средний тариф"
                  value={tariffs.reduce((sum, t) => sum + (t.actualTariff || 0), 0) / tariffs.length}
                  precision={2}
                  suffix="руб./тн"
                />
              </Col>
            </Row>
          </Card>
        </>
      )}
    </Card>
  );
};

export default TariffCalculator;
