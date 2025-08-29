import React from 'react';
import { Card, Descriptions, Table, Tag, Typography, Space } from 'antd';
import { QuarryPoint } from '../types/quarry';

const { Title, Text } = Typography;

interface QuarryInfoProps {
  quarry: QuarryPoint | null;
}

const QuarryInfo: React.FC<QuarryInfoProps> = ({ quarry }) => {
  if (!quarry) {
    return (
      <Card>
        <Text type="secondary">Выберите карьер на карте для просмотра информации</Text>
      </Card>
    );
  }

  const materialColumns = [
    {
      title: 'Материал',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (text: string) => text ? <Tag color="green">{text}</Tag> : '-'
    },
    {
      title: 'Ед. изм.',
      dataIndex: 'unit',
      key: 'unit',
      render: (text: string) => text || '-'
    },
    {
      title: 'Плотность',
      dataIndex: 'density',
      key: 'density',
      render: (text: string) => text || '-'
    },
    {
      title: 'Модуль',
      dataIndex: 'module',
      key: 'module',
      render: (text: string) => text || '-'
    },
    {
      title: 'Фракция',
      dataIndex: 'fraction',
      key: 'fraction',
      render: (text: string) => text || '-'
    }
  ];

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>{quarry.name}</Title>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Компания">
              {quarry.company || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Контакты">
              {quarry.contact || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Транспорт">
              {quarry.transport || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="График работы">
              {quarry.schedule || 'Не указано'}
            </Descriptions.Item>
            <Descriptions.Item label="Координаты" span={2}>
              {quarry.coordinates[0].toFixed(6)}, {quarry.coordinates[1].toFixed(6)}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4}>Материалы ({quarry.materials.length})</Title>
          <Table
            dataSource={quarry.materials}
            columns={materialColumns}
            pagination={false}
            size="small"
            rowKey={(record, index) => `${record.name}-${index}`}
          />
        </div>
      </Space>
    </Card>
  );
};

export default QuarryInfo;
