import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Row, Col, Card, Space } from 'antd';
import { EnvironmentOutlined, ShoppingOutlined, CarOutlined } from '@ant-design/icons';
import './App.css';

import QuarryMap from './components/QuarryMap';
import QuarryInfo from './components/QuarryInfo';
import QuarryFilters from './components/QuarryFilters';

import RouteCalculator from './components/RouteCalculator';
import { QuarryPoint } from './types/quarry';
import { quarriesData } from './data/quarriesData';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [quarries, setQuarries] = useState<QuarryPoint[]>([]);
  const [filteredQuarries, setFilteredQuarries] = useState<QuarryPoint[]>([]);
  const [selectedQuarry, setSelectedQuarry] = useState<QuarryPoint | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

  useEffect(() => {
    console.log('App: Загружаем демо данные');
    setQuarries(quarriesData);
    setFilteredQuarries(quarriesData);
  }, []);

  useEffect(() => {
    console.log('App: selectedQuarry изменился на:', selectedQuarry);
  }, [selectedQuarry]);

  const handleQuarrySelect = (quarry: QuarryPoint) => {
    console.log('App: Карьер выбран:', quarry.name);
    console.log('App: Обновляем selectedQuarry на:', quarry);
    setSelectedQuarry(quarry);
  };

  const handleFilterChange = useCallback((filtered: QuarryPoint[]) => {
    console.log('App: Фильтры изменились, количество карьеров:', filtered.length);
    setFilteredQuarries(filtered);
    // НЕ сбрасываем выбранный карьер при изменении фильтров
    // setSelectedQuarry(null);
  }, []);

  const handleTruckSelect = useCallback((truck: any) => {
    console.log('App: Грузовик выбран:', truck.name);
    setSelectedTruck(truck);
  }, []);

  const handleDeliverySelect = useCallback((delivery: any) => {
    console.log('App: Точка доставки выбрана:', delivery.name);
    setSelectedDelivery(delivery);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#001529', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          🗺️ Карта карьеров
        </Title>
      </Header>
      
      <Content style={{ padding: '12px' }}>
        <Row gutter={[16, 12]}>
          {/* Статистика - компактная в одну строку */}
          <Col span={24}>
            <Card size="small" style={{ padding: '12px 20px' }}>
              <Row gutter={16} align="middle" justify="space-between">
                <Col>
                  <Space size="large">
                    <Space>
                      <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                      <Text strong style={{ fontSize: '15px' }}>{quarries.length} карьеров</Text>
                    </Space>
                    <Space>
                      <ShoppingOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                      <Text strong style={{ fontSize: '15px' }}>{quarries.reduce((sum, q) => sum + q.materials.length, 0)} материалов</Text>
                    </Space>
                    <Space>
                      <Text style={{ fontSize: '15px' }}>
                        Выбран: <Text strong style={{ color: selectedQuarry ? '#52c41a' : '#fa8c16' }}>
                          {selectedQuarry ? selectedQuarry.name : 'Нет'}
                        </Text>
                      </Text>
                    </Space>
                    <Space>
                      <Text style={{ fontSize: '15px' }}>
                        Фильтр: <Text strong style={{ color: '#722ed1' }}>{filteredQuarries.length}</Text>
                      </Text>
                    </Space>
                    <Space>
                      <CarOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
                      <Text strong style={{ fontSize: '15px' }}>4 машин</Text>
                    </Space>
                  </Space>
                </Col>
                
                {/* Фильтры - увеличенные размеры */}
                <Col>
                  <QuarryFilters 
                    quarries={quarries} 
                    onFilterChange={handleFilterChange} 
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Левая панель - только калькулятор маршрута */}
          <Col xs={24} lg={6}>
            <RouteCalculator 
              selectedQuarry={selectedQuarry}
              selectedTruckFromMap={selectedTruck}
              selectedDeliveryFromMap={selectedDelivery}
            />
          </Col>
          
          {/* Центральная панель - карта */}
          <Col xs={24} lg={12}>
            <Card title="Карта карьеров" size="small">
              <QuarryMap
                quarries={filteredQuarries}
                selectedQuarry={selectedQuarry}
                onQuarrySelect={handleQuarrySelect}
                onTruckSelect={handleTruckSelect}
                onDeliverySelect={handleDeliverySelect}
              />
            </Card>
          </Col>
          
          {/* Правая панель - только информация о карьере */}
          <Col xs={24} lg={6}>
            <QuarryInfo quarry={selectedQuarry} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
