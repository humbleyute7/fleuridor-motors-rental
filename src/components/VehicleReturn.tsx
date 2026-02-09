import { useState, useRef, useEffect } from 'react';
import { ClipboardCheck, Camera, AlertTriangle, DollarSign, CheckCircle, Lock } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { RentalSession, DamageLocation } from '../types/rental';
import { supabase } from '../lib/supabase';

interface VehicleReturnProps {
  session: RentalSession;
  onUpdate: (updates: Partial<RentalSession>) => void;
  onCloseRental?: () => void;
}

export default function VehicleReturn({ session, onUpdate, onCloseRental }: VehicleReturnProps) {
  const [damageLocations, setDamageLocations] = useState<DamageLocation[]>(
    session.damage_locations || []
  );
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [closing, setClosing] = useState(false);
  const returnSigRef = useRef<SignatureCanvas>(null);
  const carDiagramRef = useRef<SVGSVGElement>(null);

  const canCloseRental = () => {
    return (
      session.id &&
      session.return_odometer &&
      session.return_fuel_level !== undefined &&
      session.return_timestamp &&
      session.return_signature_data &&
      session.session_status !== 'closed'
    );
  };

  const handleCloseRental = async () => {
    if (!canCloseRental()) {
      alert('Please complete all return fields including odometer, fuel level, date/time, and signature before closing the rental.');
      return;
    }

    if (!confirm('Are you sure you want to close this rental? This action cannot be undone.')) {
      return;
    }

    setClosing(true);
    try {
      const { error } = await supabase
        .from('rental_sessions')
        .update({
          ...session,
          session_status: 'closed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;

      onUpdate({ session_status: 'closed' });
      alert('Rental closed successfully!');
      if (onCloseRental) onCloseRental();
    } catch (error) {
      console.error('Error closing rental:', error);
      alert('Failed to close rental');
    } finally {
      setClosing(false);
    }
  };

  useEffect(() => {
    calculateAllFees();
  }, [
    session.return_odometer,
    session.return_fuel_level,
    session.return_timestamp,
    session.new_damage,
    session.excessive_cleaning,
    session.damage_fee_amount,
  ]);

  const calculateAllFees = () => {
    let lateFee = 0;
    let mileageFee = 0;
    let fuelFee = 0;
    let cleaningFee = 0;
    let damageFee = session.damage_fee_amount || 0;

    if (session.return_timestamp && session.return_date) {
      const dueDate = new Date(session.return_date + 'T23:59:59');
      const returnDate = new Date(session.return_timestamp);
      const diffMs = returnDate.getTime() - dueDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes > 29) {
        const diffHours = Math.ceil(diffMinutes / 60);
        if (diffHours >= 24) {
          const days = Math.ceil(diffHours / 24);
          lateFee = days * (session.daily_late_fee || 150);
        } else {
          lateFee = diffHours * (session.hourly_late_fee || 25);
        }
      }
    }

    if (session.return_odometer && session.odometer && session.allowed_mileage) {
      const totalMiles = session.return_odometer - session.odometer;
      const overage = totalMiles - session.allowed_mileage;
      if (overage > 0) {
        mileageFee = overage * (session.rate_per_mile || 0.25);
      }
    }

    if (session.return_fuel_level !== undefined && session.fuel_level) {
      const fuelDeficit = session.fuel_level - session.return_fuel_level;
      if (fuelDeficit > 0) {
        const gallonsNeeded = ((fuelDeficit / 100) * (session.tank_capacity_gallons || 15));
        fuelFee = gallonsNeeded * (session.refuel_price_per_gallon || 5.00);
      }
    }

    if (session.excessive_cleaning) {
      cleaningFee = session.cleaning_fee || 75;
    }

    const subtotalFees = lateFee + mileageFee + fuelFee + damageFee + cleaningFee;
    const finalTotal = (session.total_amount || 0) + subtotalFees;
    const depositRefund = Math.max(0, (session.deposit || 0) - subtotalFees);

    onUpdate({
      late_fee_amount: parseFloat(lateFee.toFixed(2)),
      mileage_fee_amount: parseFloat(mileageFee.toFixed(2)),
      fuel_fee_amount: parseFloat(fuelFee.toFixed(2)),
      cleaning_fee_amount: parseFloat(cleaningFee.toFixed(2)),
      subtotal_fees: parseFloat(subtotalFees.toFixed(2)),
      final_total: parseFloat(finalTotal.toFixed(2)),
      deposit_refund_amount: parseFloat(depositRefund.toFixed(2)),
    });
  };

  const handleCarDiagramClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!carDiagramRef.current || !selectedArea) return;

    const svg = carDiagramRef.current;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newLocation: DamageLocation = {
      x,
      y,
      label: selectedArea,
    };

    const updatedLocations = [...damageLocations, newLocation];
    setDamageLocations(updatedLocations);
    onUpdate({ damage_locations: updatedLocations });
    setSelectedArea('');
  };

  const removeDamageLocation = (index: number) => {
    const updatedLocations = damageLocations.filter((_, i) => i !== index);
    setDamageLocations(updatedLocations);
    onUpdate({ damage_locations: updatedLocations });
  };

  const handleReturnPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentPhotos = session.return_photos || [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPhotos = [...currentPhotos, reader.result as string];
        onUpdate({ return_photos: updatedPhotos });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReturnSignatureEnd = () => {
    if (returnSigRef.current) {
      const data = returnSigRef.current.toDataURL();
      onUpdate({ return_signature_data: data });
    }
  };

  const clearReturnSignature = () => {
    returnSigRef.current?.clear();
    onUpdate({ return_signature_data: undefined });
  };

  const setCurrentDateTime = () => {
    onUpdate({ return_timestamp: new Date().toISOString() });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="tablet-card">
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <ClipboardCheck className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
          <h2 className="tablet-heading">Vehicle Return Assessment</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="tablet-label">
              Return Odometer Reading
            </label>
            <input
              type="number"
              value={session.return_odometer || ''}
              onChange={(e) =>
                onUpdate({ return_odometer: parseInt(e.target.value) || 0 })
              }
              className="tablet-input font-mono"
              placeholder="Current mileage"
            />
            <p className="text-xs md:text-sm text-gray-500 mt-1.5">
              Original: {session.odometer?.toLocaleString()} miles
            </p>
          </div>

          <div>
            <label className="tablet-label">
              Return Fuel Level: {(session.return_fuel_level || 0).toFixed(1)}%
            </label>
            <div className="bg-gray-800 rounded-lg md:rounded-xl p-5 md:p-6 border border-gray-700">
              <div className="relative flex flex-col items-center">
                <svg
                  width="250"
                  height="150"
                  viewBox="0 0 300 180"
                  className="cursor-pointer select-none w-full max-w-[300px] md:max-w-[350px] h-auto touch-manipulation"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const centerX = rect.width / 2;
                    const centerY = rect.height - 20;
                    const x = e.clientX - rect.left - centerX;
                    const y = e.clientY - rect.top - centerY;
                    let angle = Math.atan2(-y, x) * (180 / Math.PI);
                    angle = 180 - angle;
                    if (angle < 0) angle = 0;
                    if (angle > 180) angle = 180;
                    const percentage = (angle / 180) * 100;
                    onUpdate({ return_fuel_level: Math.round(percentage * 10) / 10 });
                  }}
                >
                  <defs>
                    <filter id="glow-return">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {Array.from({ length: 60 }).map((_, index) => {
                    const percentage = (index / 59) * 100;
                    const angle = (index / 59) * 180;
                    const angleRad = ((180 - angle) * Math.PI) / 180;
                    const isLargeTick = index % 10 === 0;
                    const isMediumTick = index % 5 === 0 && !isLargeTick;
                    const innerRadius = isLargeTick ? 100 : isMediumTick ? 110 : 115;
                    const outerRadius = 130;
                    const x1 = 150 + innerRadius * Math.cos(angleRad);
                    const y1 = 160 - innerRadius * Math.sin(angleRad);
                    const x2 = 150 + outerRadius * Math.cos(angleRad);
                    const y2 = 160 - outerRadius * Math.sin(angleRad);

                    let color = '#374151';
                    if (percentage <= (session.return_fuel_level || 0)) {
                      if (percentage < 15) {
                        color = '#ef4444';
                      } else if (percentage < 85) {
                        color = '#e5e7eb';
                      } else {
                        color = '#22d3ee';
                      }
                    }

                    const strokeWidth = isLargeTick ? 3 : isMediumTick ? 2 : 1.5;

                    return (
                      <line
                        key={index}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        className="transition-all duration-200"
                      />
                    );
                  })}

                  <text x="40" y="170" fill="#ef4444" fontSize="20" fontWeight="bold">E</text>
                  <text x="250" y="170" fill="#22d3ee" fontSize="20" fontWeight="bold">F</text>

                  <g>
                    {(() => {
                      const needleAngle = (((session.return_fuel_level || 0) / 100) * 180 * Math.PI) / 180;
                      const needleLength = 95;
                      const needleX = 150 - needleLength * Math.cos(needleAngle);
                      const needleY = 160 - needleLength * Math.sin(needleAngle);

                      return (
                        <>
                          <line
                            x1="150"
                            y1="160"
                            x2={needleX}
                            y2={needleY}
                            stroke="#fbbf24"
                            strokeWidth="3"
                            strokeLinecap="round"
                            filter="url(#glow-return)"
                          />
                          <circle cx="150" cy="160" r="8" fill="#1f2937" stroke="#fbbf24" strokeWidth="3" />
                        </>
                      );
                    })()}
                  </g>

                  <text x="150" y="145" textAnchor="middle" fill="#fbbf24" fontSize="24" fontWeight="bold">
                    {(session.return_fuel_level || 0).toFixed(1)}%
                  </text>
                </svg>

                <div className="mt-4 w-full">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={session.return_fuel_level || 0}
                    onChange={(e) =>
                      onUpdate({ return_fuel_level: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full h-3 md:h-4 bg-transparent appearance-none cursor-pointer fuel-slider touch-manipulation"
                  />
                </div>

                <div className="flex justify-between w-full text-xs md:text-sm text-gray-500 mt-2 px-2">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-gray-400">Original:</span>
                  <span className="text-white font-semibold">{session.fuel_level?.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="tablet-label">
              Return Date & Time
            </label>
            <div className="flex gap-2 md:gap-3">
              <input
                type="datetime-local"
                value={
                  session.return_timestamp
                    ? new Date(session.return_timestamp).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  onUpdate({ return_timestamp: new Date(e.target.value).toISOString() })
                }
                className="tablet-input flex-1"
              />
              <button
                onClick={setCurrentDateTime}
                className="tablet-button bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold"
              >
                Now
              </button>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-1.5">
              Due: {new Date(session.return_date).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="tablet-label">
              Condition Checks
            </label>
            <div className="space-y-3 md:space-y-4">
              <label className="flex items-center gap-3 cursor-pointer touch-manipulation">
                <input
                  type="checkbox"
                  checked={session.new_damage || false}
                  onChange={(e) => onUpdate({ new_damage: e.target.checked })}
                  className="w-5 h-5 md:w-6 md:h-6 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white text-base md:text-lg">New Damage Detected</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer touch-manipulation">
                <input
                  type="checkbox"
                  checked={session.excessive_cleaning || false}
                  onChange={(e) => onUpdate({ excessive_cleaning: e.target.checked })}
                  className="w-5 h-5 md:w-6 md:h-6 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white text-base md:text-lg">Excessive Cleaning Required</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {session.new_damage && (
        <div className="tablet-card">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 text-yellow-400" />
            <h3 className="tablet-heading">Damage Assessment</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className="tablet-label">
                Visual Damage Map
              </label>
              <div className="space-y-3 md:space-y-4">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="tablet-input"
                >
                  <option value="">Select damage type...</option>
                  <option value="Scratch">Scratch</option>
                  <option value="Dent">Dent</option>
                  <option value="Crack">Crack</option>
                  <option value="Broken">Broken Part</option>
                  <option value="Missing">Missing Part</option>
                </select>

                <div className="relative bg-gray-800 rounded-lg md:rounded-xl border border-gray-700 p-4 md:p-5">
                  <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">
                    {selectedArea ? 'Tap on the car to mark damage location' : 'Select a damage type first'}
                  </p>
                  <svg
                    ref={carDiagramRef}
                    viewBox="0 0 400 200"
                    className={`w-full h-auto touch-manipulation ${selectedArea ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
                    onClick={handleCarDiagramClick}
                  >
                    <rect x="80" y="50" width="240" height="100" rx="10" fill="#374151" stroke="#6b7280" strokeWidth="2" />
                    <rect x="100" y="60" width="40" height="30" rx="5" fill="#1f2937" />
                    <rect x="260" y="60" width="40" height="30" rx="5" fill="#1f2937" />
                    <ellipse cx="120" cy="150" rx="20" ry="20" fill="#1f2937" stroke="#6b7280" strokeWidth="2" />
                    <ellipse cx="280" cy="150" rx="20" ry="20" fill="#1f2937" stroke="#6b7280" strokeWidth="2" />
                    <rect x="150" y="70" width="100" height="60" rx="8" fill="#4b5563" opacity="0.5" />

                    {damageLocations.map((loc, index) => (
                      <g key={index}>
                        <circle
                          cx={(loc.x / 100) * 400}
                          cy={(loc.y / 100) * 200}
                          r="8"
                          fill="#ef4444"
                          stroke="#fbbf24"
                          strokeWidth="2"
                          className="cursor-pointer hover:fill-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDamageLocation(index);
                          }}
                        />
                        <text
                          x={(loc.x / 100) * 400}
                          y={(loc.y / 100) * 200 - 12}
                          textAnchor="middle"
                          fill="#fbbf24"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {loc.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {damageLocations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Marked Damages:</p>
                    {damageLocations.map((loc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-800/50 px-3 py-2 rounded"
                      >
                        <span className="text-sm text-white">{loc.label}</span>
                        <button
                          onClick={() => removeDamageLocation(index)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="tablet-label">
                Damage Notes & Assessment
              </label>
              <textarea
                value={session.damage_notes || ''}
                onChange={(e) => onUpdate({ damage_notes: e.target.value })}
                className="tablet-input resize-none"
                placeholder="Describe damage in detail..."
                rows={6}
              />

              <div className="mt-4 md:mt-6">
                <label className="tablet-label">
                  Estimated Damage Fee
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={session.damage_fee_amount || 0}
                    onChange={(e) =>
                      onUpdate({ damage_fee_amount: parseFloat(e.target.value) || 0 })
                    }
                    className="tablet-input pl-8 md:pl-10"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="tablet-card">
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Camera className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
          <h3 className="tablet-heading">Return Inspection Photos</h3>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleReturnPhotoUpload}
          className="hidden"
          id="return-photos"
        />
        <label
          htmlFor="return-photos"
          className="block w-full p-6 md:p-8 border-2 border-dashed border-gray-700 hover:border-blue-500 active:border-blue-400 rounded-lg md:rounded-xl cursor-pointer transition-colors text-center touch-manipulation"
        >
          <Camera className="w-8 h-8 md:w-10 md:h-10 text-gray-500 mx-auto mb-2" />
          <span className="text-gray-400 text-base md:text-lg">Tap to upload return photos</span>
        </label>

        {session.return_photos && session.return_photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
            {session.return_photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden border border-gray-700">
                <img src={photo} alt={`Return ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tablet-card">
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
          <h3 className="tablet-heading">Financial Reconciliation</h3>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-700">
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-400">Base Rental Amount</span>
                <span className="text-white font-semibold">${session.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
              {(session.late_fee_amount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Late Return Fee</span>
                  <span className="text-yellow-400 font-semibold">+${session.late_fee_amount?.toFixed(2)}</span>
                </div>
              )}
              {(session.mileage_fee_amount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Mileage Overage Fee</span>
                  <span className="text-yellow-400 font-semibold">+${session.mileage_fee_amount?.toFixed(2)}</span>
                </div>
              )}
              {(session.fuel_fee_amount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Fuel Deficit Fee</span>
                  <span className="text-yellow-400 font-semibold">+${session.fuel_fee_amount?.toFixed(2)}</span>
                </div>
              )}
              {(session.damage_fee_amount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">Damage Assessment Fee</span>
                  <span className="text-red-400 font-semibold">+${session.damage_fee_amount?.toFixed(2)}</span>
                </div>
              )}
              {(session.cleaning_fee_amount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Excessive Cleaning Fee</span>
                  <span className="text-yellow-400 font-semibold">+${session.cleaning_fee_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Final Total</span>
                  <span className="text-blue-400">${session.final_total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Deposit Held</span>
                  <span className="text-white">${session.deposit?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-green-400 font-semibold">Deposit Refund</span>
                  <span className="text-green-400 font-semibold">${session.deposit_refund_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tablet-card">
        <h3 className="tablet-heading mb-4 md:mb-6">Customer Return Signature</h3>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <label className="tablet-label mb-0">
            Customer acknowledges return condition and final charges
          </label>
          <button
            onClick={clearReturnSignature}
            className="tablet-button bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-sm border border-gray-700"
          >
            Clear
          </button>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl border-2 border-gray-700 overflow-hidden">
          <SignatureCanvas
            ref={returnSigRef}
            canvasProps={{
              className: 'signature-canvas w-full h-48 md:h-64 lg:h-72',
            }}
            backgroundColor="white"
            penColor="black"
            onEnd={handleReturnSignatureEnd}
          />
        </div>
      </div>

      {session.session_status === 'closed' ? (
        <div className="tablet-card bg-green-900/20 border-green-700">
          <div className="flex items-center justify-center gap-3 md:gap-4 py-4 md:py-6">
            <Lock className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
            <div className="text-center">
              <h3 className="tablet-heading text-green-400">Rental Closed</h3>
              <p className="text-gray-400 text-sm md:text-base mt-1">This rental has been finalized and closed.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="tablet-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg md:text-xl font-semibold text-white">Finalize & Close Rental</h3>
              <p className="text-gray-400 text-sm md:text-base mt-1">
                Complete all return fields above, then close the rental to finalize.
              </p>
            </div>
            <button
              onClick={handleCloseRental}
              disabled={closing || !canCloseRental()}
              className="tablet-button bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center"
            >
              {closing ? (
                <>
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                  Close Rental & Save
                </>
              )}
            </button>
          </div>
          {!canCloseRental() && session.id && (
            <p className="text-yellow-400 text-xs md:text-sm mt-3 text-center md:text-left">
              Complete odometer, fuel level, date/time, and signature to enable closing.
            </p>
          )}
        </div>
      )}

      <style>{`
        .fuel-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #22d3ee;
          border: 3px solid #1f2937;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }

        .fuel-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.8);
        }

        .fuel-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #22d3ee;
          border: 3px solid #1f2937;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
        }

        .fuel-slider::-moz-range-thumb:active {
          cursor: grabbing;
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.8);
        }

        .fuel-slider::-webkit-slider-runnable-track {
          height: 2px;
          background: transparent;
        }

        .fuel-slider::-moz-range-track {
          height: 2px;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
