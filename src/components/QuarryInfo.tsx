import React from 'react';
import { Card, Table, Tag, Typography, Space, Divider, Row, Col, Statistic, Button } from 'antd';
import { 
  EnvironmentOutlined, 
  PhoneOutlined, 
  ClockCircleOutlined, 
  TruckOutlined,
  InfoCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { QuarryPoint } from '../types/quarry';

const { Title, Text } = Typography;

interface QuarryInfoProps {
  quarry: QuarryPoint | null;
}

const QuarryInfo: React.FC<QuarryInfoProps> = ({ quarry }) => {
  console.log('QuarryInfo: получен карьер:', quarry);
  console.log('QuarryInfo: тип quarry:', typeof quarry);
  console.log('QuarryInfo: quarry === null:', quarry === null);
  
  if (!quarry) {
    console.log('QuarryInfo: отображаем пустое состояние');
    return (
      <Card 
        style={{ 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: 'none',
          borderRadius: '12px'
        }}
      >
        <InfoCircleOutlined style={{ fontSize: '48px', color: '#8c8c8c', marginBottom: '16px' }} />
        <Title level={4} style={{ color: '#8c8c8c', margin: '16px 0 8px 0' }}>
          Выберите карьер
        </Title>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          Кликните на маркер карьера на карте для просмотра подробной информации
        </Text>
      </Card>
    );
  }

  console.log('QuarryInfo: отображаем информацию для карьера:', quarry.name);
  console.log('QuarryInfo: материалы:', quarry.materials);

  const materialColumns = [
    {
      title: 'Материал',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (text: string) => text ? <Tag color="green" style={{ fontWeight: 'bold' }}>{text}</Tag> : '-'
    },
    {
      title: 'Ед. изм.',
      dataIndex: 'unit',
      key: 'unit',
      render: (text: string) => text ? <Tag color="blue">{text}</Tag> : '-'
    },
    {
      title: 'Плотность',
      dataIndex: 'density',
      key: 'density',
      render: (text: string) => text ? <Text code>{text}</Text> : '-'
    },
    {
      title: 'Модуль',
      dataIndex: 'module',
      key: 'module',
      render: (text: string) => text ? <Text code>{text}</Text> : '-'
    },
    {
      title: 'Фракция',
      dataIndex: 'fraction',
      key: 'fraction',
      render: (text: string) => text ? <Text code>{text}</Text> : '-'
    }
  ];

  const totalPrice = quarry.materials.reduce((sum, material) => {
    if (material.price) {
      const price = parseFloat(material.price.replace(/[^\d.,]/g, '').replace(',', '.'));
      return sum + (isNaN(price) ? 0 : price);
    }
    return sum;
  }, 0);

  return (
    <Card
      style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: 'none'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
            {quarry.name}
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            {quarry.company || 'Компания не указана'}
          </Text>
        </div>

        {/* Основная информация */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" style={{ background: '#f8f9fa', border: 'none' }}>
              <Statistic
                title="Материалов"
                value={quarry.materials.length}
                prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ fontSize: '20px', color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" style={{ background: '#f8f9fa', border: 'none' }}>
              <Statistic
                title="Средняя цена"
                value={totalPrice > 0 ? `${totalPrice.toFixed(0)} ₽` : 'Не указана'}
                valueStyle={{ fontSize: '20px', color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Контактная информация */}
        <Card 
          size="small" 
          title={
            <Space>
              <PhoneOutlined style={{ color: '#1890ff' }} />
              <Text strong>Контактная информация</Text>
            </Space>
          }
          style={{ background: '#fafafa', border: '1px solid #e8e8e8' }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Text strong>Телефон: </Text>
              <Text copyable style={{ color: '#1890ff' }}>
                {quarry.contact || 'Не указан'}
              </Text>
            </div>
            <div>
              <Text strong>Координаты: </Text>
              <Text code style={{ color: '#722ed1' }}>
                {quarry.coordinates[0].toFixed(6)}, {quarry.coordinates[1].toFixed(6)}
              </Text>
            </div>
          </Space>
        </Card>

        {/* Транспорт и график */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card 
              size="small" 
              title={
                <Space>
                  <TruckOutlined style={{ color: '#fa8c16' }} />
                  <Text strong>Транспорт</Text>
                </Space>
              }
              style={{ background: '#fff7e6', border: '1px solid #ffd591' }}
            >
              <Text>{quarry.transport || 'Не указан'}</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              size="small" 
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#52c41a' }} />
                  <Text strong>График работы</Text>
                </Space>
              }
              style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}
            >
              <Text>{quarry.schedule || 'Не указан'}</Text>
            </Card>
          </Col>
        </Row>

        {/* Материалы */}
        <div>
          <Title level={4} style={{ margin: '16px 0 12px 0', display: 'flex', alignItems: 'center' }}>
            <ShoppingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Материалы ({quarry.materials.length})
          </Title>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <Table
              dataSource={quarry.materials}
              columns={materialColumns}
              pagination={false}
              size="small"
              rowKey={(record, index) => `${record.name}-${index}`}
              style={{ 
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              scroll={{ y: 250 }}
            />
          </div>
        </div>

        {/* Кнопка действий */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<EnvironmentOutlined />}
            style={{ 
              borderRadius: '8px',
              height: '40px',
              padding: '0 24px'
            }}
          >
            Показать на карте
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default QuarryInfo;
