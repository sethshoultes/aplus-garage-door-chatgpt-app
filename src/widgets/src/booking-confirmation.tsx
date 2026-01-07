import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Calendar, Phone, CheckCircle2 } from 'lucide-react';
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

interface BookingData {
  confirmation_number: string;
  service_type: string;
  time_window: string;
  customer_name: string;
  contact_phone: string;
  address: string;
  issue_summary: string;
  promotion_applied: {
    discount: string;
    code: string;
  } | null;
  status: string;
  next_steps: string;
}

function BookingConfirmation() {
  const [data, setData] = useState<BookingData | null>(null);
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
      <div className="w-full max-w-md mx-auto p-4">
        <p className="text-gray-600">Unable to load booking information.</p>
      </div>
    );
  }

  const serviceTypeName = data.service_type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const handleCall = () => {
    window.openai.openUrl(`tel:${data.contact_phone.replace(/[^0-9]/g, '')}`);
  };

  return (
    <div className="p-6 w-full max-w-md mx-auto space-y-4 rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Header with Success Icon */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="size-7 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Appointment Confirmed!</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {data.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">#{data.confirmation_number}</span>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Service</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{serviceTypeName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{data.time_window}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{data.customer_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
            <p className="text-sm font-semibold text-blue-600 mt-0.5">{data.contact_phone}</p>
          </div>
        </div>

        {data.address && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Service Address</p>
            <p className="text-sm text-gray-900 mt-0.5">{data.address}</p>
          </div>
        )}

        {data.issue_summary && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issue</p>
            <p className="text-sm text-gray-900 mt-0.5">{data.issue_summary}</p>
          </div>
        )}
      </div>

      {/* Promotion Applied */}
      {data.promotion_applied && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-900">🏷️ Promotion Applied</p>
              <p className="text-xs text-green-800 mt-0.5">{data.promotion_applied.discount}</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {data.promotion_applied.code}
            </span>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="rounded-lg bg-blue-50 border-l-4 border-blue-600 p-4">
        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
          What's Next?
        </p>
        <p className="text-sm text-blue-800 leading-relaxed">{data.next_steps}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCall}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
        >
          <Phone className="size-4" />
          Call Us
        </button>
        <button
          onClick={() => window.openai.sendMessage("I need to reschedule")}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
        >
          <Calendar className="size-4" />
          Reschedule
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BookingConfirmation />
  </React.StrictMode>
);
