import { Check } from 'lucide-react';

interface TechItem {
  name: string;
  description: string;
  completed: boolean;
}

const techStack: TechItem[] = [
  {
    name: "Backend",
    description: "Node.js, TypeScript, Express, DDD, Zod, Docker, Swagger",
    completed: true
  },
  {
    name: "Database",
    description: "Prisma, PostgreSQL",
    completed: true
  },
  {
    name: "Security",
    description: "OWASP",
    completed: true
  },
  {
    name: "Security",
    description: "JWT",
    completed: false
  },

  {
    name: "Two Factor Authentication",
    description: "JWT",
    completed: false
  },

  {
    name: "Frontend",
    description: "React, TypeScript, Vite, TailwindCSS, Shadcn/ui",
    completed: true
  },
  {
    name: "UI/UX",
    description: "Lovable",
    completed: true
  },
  {
    name: "AI Chatbot",
    description: "OpenRouter + LangChain + calling functions",
    completed: true
  },
  {
    name: "Document Upload & Processing",
    description: "PDF Upload, pdf-parse Text Extraction, Hugging Face Embedding Generation",
    completed: true
  },
  {
    name: " S3 Upload ",
    description: "",
    completed: true
  },
  {
    name: "WhatsApp Integration",
    description: "WhatsApp Business API, Webhooks",
    completed: false
  },
  {
    name: "Unit Tests",
    description: "Jest",
    completed: true
  },
  {
    name: "Integration Tests",
    description: "Cypress",
    completed: true
  },
  {
    name: "GitHub Actions",
    description: "CI/CD pipeline",
    completed: true
  },
  {
    name: "Terraform",
    description: "AWS Deployment",
    completed: true
  },
  {
    name: "Monitoring and alerts",
    description: "Datadog",
    completed: false
  },
  {
    name: "Dependabot",
    description: "Automated Dependency Updates",
    completed: false
  },
];

export function TechStackChecklist() {
  const completedCount = techStack.filter(item => item.completed).length;
  const totalCount = techStack.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-xl max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="text-center p-5 border-b border-purple-100 flex-shrink-0">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-purple-600 mb-2">Tech Stack Complete</h3>
        <p className="text-sm text-gray-600 mb-3">
          {completedCount}/{totalCount} technologies implemented
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="text-sm font-bold text-purple-600 mt-2">{completionPercentage}%</div>
      </div>

      {/* Tech Stack List */}
      <div className="p-5 space-y-3 overflow-y-auto flex-1">
        {techStack.map((item, index) => (
          <div 
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              item.completed 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              item.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 text-gray-500'
            }`}>
              {item.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${
                item.completed ? 'text-green-800' : 'text-gray-700'
              }`}>
                {item.name}
              </h4>
              <p className={`text-xs ${
                item.completed ? 'text-green-600' : 'text-gray-500'
              }`}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
