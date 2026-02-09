import { DollarSign, Calendar } from 'lucide-react';
import { useEffect, useCallback, useRef } from 'react';

interface FinancialsProps {
  pickupDate: string;
  returnDate: string;
  dailyRate: number;
  deposit: number;
  totalAmount: number;
  onPickupDateChange: (value: string) => void;
  onReturnDateChange: (value: string) => void;
  onDailyRateChange: (value: number) => void;
  onDepositChange: (value: number) => void;
  onTotalAmountChange: (value: number) => void;
}

export default function Financials({
  pickupDate,
  returnDate,
  dailyRate,
  deposit,
  totalAmount,
  onPickupDateChange,
  onReturnDateChange,
  onDailyRateChange,
  onDepositChange,
  onTotalAmountChange,
}: FinancialsProps) {
  const onTotalAmountChangeRef = useRef(onTotalAmountChange);
  onTotalAmountChangeRef.current = onTotalAmountChange;

  const calculateDays = useCallback(() => {
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const diffTime = Math.abs(returnD.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }, [pickupDate, returnDate]);

  useEffect(() => {
    const days = calculateDays();
    const rentalCharge = dailyRate * days;
    const total = rentalCharge + deposit;
    onTotalAmountChangeRef.current(total);
  }, [calculateDays, dailyRate, deposit]);

  const days = calculateDays();
  const rentalCharge = dailyRate * days;

  return (
    <div className="tablet-card">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-red-400" />
        <h2 className="tablet-heading">
          Booking & Financials
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="tablet-label">
                Pick-up Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => onPickupDateChange(e.target.value)}
                  className="tablet-input pl-11 md:pl-14"
                />
              </div>
            </div>

            <div>
              <label className="tablet-label">
                Return Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => onReturnDateChange(e.target.value)}
                  className="tablet-input pl-11 md:pl-14"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg md:rounded-xl p-4 md:p-5 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm md:text-base">Rental Duration</span>
              <span className="text-white font-semibold text-lg md:text-xl">
                {days} {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="tablet-label">
                Daily Rate
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={dailyRate}
                  onChange={(e) =>
                    onDailyRateChange(parseFloat(e.target.value) || 0)
                  }
                  className="tablet-input pl-8 md:pl-10"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="tablet-label">
                Deposit Collected
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) =>
                    onDepositChange(parseFloat(e.target.value) || 0)
                  }
                  className="tablet-input pl-8 md:pl-10"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-blue-500/10 rounded-xl md:rounded-2xl p-5 md:p-6 lg:p-8 border-2 border-red-500/30">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Summary</h3>
          <div className="space-y-3 md:space-y-4">
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-400">Rental Charge</span>
              <span className="text-white">
                ${dailyRate.toFixed(2)} x {days} days
              </span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">${rentalCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm md:text-base">
              <span className="text-gray-400">Deposit</span>
              <span className="text-white">${deposit.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-700 pt-4 md:pt-5 mt-4 md:mt-5">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-lg md:text-xl font-semibold">
                  Total Amount
                </span>
                <span className="text-red-400 text-3xl md:text-4xl font-bold">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
