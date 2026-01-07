import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {Phone, Calendar, AlertTriangle, CheckCircle2} from 'lucide-react';
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

interface ServiceAreaData {
  location: string;
  is_covered: boolean;
  service_area_name: string | null;
  state: string | null;
  phone: string | null;
  nearest_coverage: string | null;
  emergency_available: boolean;
}

function ServiceAreaResult() {
  const [data, setData] = useState<ServiceAreaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('[Widget] Checking for window.openai...');
        console.log('[Widget] window.openai exists:', !!window.openai);
        console.log('[Widget] window.openai keys:', window.openai ? Object.keys(window.openai) : 'N/A');
        console.log('[Widget] window.openai object:', window.openai);

        if (!window.openai) {
          console.error('[Widget] window.openai is not available');
          setError('OpenAI bridge not available');
          setLoading(false);
          return;
        }

        // Check what methods are available
        console.log('[Widget] getToolOutput type:', typeof window.openai.getToolOutput);

        // Get the data from window.openai.toolOutput (property, not function)
        let output;
        if ((window.openai as any).toolOutput) {
          console.log('[Widget] Using toolOutput property');
          output = (window.openai as any).toolOutput;
          console.log('[Widget] toolOutput value:', JSON.stringify(output, null, 2));
        } else if ((window as any).__TOOL_OUTPUT__) {
          console.log('[Widget] Using __TOOL_OUTPUT__');
          output = (window as any).__TOOL_OUTPUT__;
          console.log('[Widget] __TOOL_OUTPUT__ value:', JSON.stringify(output, null, 2));
        } else {
          console.error('[Widget] No way to get tool output');
          setError('toolOutput not found. Available: ' + Object.keys(window.openai).join(', '));
          setLoading(false);
          return;
        }

        console.log('[Widget] Final output to render:', JSON.stringify(output, null, 2));
        console.log('[Widget] is_covered =', output?.is_covered);
        console.log('[Widget] service_area_name =', output?.service_area_name);
        setData(output);
      } catch (error) {
        console.error('[Widget] Failed to fetch tool output:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }

    // Wait for bridge to be ready
    if (typeof window.openai !== 'undefined') {
      fetchData();
    } else {
      console.log('[Widget] Waiting for bridge...');
      const checkInterval = setInterval(() => {
        if (typeof window.openai !== 'undefined') {
          console.log('[Widget] Bridge ready!');
          clearInterval(checkInterval);
          fetchData();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.openai) {
          console.error('[Widget] Bridge timeout - window.openai never became available');
          setError('Timeout waiting for OpenAI bridge');
          setLoading(false);
        }
      }, 5000);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-2">
        <p className="text-gray-900 font-semibold">Unable to load service area information</p>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-900 font-mono">{error}</p>
          </div>
        )}
        <p className="text-xs text-gray-500">Check browser console for details</p>
      </div>
    );
  }

  const handleCall = () => {
    if (data.phone) {
      window.openai.openUrl(`tel:${data.phone.replace(/[^0-9]/g, '')}`);
    }
  };

  const handleBook = () => {
    window.openai.sendMessage("I'd like to book an appointment");
  };

  if (data.is_covered) {
    return (
      <div className="p-6 w-full max-w-md mx-auto space-y-4 rounded-2xl border border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <CheckCircle2 className="size-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              We service {data.service_area_name}!
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {data.state}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                24/7 Emergency
              </span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
          <p className="text-sm text-gray-700">
            A Plus Garage Doors has been serving {data.service_area_name} with same-day service and expert technicians. Our team is ready to help you today!
          </p>
        </div>

        {/* Contact Info */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div>
            <p className="text-xs font-medium text-blue-900 uppercase tracking-wide">Direct Line</p>
            <p className="text-lg font-semibold text-blue-900">{data.phone}</p>
          </div>
          <Phone className="size-6 text-blue-600" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCall}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Phone className="size-4" />
            Call Now
          </button>
          <button
            onClick={handleBook}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
          >
            <Calendar className="size-4" />
            Book Online
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-md mx-auto space-y-4 rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <AlertTriangle className="size-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Outside service area</h3>
          <p className="text-sm text-gray-600 mt-1">
            Nearest coverage: <span className="font-medium">{data.nearest_coverage}</span>
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
        <p className="text-sm text-amber-900">
          Call us to discuss options—we may still be able to help with your garage door needs!
        </p>
      </div>

      {/* Call Button */}
      {data.phone && (
        <button
          onClick={handleCall}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
        >
          <Phone className="size-4" />
          Call {data.phone}
        </button>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServiceAreaResult />
  </React.StrictMode>
);
