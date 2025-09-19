import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Row, Col, Card, Space, Button } from 'antd';
import { EnvironmentOutlined, ShoppingOutlined, CarOutlined, ReloadOutlined } from '@ant-design/icons';
import './App.css';

import StepWizard from './components/StepWizard';
import DeliveryPointSelector from './components/DeliveryPointSelector';
import MaterialSelector from './components/MaterialSelector';
import QuarryRecommendations from './components/QuarryRecommendations';
import FinalCalculation from './components/FinalCalculation';
import QuarryMap from './components/QuarryMap';

import { QuarryPoint, DeliveryPoint } from './types/quarry';
import { Tariff, TariffCalculation } from './types/tariff';
import { quarriesData } from './data/quarriesData';
import { loadQuarriesFromTariffs, loadTariffsFromCSV } from './data/tariffsData';
import { calculateDeliveryCost } from './utils/tariffParser';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  // Основные данные
  const [quarries, setQuarries] = useState<QuarryPoint[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  
  // Состояние пошагового процесса
  const [currentStep, setCurrentStep] = useState(0);
  
  // Выбранные параметры
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState<DeliveryPoint | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedWeight, setSelectedWeight] = useState<number>(0);
  const [selectedUnit, setSelectedUnit] = useState<string>('тн');
  const [selectedQuarry, setSelectedQuarry] = useState<QuarryPoint | null>(null);
  
  // Результаты расчета
  const [calculation, setCalculation] = useState<TariffCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  // Загрузка данных при запуске
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('App: Загружаем данные...');
        
        // Загружаем тарифы
        const loadedTariffs = await loadTariffsFromCSV();
        setTariffs(loadedTariffs);
        console.log('App: Загружено тарифов:', loadedTariffs.length);
        
        // Загружаем карьеры
        const loadedQuarries = await loadQuarriesFromTariffs();
        if (loadedQuarries.length > 0) {
          console.log('App: Загружено карьеров из тарифов:', loadedQuarries.length);
          setQuarries(loadedQuarries);
        } else {
          console.log('App: Используем демо данные карьеров');
          setQuarries(quarriesData);
        }
      } catch (error) {
        console.error('App: Ошибка загрузки данных, используем демо данные:', error);
        setQuarries(quarriesData);
      }
    };
    
    loadData();
  }, []);

  // Обработчики пошагового процесса
  const handleDeliveryPointSelect = useCallback((delivery: DeliveryPoint) => {
    console.log('App: Точка доставки выбрана:', delivery.name);
    setSelectedDeliveryPoint(delivery);
    setCurrentStep(1); // Переходим к следующему шагу
  }, []);

  const handleMaterialSelect = useCallback((material: string, weight: number, unit: string) => {
    console.log('App: Материал выбран:', material, weight, unit);
    setSelectedMaterial(material);
    setSelectedWeight(weight);
    setSelectedUnit(unit);
    setCurrentStep(2); // Переходим к следующему шагу
  }, []);

  const handleQuarrySelect = useCallback((quarry: QuarryPoint) => {
    console.log('App: Карьер выбран:', quarry.name);
    setSelectedQuarry(quarry);
    setCurrentStep(3); // Переходим к финальному шагу
  }, []);

  // Расчет стоимости
  const handleCalculate = useCallback(async () => {
    if (!selectedQuarry || !selectedDeliveryPoint || !selectedMaterial || !selectedWeight) {
      return;
    }

    setLoading(true);
    try {
      const material = selectedQuarry.materials.find(m => m.name === selectedMaterial);
      if (!material) {
        throw new Error('Материал не найден в карьере');
      }

      // Ищем подходящие тарифы
      const relevantTariffs = tariffs.filter(tariff => 
        tariff.fromQuarry === selectedQuarry.name && 
        tariff.toDestination === selectedDeliveryPoint.name
      );

      let deliveryCost = 0;
      if (relevantTariffs.length > 0) {
        const bestTariff = relevantTariffs[0];
        deliveryCost = calculateDeliveryCost(bestTariff, bestTariff.distance, selectedWeight);
      }

      const materialCost = (parseFloat(material.price || '0') || 0) * selectedWeight;
      const totalCost = materialCost + deliveryCost;

      const newCalculation: TariffCalculation = {
        quarryId: selectedQuarry.id,
        materialId: selectedMaterial,
        destinationId: selectedDeliveryPoint.name,
        transportType: relevantTariffs[0]?.transportType || 'Не указан',
        distance: relevantTariffs[0]?.distance || 0,
        weight: selectedWeight,
        unit: selectedUnit,
        
        materialCost,
        deliveryCost,
        totalCost,
        pricePerUnit: totalCost / selectedWeight,
        pricePerKm: totalCost / (relevantTariffs[0]?.distance || 1),
        
        fuelCost: relevantTariffs[0]?.fuelCost || 0,
        driverCost: relevantTariffs[0]?.driverCost || 0,
        otherCosts: relevantTariffs[0]?.otherCosts || 0,
        profit: relevantTariffs[0]?.actualProfit || 0,
        
        quarryName: selectedQuarry.name,
        quarryCompany: selectedQuarry.company || 'Не указана',
        quarryContact: selectedQuarry.contact || 'Не указаны',
        
        materialName: material.name,
        materialDensity: material.density ? parseFloat(material.density) : undefined,
        materialFraction: material.fraction,
        materialModule: material.module
      };

      setCalculation(newCalculation);
    } catch (error) {
      console.error('Ошибка расчета:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedQuarry, selectedDeliveryPoint, selectedMaterial, selectedWeight, selectedUnit, tariffs]);

  // Генерация КП
  const handleGenerateKP = useCallback(() => {
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
  }, [calculation]);

  // Планирование маршрута
  const handlePlanRoute = useCallback(() => {
    console.log('Планирование маршрута...');
    // Здесь будет логика планирования маршрута
  }, []);

  // Сброс процесса
  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setSelectedDeliveryPoint(null);
    setSelectedMaterial('');
    setSelectedWeight(0);
    setSelectedUnit('тн');
    setSelectedQuarry(null);
    setCalculation(null);
  }, []);

  // Рендер контента в зависимости от текущего шага
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <DeliveryPointSelector
            onDeliverySelect={handleDeliveryPointSelect}
            selectedDelivery={selectedDeliveryPoint}
          />
        );
      case 1:
        return (
          <MaterialSelector
            quarries={quarries}
            onMaterialSelect={handleMaterialSelect}
            selectedMaterial={selectedMaterial}
            selectedWeight={selectedWeight}
            selectedUnit={selectedUnit}
          />
        );
      case 2:
        return (
          <QuarryRecommendations
            quarries={quarries}
            selectedMaterial={selectedMaterial}
            selectedWeight={selectedWeight}
            selectedUnit={selectedUnit}
            selectedDeliveryPoint={selectedDeliveryPoint}
            tariffs={tariffs}
            onQuarrySelect={handleQuarrySelect}
            selectedQuarry={selectedQuarry}
          />
        );
      case 3:
        return (
          <FinalCalculation
            selectedQuarry={selectedQuarry}
            selectedDeliveryPoint={selectedDeliveryPoint}
            selectedMaterial={selectedMaterial}
            selectedWeight={selectedWeight}
            selectedUnit={selectedUnit}
            calculation={calculation}
            onCalculate={handleCalculate}
            onGenerateKP={handleGenerateKP}
            onPlanRoute={handlePlanRoute}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#001529', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          🚛 Система планирования доставки материалов
        </Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={handleReset}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          Начать заново
        </Button>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          {/* Основной контент */}
          <Col span={24}>
            <StepWizard 
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            >
              {renderStepContent()}
            </StepWizard>
          </Col>

          {/* Карта - показываем только если есть выбранные данные */}
          {(selectedDeliveryPoint || selectedQuarry) && (
            <Col span={24}>
              <Card title="Карта" size="small">
                <QuarryMap
                  quarries={quarries}
                  selectedQuarry={selectedQuarry}
                  onQuarrySelect={() => {}} // Отключаем выбор через карту
                  onTruckSelect={() => {}}
                  onDeliverySelect={() => {}}
                />
              </Card>
            </Col>
          )}

          {/* Статистика */}
          <Col span={24}>
            <Card size="small" style={{ padding: '12px 20px' }}>
              <Row gutter={16} align="middle" justify="space-between">
                <Col>
                  <Space size="large">
                    <Space>
                      <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                      <Text strong style={{ fontSize: '15px' }}>
                        {quarries.length} карьеров
                      </Text>
                    </Space>
                    <Space>
                      <ShoppingOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                      <Text strong style={{ fontSize: '15px' }}>
                        {quarries.reduce((sum, q) => sum + q.materials.length, 0)} материалов
                      </Text>
                    </Space>
                    <Space>
                      <Text style={{ fontSize: '15px' }}>
                        Точка доставки: <Text strong style={{ color: selectedDeliveryPoint ? '#52c41a' : '#fa8c16' }}>
                          {selectedDeliveryPoint?.name || 'Не выбрана'}
                        </Text>
                      </Text>
                    </Space>
                    <Space>
                      <Text style={{ fontSize: '15px' }}>
                        Материал: <Text strong style={{ color: selectedMaterial ? '#52c41a' : '#fa8c16' }}>
                          {selectedMaterial || 'Не выбран'}
                        </Text>
                      </Text>
                    </Space>
                    <Space>
                      <Text style={{ fontSize: '15px' }}>
                        Карьер: <Text strong style={{ color: selectedQuarry ? '#52c41a' : '#fa8c16' }}>
                          {selectedQuarry?.name || 'Не выбран'}
                        </Text>
                      </Text>
                    </Space>
                    {calculation && (
                      <Space>
                        <Text style={{ fontSize: '15px' }}>
                          Стоимость: <Text strong style={{ color: '#52c41a' }}>
                            {calculation.totalCost.toFixed(0)} руб.
                          </Text>
                        </Text>
                      </Space>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
