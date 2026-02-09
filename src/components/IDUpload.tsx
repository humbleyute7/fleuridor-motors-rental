import { Upload, Camera, Car, Search } from 'lucide-react';
import { useState, useRef } from 'react';

interface IDUploadProps {
  passportUrl?: string;
  licenseUrl?: string;
  vehiclePlate: string;
  vehicleType: string;
  onPassportUpload: (file: File) => void;
  onLicenseUpload: (file: File) => void;
  onVehiclePlateChange: (value: string) => void;
  onVehicleTypeChange: (value: string) => void;
}

export default function IDUpload({
  passportUrl,
  licenseUrl,
  vehiclePlate,
  vehicleType,
  onPassportUpload,
  onLicenseUpload,
  onVehiclePlateChange,
  onVehicleTypeChange,
}: IDUploadProps) {
  const [passportPreview, setPassportPreview] = useState<string | undefined>(
    passportUrl
  );
  const [licensePreview, setLicensePreview] = useState<string | undefined>(
    licenseUrl
  );
  const passportInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPassportUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLicenseUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVehicleSearch = () => {
    if (!vehiclePlate) {
      alert('Please enter a license plate number');
      return;
    }

    const vehicleTypes = [
      'Sedan',
      'SUV',
      'Truck',
      'Van',
      'Compact',
      'Luxury Sedan',
      'Sports Car',
    ];
    const randomType =
      vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    onVehicleTypeChange(randomType);
  };

  return (
    <div className="tablet-card">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Camera className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
        <h2 className="tablet-heading">ID & Vehicle Details</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <label className="tablet-label">
            Passport
          </label>
          <input
            ref={passportInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePassportChange}
            className="hidden"
          />
          <div
            onClick={() => passportInputRef.current?.click()}
            className="relative aspect-[3/2] bg-gray-800 rounded-lg md:rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 active:border-blue-400 cursor-pointer transition-colors overflow-hidden group touch-manipulation"
          >
            {passportPreview ? (
              <img
                src={passportPreview}
                alt="Passport"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                <Upload className="w-8 h-8 md:w-10 md:h-10 mb-2" />
                <span className="text-sm md:text-base">Upload Passport</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="tablet-label">
            Driver's License
          </label>
          <input
            ref={licenseInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleLicenseChange}
            className="hidden"
          />
          <div
            onClick={() => licenseInputRef.current?.click()}
            className="relative aspect-[3/2] bg-gray-800 rounded-lg md:rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 active:border-blue-400 cursor-pointer transition-colors overflow-hidden group touch-manipulation"
          >
            {licensePreview ? (
              <img
                src={licensePreview}
                alt="Driver's License"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                <Upload className="w-8 h-8 md:w-10 md:h-10 mb-2" />
                <span className="text-sm md:text-base">Upload Driver's License</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="tablet-label">
            License Plate Number
          </label>
          <div className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={vehiclePlate}
              onChange={(e) =>
                onVehiclePlateChange(e.target.value.toUpperCase())
              }
              className="tablet-input flex-1 font-mono uppercase"
              placeholder="ABC-1234"
            />
            <button
              onClick={handleVehicleSearch}
              className="tablet-button bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold flex items-center gap-2"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        <div>
          <label className="tablet-label">
            Vehicle Type
          </label>
          <div className="relative">
            <Car className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-500" />
            <input
              type="text"
              value={vehicleType}
              onChange={(e) => onVehicleTypeChange(e.target.value)}
              className="tablet-input pl-11 md:pl-14"
              placeholder="e.g., Sedan, SUV, Truck"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
