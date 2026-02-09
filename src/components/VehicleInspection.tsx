import { Camera } from 'lucide-react';
import { useState, useRef } from 'react';

interface VehicleInspectionProps {
  photoFront?: string;
  photoRear?: string;
  photoLeft?: string;
  photoRight?: string;
  onPhotoUpload: (
    position: 'front' | 'rear' | 'left' | 'right',
    file: File
  ) => void;
}

interface PhotoSlot {
  position: 'front' | 'rear' | 'left' | 'right';
  label: string;
  preview?: string;
}

export default function VehicleInspection({
  photoFront,
  photoRear,
  photoLeft,
  photoRight,
  onPhotoUpload,
}: VehicleInspectionProps) {
  const [previews, setPreviews] = useState<{
    front?: string;
    rear?: string;
    left?: string;
    right?: string;
  }>({
    front: photoFront,
    rear: photoRear,
    left: photoLeft,
    right: photoRight,
  });

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    rear: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
  };

  const slots: PhotoSlot[] = [
    { position: 'front', label: 'Front', preview: previews.front },
    { position: 'rear', label: 'Rear', preview: previews.rear },
    { position: 'left', label: 'Left Side', preview: previews.left },
    { position: 'right', label: 'Right Side', preview: previews.right },
  ];

  const handleFileChange = (
    position: 'front' | 'rear' | 'left' | 'right',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoUpload(position, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({
          ...prev,
          [position]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="tablet-card">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Camera className="w-6 h-6 md:w-7 md:h-7 text-red-400" />
        <h2 className="tablet-heading">Vehicle Inspection</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:gap-6">
        {slots.map((slot) => (
          <div key={slot.position}>
            <input
              ref={fileInputRefs[slot.position]}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(slot.position, e)}
              className="hidden"
            />
            <div
              onClick={() => fileInputRefs[slot.position].current?.click()}
              className="relative aspect-[4/3] bg-gray-800 rounded-lg md:rounded-xl border-2 border-dashed border-gray-700 hover:border-red-500 active:border-red-400 cursor-pointer transition-colors overflow-hidden group touch-manipulation"
            >
              {slot.preview ? (
                <>
                  <img
                    src={slot.preview}
                    alt={slot.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:group-active:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <Camera className="w-5 h-5 md:w-6 md:h-6 text-white mb-1" />
                      <span className="text-white text-sm md:text-base">
                        Change Photo
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-3 md:p-4">
                    <div className="text-white text-xs md:text-sm font-medium">
                      {slot.label}
                    </div>
                    <div className="text-red-400 text-xs md:text-sm mt-1">
                      {getTimestamp()}
                    </div>
                    <div className="text-green-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"></div>
                      Position Logged
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-red-400 group-active:text-red-400 transition-colors">
                  <Camera className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mb-2" />
                  <span className="text-sm md:text-base lg:text-lg font-medium">{slot.label}</span>
                  <span className="text-xs md:text-sm mt-1">Tap to capture</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gray-800/50 rounded-lg md:rounded-xl border border-gray-700">
        <p className="text-sm md:text-base text-gray-400">
          <span className="text-red-400 font-semibold">Note:</span> Please
          capture clear photos of all four sides of the vehicle. The timestamp
          and position will be automatically logged.
        </p>
      </div>
    </div>
  );
}
