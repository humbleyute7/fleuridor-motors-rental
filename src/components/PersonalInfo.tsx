import { User, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

interface PersonalInfoProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
  onCustomerAddressChange: (value: string) => void;
  onQuickFill: (data: {
    name: string;
    email: string;
    address: string;
  }) => void;
}

export default function PersonalInfo({
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onCustomerEmailChange,
  onCustomerAddressChange,
  onQuickFill,
}: PersonalInfoProps) {
  const [loading, setLoading] = useState(false);

  const handleQuickFill = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      alert('Please enter a valid phone number first');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rental_sessions')
        .select('customer_name, customer_email, customer_address')
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        onQuickFill({
          name: data.customer_name,
          email: data.customer_email,
          address: data.customer_address,
        });
      } else {
        alert('No previous records found for this phone number');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      alert('Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tablet-card">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <User className="w-6 h-6 md:w-7 md:h-7 text-red-500" />
        <h2 className="tablet-heading">Personal Information</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="tablet-label">
            Full Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="tablet-input"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="tablet-label">
            Email Address
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => onCustomerEmailChange(e.target.value)}
            className="tablet-input"
            placeholder="john.doe@example.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="tablet-label">
            Phone Number
          </label>
          <div className="flex gap-2 md:gap-3">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              className="tablet-input flex-1"
              placeholder="+1 (555) 000-0000"
            />
            <button
              onClick={handleQuickFill}
              disabled={loading}
              className="tablet-button bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2"
            >
              <Zap className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Quick-Fill</span>
            </button>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1.5 md:mt-2">
            Enter phone number and click Quick-Fill to auto-populate data
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="tablet-label">
            Address
          </label>
          <textarea
            value={customerAddress}
            onChange={(e) => onCustomerAddressChange(e.target.value)}
            className="tablet-input resize-none"
            placeholder="123 Main Street, City, State, ZIP"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
