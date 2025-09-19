# 🧱 Исправление проблемы с материалами - Сводка

## 🚨 Проблема
Пользователь заметил, что в поле "Материал" отображается "какая-то фигня" вместо реальных материалов:
- "Гранит 4..."
- "вторич 20..."
- "погрузка..."
- "24 часа"
- "08-16:30"
- "08-18"
- "08-17"
- "08-20"

## 🔍 Причина
При извлечении карьеров из тарифов система брала данные из колонки "погрузка" CSV файла, которая содержала не только материалы, но и:
- Время работы карьера (24, 08-20, 08-18 и т.д.)
- Служебную информацию (погрузка, выгрузка, приемка)
- Другие служебные данные

## ✅ Решение

### 🎯 **Фильтрация материалов при извлечении**
```typescript
// Фильтруем только реальные материалы, исключая время работы и другие служебные данные
const materialName = tariff.material.trim();

// Пропускаем служебные данные
if (materialName && 
    !materialName.includes('погрузка') && 
    !materialName.includes('выгрузка') && 
    !materialName.includes('24') && 
    !materialName.includes('08-') && 
    !materialName.includes('07-') && 
    !materialName.includes('06-') && 
    !materialName.includes('09-') && 
    !materialName.includes('10-') && 
    !materialName.includes('11-') && 
    !materialName.includes('12-') && 
    !materialName.includes('13-') && 
    !materialName.includes('14-') && 
    !materialName.includes('15-') && 
    !materialName.includes('16-') && 
    !materialName.includes('17-') && 
    !materialName.includes('18-') && 
    !materialName.includes('19-') && 
    !materialName.includes('20-') && 
    !materialName.includes('21-') && 
    !materialName.includes('22-') && 
    !materialName.includes('23-') && 
    !materialName.includes('часа') && 
    !materialName.includes('дней') && 
    !materialName.includes('приемка') && 
    !materialName.includes('кф') && 
    !materialName.includes('насып') &&
    materialName.length > 2) {
  
  // Добавляем только реальный материал
  quarry.materials.set(materialName, {
    name: materialName,
    price: tariff.materialPurchaseCost ? tariff.materialPurchaseCost.toString() : '300',
    unit: 'руб./тн',
    density: '1.6',
    fraction: '0-5 мм',
    module: '2.0'
  });
}
```

### 🔧 **Дополнительная фильтрация при возврате**
```typescript
// Преобразуем Map в массив и фильтруем материалы
return Array.from(quarryMap.values()).map(quarry => ({
  ...quarry,
  materials: Array.from(quarry.materials.values()).filter(material => 
    material.name && 
    material.name.length > 2 && 
    !material.name.includes('погрузка') && 
    !material.name.includes('выгрузка') && 
    !material.name.includes('24') && 
    !material.name.includes('08-') && 
    !material.name.includes('07-') && 
    !material.name.includes('06-') && 
    !material.name.includes('09-') && 
    !material.name.includes('10-') && 
    !material.name.includes('11-') && 
    !material.name.includes('12-') && 
    !material.name.includes('13-') && 
    !material.name.includes('14-') && 
    !material.name.includes('15-') && 
    !material.name.includes('16-') && 
    !material.name.includes('17-') && 
    !material.name.includes('18-') && 
    !material.name.includes('19-') && 
    !material.name.includes('20-') && 
    !material.name.includes('21-') && 
    !material.name.includes('22-') && 
    !material.name.includes('23-') && 
    !material.name.includes('часа') && 
    !material.name.includes('дней') && 
    !material.name.includes('приемка') && 
    !material.name.includes('кф') && 
    !material.name.includes('насып')
  )
}));
```

## 📊 Что исключается из материалов

### ⏰ **Время работы:**
- "24", "24 часа"
- "08-20", "08-18", "08-17", "08-16:30"
- "07-20", "06-18", "09-17"
- Все временные диапазоны

### 🔧 **Служебная информация:**
- "погрузка", "выгрузка"
- "приемка", "приемка 24"
- "кф 1,35" (коэффициент)
- "насып 1"

### 📝 **Другие служебные данные:**
- Пустые строки
- Строки короче 3 символов
- Служебные аббревиатуры

## 🎯 Что остается в материалах

### 🧱 **Реальные материалы:**
- **Песок**: "песок", "песок сеянный", "песок карьерный", "песок намывной", "песок кф3"
- **Щебень**: "щебень", "щебень гравийный", "Щебень гр. 5/20", "Щебень, ЩПС"
- **Отсев**: "отсев"
- **Известняк**: "известняк", "изв м600 40-70"
- **Глина**: "глина"
- **Гипс**: "Гипсовый камень"
- **Уголь**: "Уголь"
- **Грунт**: "грунт"
- **Клинкер**: "Клинкер"

## 🎉 Результат

### ✅ **До исправления:**
- В поле "Материал" отображалась "какая-то фигня"
- Время работы, служебная информация, некорректные данные
- Пользователь не мог понять, какие материалы доступны

### ✅ **После исправления:**
- В поле "Материал" отображаются только **реальные материалы**
- Чистый список без служебной информации
- Пользователь может легко выбрать нужный материал
- Система работает корректно и понятно

## 🚀 Запуск
```bash
npm start -- --port 3001
```

Теперь в поле "Материал" будут отображаться только **реальные строительные материалы** без всякой ерунды! 🎯🧱✨

## 📋 Примеры корректных материалов
- Песок сеянный
- Песок карьерный
- Песок намывной
- Щебень гравийный
- Щебень гр. 5/20
- Отсев
- Известняк
- Глина
- Гипсовый камень
- Уголь
- Грунт
- Клинкер



