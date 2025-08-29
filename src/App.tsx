import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Statistic, Card } from 'antd';
import { EnvironmentOutlined, ShoppingOutlined } from '@ant-design/icons';
import './App.css';

import QuarryMap from './components/QuarryMap';
import QuarryInfo from './components/QuarryInfo';
import QuarryFilters from './components/QuarryFilters';
import { QuarryPoint } from './types/quarry';
import { quarriesData } from './data/quarriesData';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [quarries, setQuarries] = useState<QuarryPoint[]>([]);
  const [filteredQuarries, setFilteredQuarries] = useState<QuarryPoint[]>([]);
  const [selectedQuarry, setSelectedQuarry] = useState<QuarryPoint | null>(null);

  useEffect(() => {
    // Используем демо данные
    setQuarries(quarriesData);
    setFilteredQuarries(quarriesData);
  }, []);

  const handleQuarrySelect = (quarry: QuarryPoint) => {
    setSelectedQuarry(quarry);
  };

  const handleFilterChange = (filtered: QuarryPoint[]) => {
    setFilteredQuarries(filtered);
    setSelectedQuarry(null);
  };

  const totalMaterials = quarries.reduce((sum, quarry) => sum + quarry.materials.length, 0);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Row align="middle" style={{ height: '100%' }}>
          <Col>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              <EnvironmentOutlined /> Карта карьеров
            </Title>
          </Col>
          <Col flex="auto" />
          <Col>
            <Row gutter={16}>
              <Col>
                <Statistic 
                  title="Карьеров" 
                  value={quarries.length} 
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col>
                <Statistic 
                  title="Материалов" 
                  value={totalMaterials} 
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6}>
            <QuarryFilters 
              quarries={quarries} 
              onFilterChange={handleFilterChange} 
            />
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Карта карьеров" size="small">
              <QuarryMap
                quarries={filteredQuarries}
                selectedQuarry={selectedQuarry}
                onQuarrySelect={handleQuarrySelect}
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={6}>
            <QuarryInfo quarry={selectedQuarry} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
