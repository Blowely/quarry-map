import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Select, InputNumber, Row, Col, Space, Typography, Alert, Divider } from 'antd';
import { ShoppingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { QuarryPoint } from '../types/quarry';

const { Title, Text } = Typography;
const { Option } = Select;

interface MaterialSelectorProps {
  quarries: QuarryPoint[];
  onMaterialSelect: (material: string, weight: number, unit: string) => void;
  selectedMaterial?: string;
  selectedWeight?: number;
  selectedUnit?: string;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  quarries,
  onMaterialSelect,
  selectedMaterial = '',
  selectedWeight = 0,
  selectedUnit = 'тн'
}) => {
  const [form] = Form.useForm();
  const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);

  // Получаем все доступные материалы из карьеров
  useEffect(() => {
    const materials = new Set<string>();
    quarries.forEach(quarry => {
      quarry.materials.forEach(material => {
        materials.add(material.name);
      });
    });
    setAvailableMaterials(Array.from(materials).sort());
  }, [quarries]);

  // Получаем информацию о выбранном материале
  const materialInfo = useMemo(() => {
    if (!selectedMaterial) return null;
    
    const materialData = quarries
      .flatMap(q => q.materials)
      .find(m => m.name === selectedMaterial);
    
    return materialData;
  }, [selectedMaterial, quarries]);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    if (values.material && values.weight && values.unit) {
      onMaterialSelect(values.material, values.weight, values.unit);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      material: selectedMaterial,
      weight: selectedWeight,
      unit: selectedUnit
    });
  }, [selectedMaterial, selectedWeight, selectedUnit, form]);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <ShoppingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        Выберите материал и характеристики
      </Title>

      <Alert
        message="Укажите материал, который нужно доставить"
        description="Система найдет карьеры, которые производят этот материал"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Материал"
              name="material"
              rules={[{ required: true, message: 'Выберите материал' }]}
            >
              <Select
                placeholder="Выберите материал"
                showSearch
                size="large"
                style={{ width: '100%' }}
              >
                {availableMaterials.map(material => (
                  <Option key={material} value={material}>
                    {material}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              label="Количество"
              name="weight"
              rules={[{ required: true, message: 'Укажите количество' }]}
            >
              <InputNumber
                placeholder="Количество"
                min={0.1}
                step={0.1}
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          
          <Col span={6}>
            <Form.Item
              label="Единица измерения"
              name="unit"
              rules={[{ required: true, message: 'Выберите единицу' }]}
            >
              <Select size="large" style={{ width: '100%' }}>
                <Option value="тн">Тонны (тн)</Option>
                <Option value="м3">Кубические метры (м³)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {materialInfo && (
        <Card size="small" style={{ marginTop: 16 }}>
          <Title level={5} style={{ marginBottom: 12 }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Информация о материале
          </Title>
          
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Плотность:</Text>
              <br />
              <Text>{materialInfo.density || 'Не указана'}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Фракция:</Text>
              <br />
              <Text>{materialInfo.fraction || 'Не указана'}</Text>
            </Col>
            <Col span={8}>
              <Text strong>Модуль:</Text>
              <br />
              <Text>{materialInfo.module || 'Не указан'}</Text>
            </Col>
          </Row>
          
          {materialInfo.price && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Text strong>Средняя цена: </Text>
              <Text style={{ color: '#52c41a', fontSize: '16px' }}>
                {materialInfo.price} руб./{materialInfo.unit || 'тн'}
              </Text>
            </>
          )}
        </Card>
      )}

      {selectedMaterial && selectedWeight > 0 && (
        <Alert
          message={`Выбран материал: ${selectedMaterial}`}
          description={`Количество: ${selectedWeight} ${selectedUnit}`}
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default MaterialSelector;
