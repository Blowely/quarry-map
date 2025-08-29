import React, { useState, useEffect, useCallback } from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { QuarryPoint } from '../types/quarry';

const { Search } = Input;
const { Option } = Select;

interface QuarryFiltersProps {
  quarries: QuarryPoint[];
  onFilterChange: (filtered: QuarryPoint[]) => void;
}

const QuarryFilters: React.FC<QuarryFiltersProps> = ({ quarries, onFilterChange }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  const filterQuarries = useCallback(() => {
    let filtered = quarries;

    // Фильтр по тексту поиска
    if (searchText.trim()) {
      filtered = filtered.filter(quarry =>
        quarry.name.toLowerCase().includes(searchText.toLowerCase()) ||
        quarry.company.toLowerCase().includes(searchText.toLowerCase()) ||
        quarry.contact.includes(searchText)
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

  useEffect(() => {
    // Применяем фильтры только если есть активные условия
    if (searchText.trim() || selectedMaterial) {
      filterQuarries();
    } else {
      // Если фильтры не заданы, показываем все карьеры
      onFilterChange(quarries);
    }
  }, [searchText, selectedMaterial, quarries, filterQuarries, onFilterChange]);

  // Получаем уникальные материалы для фильтра
  const uniqueMaterials = Array.from(
    new Set(quarries.flatMap(quarry => quarry.materials.map(m => m.name)))
  ).sort();

  return (
    <Space size="middle" style={{ width: '100%' }}>
      <Search
        placeholder="Поиск по названию, компании, контактам"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: '280px' }}
        size="middle"
        prefix={<SearchOutlined />}
      />
      <Select
        placeholder="Материал"
        value={selectedMaterial}
        onChange={setSelectedMaterial}
        allowClear
        style={{ width: '160px' }}
        size="middle"
        prefix={<FilterOutlined />}
      >
        {uniqueMaterials.map(material => (
          <Option key={material} value={material}>
            {material}
          </Option>
        ))}
      </Select>
    </Space>
  );
};

export default QuarryFilters;
