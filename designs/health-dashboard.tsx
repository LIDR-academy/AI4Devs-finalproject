import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Calendar, Upload, Eye, Download, Share2, ChevronDown, ChevronRight, Search, Shield, Activity, Heart, Droplet, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const HealthDashboard = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    recordType: 'all',
    dateRange: '6m',
    status: 'all'
  });

  // Extended health trend data
  const healthTrendData = [
    { month: 'Jun', systolic: 122, diastolic: 82, cholesterol: 185, glucose: 95, weight: 70, heartRate: 75 },
    { month: 'Jul', systolic: 120, diastolic: 80, cholesterol: 182, glucose: 92, weight: 69, heartRate: 72 },
    { month: 'Aug', systolic: 121, diastolic: 81, cholesterol: 180, glucose: 94, weight: 69, heartRate: 73 },
    { month: 'Sep', systolic: 119, diastolic: 79, cholesterol: 178, glucose: 91, weight: 68, heartRate: 71 },
    { month: 'Oct', systolic: 118, diastolic: 78, cholesterol: 175, glucose: 90, weight: 68, heartRate: 70 },
    { month: 'Nov', systolic: 117, diastolic: 77, cholesterol: 172, glucose: 89, weight: 67, heartRate: 70 }
  ];

  // AI Analysis Data
  const aiAnalysisData = {
    riskFactors: [
      { name: 'Cardiovascular', value: 15 },
      { name: 'Metabolic', value: 10 },
      { name: 'Respiratory', value: 5 }
    ],
    recommendations: [
      { category: 'Lifestyle', items: ['Increase physical activity', 'Maintain balanced diet', 'Ensure adequate sleep'] },
      { category: 'Medical', items: ['Schedule blood pressure check', 'Update cholesterol panel', 'Annual physical due'] }
    ],
    trends: [
      { metric: 'Blood Pressure', status: 'improving', change: '-3%' },
      { metric: 'Cholesterol', status: 'stable', change: '0%' },
      { metric: 'Blood Sugar', status: 'caution', change: '+2%' }
    ]
  };

  const FilterPanel = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <h3 className="font-medium mb-2">Record Type</h3>
        <div className="space-x-2">
          {['All', 'Lab Results', 'Imaging', 'Prescriptions', 'Vaccinations', 'Physical Exams'].map(type => (
            <Button
              key={type}
              variant={activeFilters.recordType === type.toLowerCase() ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilters({...activeFilters, recordType: type.toLowerCase()})}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Date Range</h3>
        <div className="space-x-2">
          {['1M', '3M', '6M', '1Y', 'All'].map(range => (
            <Button
              key={range}
              variant={activeFilters.dateRange === range.toLowerCase() ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilters({...activeFilters, dateRange: range.toLowerCase()})}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Status</h3>
        <div className="space-x-2">
          {['All', 'Normal', 'Requires Action', 'Critical'].map(status => (
            <Button
              key={status}
              variant={activeFilters.status === status.toLowerCase() ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilters({...activeFilters, status: status.toLowerCase()})}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const DocumentPreview = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Document Preview</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Annual Physical Report</h3>
              <span className="text-sm text-gray-500">Oct 15, 2023</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Key Findings:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Blood pressure: 120/80 mmHg (Normal)</li>
                <li>Cholesterol: 175 mg/dL (Optimal)</li>
                <li>Blood glucose: 90 mg/dL (Normal)</li>
                <li>BMI: 22.4 (Normal range)</li>
              </ul>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Doctor's Notes:</p>
              <p>Patient is in good overall health. Recommend maintaining current diet and exercise routine. Schedule follow-up in 6 months.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DetailedHealthTrends = () => (
    <div className="space-y-6">
      {/* Main Vitals Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={healthTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="systolic" stroke="#2563eb" name="Systolic BP" />
            <Line yAxisId="left" type="monotone" dataKey="diastolic" stroke="#7c3aed" name="Diastolic BP" />
            <Line yAxisId="right" type="monotone" dataKey="cholesterol" stroke="#16a34a" name="Cholesterol" />
            <Line yAxisId="right" type="monotone" dataKey="glucose" stroke="#ea580c" name="Glucose" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Weight Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="weight" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Heart Rate Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ExpandedAIInsights = () => (
    <div className="space-y-6">
      {/* Risk Analysis */}
      <div className="grid grid-cols-3 gap-4">
        {aiAnalysisData.riskFactors.map((factor, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: factor.value }, { value: 100 - factor.value }]}
                        innerRadius={25}
                        outerRadius={35}
                        startAngle={90}
                        endAngle={450}
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#e5e7eb" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="font-medium mt-2">{factor.name}</p>
                <p className="text-sm text-gray-500">{factor.value}% Risk</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiAnalysisData.recommendations.map((rec, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium">{rec.category}</h4>
                <ul className="space-y-1">
                  {rec.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Health Trends Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiAnalysisData.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className={`w-5 h-5 ${
                    trend.status === 'improving' ? 'text-green-500' :
                    trend.status === 'stable' ? 'text-blue-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium">{trend.metric}</p>
                    <p className="text-sm text-gray-500">{trend.status}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  trend.change.startsWith('+') ? 'text-yellow-500' :
                  trend.change.startsWith('-') ? 'text-green-500' : 'text-blue-500'
                }`}>
                  {trend.change}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Previous header and stats sections remain the same */}
      
      {/* Enhanced Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search records..." 
              className="w-full"
              prefix={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        <FilterPanel />
      </div>

      {/* Health Trends Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Health Trends</span>
            <Button 
              variant="ghost" 
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showDetails ? <DetailedHealthTrends /> : (
            <div className="space-y-4">
              {/* Basic health metrics remain the same */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Section */}
      {selectedRecord && <DocumentPreview />}

      {/* AI Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced AI Health Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpandedAIInsights />
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDashboard;
