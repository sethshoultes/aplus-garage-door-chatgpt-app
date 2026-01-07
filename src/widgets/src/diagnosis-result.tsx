import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Phone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './app.css';

declare global {
  interface Window {
    openai: {
      getToolOutput: () => Promise<any>;
      sendMessage: (message: string) => void;
      openUrl: (url: string) => void;
    };
  }
}

interface DiagnosisData {
  symptoms: string[];
  urgency: 'emergency' | 'soon' | 'routine';
  likely_issues: Array<{
    name: string;
    description: string;
  }>;
  safety_warning: string | null;
  estimated_cost_range: {
    min: number;
    max: number;
  };
  applicable_promotion: string | null;
  next_steps: string;
}

function DiagnosisResult() {
  const [data, setData] = useState<DiagnosisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const output = (window.openai as any).toolOutput || (window as any).__TOOL_OUTPUT__;
        setData(output);
      } catch (error) {
        console.error('Failed to fetch tool output:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 max-w-md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 max-w-md">
        <p className="text-gray-600">Unable to load diagnosis information.</p>
      </div>
    );
  }

  const urgencyConfig = {
    emergency: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      label: 'Emergency',
      icon: '🚨'
    },
    soon: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Service Soon',
      icon: '⚡'
    },
    routine: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      label: 'Routine',
      icon: 'ℹ️'
    }
  };

  const config = urgencyConfig[data.urgency];

  const handleSchedule = () => {
    if (data.urgency === 'emergency') {
      window.openai.sendMessage("I need emergency service right away");
    } else {
      window.openai.sendMessage("I'd like to schedule service for this issue");
    }
  };

  return (
    <div className="p-6 w-full max-w-md mx-auto space-y-4 rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Urgency Badge */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
          {config.icon} {config.label}
        </span>
        <div className="text-sm font-medium text-gray-600">
          ${data.estimated_cost_range.min}-${data.estimated_cost_range.max}
        </div>
      </div>

      {/* Safety Warning */}
      {data.safety_warning && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex gap-2">
            <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">Safety Warning</p>
              <p className="text-sm text-red-800 mt-1">{data.safety_warning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Likely Issues */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Likely Issues</h3>
        <div className="space-y-2">
          {data.likely_issues.map((issue, index) => (
            <div
              key={index}
              className="rounded-lg bg-gray-50 border border-gray-200 p-3"
            >
              <p className="font-medium text-gray-900 text-sm">{issue.name}</p>
              <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion */}
      {data.applicable_promotion && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm font-medium text-green-900">
            🏷️ {data.applicable_promotion}
          </p>
        </div>
      )}

      {/* Next Steps */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
          Next Steps
        </p>
        <p className="text-sm text-blue-800">{data.next_steps}</p>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSchedule}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors ${
          data.urgency === 'emergency'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {data.urgency === 'emergency' ? (
          <>
            <Phone className="size-4" />
            Get Emergency Service
          </>
        ) : (
          <>
            📅
            Schedule Service
          </>
        )}
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DiagnosisResult />
  </React.StrictMode>
);
