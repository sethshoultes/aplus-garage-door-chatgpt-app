import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Badge } from '@openai/apps-sdk-ui/components/Badge';
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

        if (!window.openai) {
          console.error('[Widget] window.openai is not available');
          setError('OpenAI bridge not available');
          setLoading(false);
          return;
        }

        console.log('[Widget] Calling getToolOutput...');
        const output = await window.openai.getToolOutput();
        console.log('[Widget] Received output:', output);

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
      <div className="p-4 max-w-md space-y-2">
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
      <div className="p-6 max-w-md space-y-4 rounded-2xl border bg-surface shadow-lg">
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
              <Badge color="success">{data.state}</Badge>
              <Badge color="primary">24/7 Emergency</Badge>
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
          <Button
            onClick={handleCall}
            variant="solid"
            color="primary"
            block
          >
            <Phone className="size-4" />
            Call Now
          </Button>
          <Button
            onClick={handleBook}
            variant="soft"
            color="secondary"
            block
          >
            <Calendar className="size-4" />
            Book Online
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md space-y-4 rounded-2xl border bg-surface shadow-lg">
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
        <Button
          onClick={handleCall}
          variant="solid"
          color="secondary"
          block
        >
          <Phone className="size-4" />
          Call {data.phone}
        </Button>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServiceAreaResult />
  </React.StrictMode>
);
