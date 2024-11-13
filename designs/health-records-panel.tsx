import React from 'react';
import {
  Upload,
  FileText,
  Shield,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Download,
  Eye,
  Share2,
  Pill,
  Activity,
  HeartPulse,
  Clipboard
} from 'lucide-react';

const HealthRecordsPanel = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Health Records</h1>
          <div className="flex items-center space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload New Record
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Stats */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-semibold">24</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Upload</p>
                <p className="text-2xl font-semibold">2 days ago</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">AI Analyzed</p>
                <p className="text-2xl font-semibold">100%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Records List Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="p-2 border rounded-lg hover:bg-gray-50">
                  <Filter className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Records List */}
            <div className="divide-y divide-gray-100">
              {[
                {
                  title: 'Annual Physical Report',
                  date: 'Oct 15, 2023',
                  type: 'PDF',
                  status: 'Analyzed',
                  icon: FileText
                },
                {
                  title: 'Blood Test Results',
                  date: 'Oct 10, 2023',
                  type: 'PDF',
                  status: 'Analyzed',
                  icon: Activity
                },
                {
                  title: 'Vaccination Record',
                  date: 'Sep 28, 2023',
                  type: 'PDF',
                  status: 'Analyzed',
                  icon: Pill
                },
                {
                  title: 'Heart Examination',
                  date: 'Sep 15, 2023',
                  type: 'PDF',
                  status: 'Analyzed',
                  icon: HeartPulse
                }
              ].map((record, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <record.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{record.date}</span>
                          <span>•</span>
                          <span>{record.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Download className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Share2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold mb-4">AI Health Insights</h2>
            
            {/* Security Badge */}
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">End-to-End Encrypted Analysis</span>
            </div>

            {/* Key Findings */}
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-700">Follow-up Required</span>
                </div>
                <p className="text-sm text-yellow-600">Schedule follow-up for blood pressure monitoring</p>
              </div>

              {/* Medical Terms Explained */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Medical Terms Explained</h3>
                <div className="space-y-2">
                  {[
                    { term: 'Hypertension', explanation: 'High blood pressure condition' },
                    { term: 'LDL Cholesterol', explanation: 'Bad cholesterol levels in blood' }
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">{item.term}</p>
                      <p className="text-sm text-gray-600">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trends */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Health Trends</h3>
                <div className="space-y-2">
                  {[
                    { metric: 'Blood Pressure', trend: 'Stable', status: 'normal' },
                    { metric: 'Cholesterol', trend: 'Improving', status: 'good' }
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.metric}</p>
                        <p className="text-xs text-gray-500">{item.trend}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended Actions</h3>
                <div className="space-y-2">
                  <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-left flex items-center justify-between hover:bg-blue-100">
                    <span>Schedule follow-up appointment</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-left flex items-center justify-between hover:bg-blue-100">
                    <span>Update medication list</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecordsPanel;
