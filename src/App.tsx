import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Row, Col, Statistic, Card } from 'antd';
import { EnvironmentOutlined, ShoppingOutlined } from '@ant-design/icons';
import './App.css';

import QuarryMap from './components/QuarryMap';
import QuarryInfo from './components/QuarryInfo';
import QuarryFilters from './components/QuarryFilters';
import TestPanel from './components/TestPanel';
import RouteCalculator from './components/RouteCalculator';
import { QuarryPoint } from './types/quarry';
import { quarriesData } from './data/quarriesData';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [quarries, setQuarries] = useState<QuarryPoint[]>([]);
  const [filteredQuarries, setFilteredQuarries] = useState<QuarryPoint[]>([]);
  const [selectedQuarry, setSelectedQuarry] = useState<QuarryPoint | null>(null);

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
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          {/* Статистика */}
          <Col span={24}>
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Всего карьеров"
                    value={quarries.length}
                    prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Доступно материалов"
                    value={quarries.reduce((sum, q) => sum + q.materials.length, 0)}
                    prefix={<ShoppingOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Выбран карьер"
                    value={selectedQuarry ? 'Да' : 'Нет'}
                    valueStyle={{ color: selectedQuarry ? '#52c41a' : '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Фильтровано"
                    value={filteredQuarries.length}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Фильтры */}
          <Col span={24}>
            <QuarryFilters 
              quarries={quarries} 
              onFilterChange={handleFilterChange} 
            />
          </Col>

          {/* Карта */}
          <Col span={16}>
            <QuarryMap
              quarries={filteredQuarries}
              selectedQuarry={selectedQuarry}
              onQuarrySelect={handleQuarrySelect}
            />
          </Col>

          {/* Правая панель */}
          <Col span={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Тестовая панель */}
              <TestPanel
                selectedQuarry={selectedQuarry}
                onTestSelect={handleQuarrySelect}
                quarries={filteredQuarries}
              />

              {/* Информация о карьере */}
              <QuarryInfo quarry={selectedQuarry} />

              {/* Калькулятор маршрута */}
              <RouteCalculator selectedQuarry={selectedQuarry} />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
