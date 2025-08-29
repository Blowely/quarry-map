import React from 'react';
import { Card, Select, Input, Space, Typography } from 'antd';
import { QuarryPoint } from '../types/quarry';

const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;

interface QuarryFiltersProps {
  quarries: QuarryPoint[];
  onFilterChange: (filteredQuarries: QuarryPoint[]) => void;
}

const QuarryFilters: React.FC<QuarryFiltersProps> = ({ quarries, onFilterChange }) => {
  const [searchText, setSearchText] = React.useState('');
  const [selectedMaterial, setSelectedMaterial] = React.useState<string>('');

  // Получаем уникальные материалы
  const materials = React.useMemo(() => {
    const materialSet = new Set<string>();
    quarries.forEach(quarry => {
      quarry.materials.forEach(material => {
        if (material.name) {
          materialSet.add(material.name);
        }
      });
    });
    return Array.from(materialSet).sort();
  }, [quarries]);

  React.useEffect(() => {
    let filtered = quarries;

    // Фильтр по поиску
    if (searchText) {
      filtered = filtered.filter(quarry =>
        quarry.name.toLowerCase().includes(searchText.toLowerCase()) ||
        quarry.company.toLowerCase().includes(searchText.toLowerCase()) ||
        quarry.materials.some(material => 
          material.name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Фильтр по материалу
    if (selectedMaterial) {
      filtered = filtered.filter(quarry =>
        quarry.materials.some(material => material.name === selectedMaterial)
      );
    }

    onFilterChange(filtered);
  }, [searchText, selectedMaterial, quarries, onFilterChange]);

  return (
    <Card size="small">
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div>
          <Text strong>Поиск</Text>
          <Search
            placeholder="Поиск по названию, компании или материалу"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>
        
        <div>
          <Text strong>Материал</Text>
          <Select
            placeholder="Выберите материал"
            value={selectedMaterial}
            onChange={setSelectedMaterial}
            allowClear
            style={{ width: '100%' }}
          >
            {materials.map(material => (
              <Option key={material} value={material}>
                {material}
              </Option>
            ))}
          </Select>
        </div>
      </Space>
    </Card>
  );
};

export default QuarryFilters;
