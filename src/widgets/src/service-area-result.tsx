import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Check, Phone, Calendar, AlertTriangle } from 'lucide-react';

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

  useEffect(() => {
    async function fetchData() {
      try {
        const output = await window.openai.getToolOutput();
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
      <div className="p-4 max-w-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 max-w-md">
        <p className="text-gray-600">Unable to load service area information.</p>
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
      <div className="p-4 max-w-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              We service {data.service_area_name}!
            </p>
            <p className="text-sm text-gray-600">
              {data.state} • 24/7 emergency service available
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700">
            A Plus Garage Doors has been serving {data.service_area_name} with
            same-day service and expert technicians.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCall}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </button>
          <button
            onClick={handleBook}
            className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Book Online
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-2">{data.phone}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Outside service area</p>
          <p className="text-sm text-gray-600">
            Nearest coverage: {data.nearest_coverage}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        Call us to discuss options—we may still be able to help!
      </p>

      <button
        onClick={handleCall}
        className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
      >
        <Phone className="w-4 h-4" />
        {data.phone}
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServiceAreaResult />
  </React.StrictMode>
);
