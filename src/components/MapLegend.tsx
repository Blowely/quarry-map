import React, { useState } from 'react';
import { Card, Space, Typography, Button } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

const { Text } = Typography;

const MapLegend: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleLegend = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card 
      size="small" 
      style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        minWidth: '200px',
        transition: 'all 0.3s ease'
      }}
      title={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }} onClick={toggleLegend}>
          <span>Легенда карты</span>
          <Button 
            type="text" 
            size="small" 
            icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
            style={{ 
              color: '#8c8c8c',
              padding: '0',
              minWidth: 'auto'
            }}
          />
        </div>
      }
      bodyStyle={{ 
        padding: isCollapsed ? '0' : '16px',
        maxHeight: isCollapsed ? '0' : '300px',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#1890ff', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Q
          </div>
          <Text style={{ fontSize: '12px' }}>Карьеры</Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#fa8c16', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            T
          </div>
          <Text style={{ fontSize: '12px' }}>Грузовики</Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#f5222d', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            D
          </div>
          <Text style={{ fontSize: '12px' }}>Высокая срочность</Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#fa8c16', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            D
          </div>
          <Text style={{ fontSize: '12px' }}>Средняя срочность</Text>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#52c41a', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            D
          </div>
          <Text style={{ fontSize: '12px' }}>Низкая срочность</Text>
        </div>
        
        <div style={{ 
          height: '2px', 
          backgroundColor: '#d9d9d9', 
          margin: '8px 0' 
        }} />
        
        <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
          Кликните на иконку для выбора
        </Text>
      </Space>
    </Card>
  );
};

export default MapLegend;
