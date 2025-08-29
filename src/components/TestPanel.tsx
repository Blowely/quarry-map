import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { QuarryPoint } from '../types/quarry';

const { Text } = Typography;

interface TestPanelProps {
  selectedQuarry: QuarryPoint | null;
  onTestSelect: (quarry: QuarryPoint) => void;
  quarries: QuarryPoint[];
}

const TestPanel: React.FC<TestPanelProps> = ({ selectedQuarry, onTestSelect, quarries }) => {
  return (
    <Card title="Тестовая панель" size="small" style={{ marginBottom: '16px' }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text strong>Выбранный карьер:</Text>
        <Text>{selectedQuarry ? selectedQuarry.name : 'Не выбран'}</Text>
        
        <Text strong>Тестовые кнопки:</Text>
        <Space wrap>
          {quarries.slice(0, 3).map(quarry => (
            <Button 
              key={quarry.id} 
              size="small"
              onClick={() => onTestSelect(quarry)}
            >
              {quarry.name}
            </Button>
          ))}
        </Space>
        
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Откройте консоль браузера (F12) для просмотра логов
        </Text>
      </Space>
    </Card>
  );
};

export default TestPanel;
