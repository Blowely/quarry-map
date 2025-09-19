import React from 'react';
import { Steps, Card, Row, Col } from 'antd';
import { 
  EnvironmentOutlined, 
  ShoppingOutlined, 
  CompassOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';

const { Step } = Steps;

interface StepWizardProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
  children: React.ReactNode;
}

const StepWizard: React.FC<StepWizardProps> = ({ currentStep, onStepChange, children }) => {
  const steps = [
    {
      title: 'Выбор точки доставки',
      icon: <EnvironmentOutlined />,
      description: 'Выберите куда доставить материал'
    },
    {
      title: 'Выбор материала',
      icon: <ShoppingOutlined />,
      description: 'Укажите материал и его характеристики'
    },
    {
      title: 'Рекомендации карьеров',
      icon: <CompassOutlined />,
      description: 'Система покажет подходящие карьеры'
    },
    {
      title: 'Расчет и маршрут',
      icon: <CheckCircleOutlined />,
      description: 'Финальный расчет и планирование маршрута'
    }
  ];

  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Steps 
            current={currentStep} 
            onChange={onStepChange}
            size="small"
            style={{ marginBottom: 24 }}
          >
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                icon={step.icon}
                description={step.description}
                status={
                  index < currentStep ? 'finish' : 
                  index === currentStep ? 'process' : 'wait'
                }
              />
            ))}
          </Steps>
        </Col>
        <Col span={24}>
          {children}
        </Col>
      </Row>
    </Card>
  );
};

export default StepWizard;
