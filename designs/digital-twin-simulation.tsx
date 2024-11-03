import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Utensils, Heart, Moon } from 'lucide-react';

const LifestyleSlider = ({ icon: Icon, label, value, onChange, min = 0, max = 100 }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="font-medium text-gray-700">{label}</span>
      <span className="ml-auto text-sm text-gray-500">{value}%</span>
    </div>
    <Slider
      value={[value]}
      onValueChange={([newValue]) => onChange(newValue)}
      max={max}
      step={1}
      className="w-full"
    />
  </div>
);

const DigitalTwinSimulation = () => {
  const [lifestyle, setLifestyle] = useState({
    exercise: 50,
    diet: 50,
    sleep: 50,
    stress: 50
  });

  // Generate simulated health data based on lifestyle choices
  const generateHealthData = () => {
    const baseHealth = 70;
    const monthsAhead = 6;
    const data = [];
    
    for (let i = 0; i <= monthsAhead; i++) {
      const healthScore = baseHealth + 
        (lifestyle.exercise * 0.1) +
        (lifestyle.diet * 0.1) +
        (lifestyle.sleep * 0.05) -
        (lifestyle.stress * 0.05);
      
      data.push({
        month: i,
        health: Math.min(100, Math.max(0, healthScore + (i * (lifestyle.exercise + lifestyle.diet) / 100)))
      });
    }
    return data;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Digital Twin Simulation</CardTitle>
          <p className="text-gray-600">
            Curious about lifestyle changes? Use our Digital Twin to simulate different choices and see potential health impacts.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <LifestyleSlider
                icon={Activity}
                label="Physical Activity"
                value={lifestyle.exercise}
                onChange={(value) => setLifestyle({ ...lifestyle, exercise: value })}
              />
              
              <LifestyleSlider
                icon={Utensils}
                label="Diet Quality"
                value={lifestyle.diet}
                onChange={(value) => setLifestyle({ ...lifestyle, diet: value })}
              />
              
              <LifestyleSlider
                icon={Moon}
                label="Sleep Quality"
                value={lifestyle.sleep}
                onChange={(value) => setLifestyle({ ...lifestyle, sleep: value })}
              />
              
              <LifestyleSlider
                icon={Heart}
                label="Stress Management"
                value={lifestyle.stress}
                onChange={(value) => setLifestyle({ ...lifestyle, stress: value })}
              />
            </div>

            <div className="h-64 md:h-full min-h-[300px]">
              <p className="text-sm text-gray-600 mb-2">Projected Health Outcomes</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateHealthData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Months', position: 'bottom' }}
                  />
                  <YAxis
                    label={{ value: 'Health Score', angle: -90, position: 'left' }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalTwinSimulation;
