import React from 'react';
import { Card, Button, Space, Typography, Row, Col } from 'antd';
import { 
  EnvironmentOutlined, 
  InfoCircleOutlined, 
  ExperimentOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { QuarryPoint } from '../types/quarry';

const { Text } = Typography;

interface TestPanelProps {
  selectedQuarry: QuarryPoint | null;
  onTestSelect: (quarry: QuarryPoint) => void;
  quarries: QuarryPoint[];
}

const TestPanel: React.FC<TestPanelProps> = ({ selectedQuarry, onTestSelect, quarries }) => {
  return (
    <Card 
      title={
        <Space>
          <ExperimentOutlined style={{ color: '#1890ff' }} />
          <Text strong>Тестовая панель</Text>
        </Space>
      }
      size="small" 
      style={{ 
        marginBottom: '16px',
        borderRadius: '8px',
        border: '1px solid #e8e8e8'
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Статус выбранного карьера */}
        <div style={{ textAlign: 'center', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
          <Text strong>Выбранный карьер:</Text>
          <div style={{ marginTop: '8px' }}>
            {selectedQuarry ? (
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ color: '#1890ff' }}>{selectedQuarry.name}</Text>
              </Space>
            ) : (
              <Text type="secondary">Не выбран</Text>
            )}
          </div>
        </div>
        
        {/* Тестовые кнопки */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            Тестовые кнопки:
          </Text>
          <Row gutter={[8, 8]}>
            {quarries.slice(0, 3).map(quarry => (
              <Col span={8} key={quarry.id}>
                <Button 
                  size="small"
                  type={selectedQuarry?.id === quarry.id ? 'primary' : 'default'}
                  onClick={() => onTestSelect(quarry)}
                  style={{ 
                    width: '100%',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  icon={<EnvironmentOutlined />}
                >
                  {quarry.name}
                </Button>
              </Col>
            ))}
          </Row>
        </div>
        
        {/* Инструкция */}
        <div style={{ 
          padding: '8px', 
          background: '#fff7e6', 
          border: '1px solid #ffd591',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <Space>
            <InfoCircleOutlined style={{ color: '#fa8c16' }} />
            <Text type="secondary">
              Откройте консоль браузера (F12) для просмотра логов
            </Text>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default TestPanel;
