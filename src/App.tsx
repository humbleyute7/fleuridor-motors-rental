import { useState } from 'react';
import {
  User,
  CreditCard,
  Camera,
  Gauge,
  DollarSign,
  PenTool,
  RotateCcw,
  Printer,
  Database,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import PersonalInfo from './components/PersonalInfo';
import IDUpload from './components/IDUpload';
import VehicleInspection from './components/VehicleInspection';
import Telemetry from './components/Telemetry';
import Financials from './components/Financials';
import SignaturePad from './components/SignaturePad';
import VehicleReturn from './components/VehicleReturn';
import PrintView from './components/PrintView';
import SessionManager from './components/SessionManager';
import Logo from './components/Logo';
import { RentalSession, emptySession } from './types/rental';

const sections = [
  { id: 1, title: 'Personal', fullTitle: 'Personal Information', icon: User },
  { id: 2, title: 'ID & Vehicle', fullTitle: 'ID & Vehicle Details', icon: CreditCard },
  { id: 3, title: 'Inspection', fullTitle: 'Vehicle Inspection', icon: Camera },
  { id: 4, title: 'Telemetry', fullTitle: 'Vehicle Telemetry', icon: Gauge },
  { id: 5, title: 'Financials', fullTitle: 'Booking & Financials', icon: DollarSign },
  { id: 6, title: 'Signature', fullTitle: 'Signature & Legal', icon: PenTool },
  { id: 7, title: 'Return', fullTitle: 'Vehicle Return', icon: RotateCcw },
  { id: 8, title: 'Print', fullTitle: 'Print Contract', icon: Printer },
  { id: 9, title: 'Sessions', fullTitle: 'Session Management', icon: Database },
];

function App() {
  const [session, setSession] = useState<RentalSession>(emptySession);
  const [activeSection, setActiveSection] = useState(1);

  const updateSession = (updates: Partial<RentalSession>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  };

  const handleQuickFill = (data: {
    name: string;
    email: string;
    address: string;
  }) => {
    updateSession({
      customer_name: data.name,
      customer_email: data.email,
      customer_address: data.address,
    });
  };

  const handlePhotoUpload = async (
    position: 'front' | 'rear' | 'left' | 'right',
    file: File
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateSession({
        [`photo_${position}`]: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleIDUpload = async (type: 'passport' | 'license', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateSession({
        [type === 'passport' ? 'passport_url' : 'license_url']: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleNewSession = () => {
    if (
      confirm(
        'Are you sure you want to start a new session? Any unsaved changes will be lost.'
      )
    ) {
      setSession(emptySession);
      setActiveSection(1);
    }
  };

  const goToNext = () => {
    if (activeSection < 9) setActiveSection(activeSection + 1);
  };

  const goToPrev = () => {
    if (activeSection > 1) setActiveSection(activeSection - 1);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 1:
        return (
          <PersonalInfo
            customerName={session.customer_name}
            customerPhone={session.customer_phone}
            customerEmail={session.customer_email}
            customerAddress={session.customer_address}
            onCustomerNameChange={(value) => updateSession({ customer_name: value })}
            onCustomerPhoneChange={(value) => updateSession({ customer_phone: value })}
            onCustomerEmailChange={(value) => updateSession({ customer_email: value })}
            onCustomerAddressChange={(value) => updateSession({ customer_address: value })}
            onQuickFill={handleQuickFill}
          />
        );
      case 2:
        return (
          <IDUpload
            passportUrl={session.passport_url}
            licenseUrl={session.license_url}
            vehiclePlate={session.vehicle_plate}
            vehicleType={session.vehicle_type}
            onPassportUpload={(file) => handleIDUpload('passport', file)}
            onLicenseUpload={(file) => handleIDUpload('license', file)}
            onVehiclePlateChange={(value) => updateSession({ vehicle_plate: value })}
            onVehicleTypeChange={(value) => updateSession({ vehicle_type: value })}
          />
        );
      case 3:
        return (
          <VehicleInspection
            photoFront={session.photo_front}
            photoRear={session.photo_rear}
            photoLeft={session.photo_left}
            photoRight={session.photo_right}
            onPhotoUpload={handlePhotoUpload}
          />
        );
      case 4:
        return (
          <Telemetry
            odometer={session.odometer}
            fuelLevel={session.fuel_level}
            onOdometerChange={(value) => updateSession({ odometer: value })}
            onFuelLevelChange={(value) => updateSession({ fuel_level: value })}
          />
        );
      case 5:
        return (
          <Financials
            pickupDate={session.pickup_date}
            returnDate={session.return_date}
            dailyRate={session.daily_rate}
            deposit={session.deposit}
            totalAmount={session.total_amount}
            onPickupDateChange={(value) => updateSession({ pickup_date: value })}
            onReturnDateChange={(value) => updateSession({ return_date: value })}
            onDailyRateChange={(value) => updateSession({ daily_rate: value })}
            onDepositChange={(value) => updateSession({ deposit: value })}
            onTotalAmountChange={(value) => updateSession({ total_amount: value })}
          />
        );
      case 6:
        return (
          <SignaturePad
            signatureData={session.signature_data}
            vehicleType={session.vehicle_type}
            totalAmount={session.total_amount}
            onSignatureChange={(data) => updateSession({ signature_data: data })}
          />
        );
      case 7:
        return (
          <VehicleReturn
            session={session}
            onUpdate={(updates) => updateSession(updates)}
          />
        );
      case 8:
        return <PrintView session={session} onPrint={() => {}} />;
      case 9:
        return (
          <SessionManager
            currentSession={session}
            onSaveSuccess={(id) => updateSession({ id })}
            onLoadSession={(loadedSession) => setSession(loadedSession)}
            onNewSession={handleNewSession}
            onNavigateToSection={(sectionId) => setActiveSection(sectionId)}
          />
        );
      default:
        return null;
    }
  };

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-center">
            <Logo className="h-12 md:h-14 lg:h-16 w-auto" />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max px-2 md:px-4 pb-2 md:pb-3 md:justify-center">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const isPast = activeSection > section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex flex-col items-center px-3 md:px-5 lg:px-6 py-2 md:py-3 mx-1 md:mx-1.5 rounded-lg md:rounded-xl transition-all min-w-[70px] md:min-w-[90px] lg:min-w-[100px] touch-manipulation ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : isPast
                      ? 'bg-gray-700/50 text-green-400'
                      : 'bg-gray-800/30 text-gray-500 hover:bg-gray-800/50 hover:text-gray-300 active:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6 mb-1 md:mb-1.5" />
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                    {section.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            {currentSection?.fullTitle}
          </h1>
          <div className="h-1 md:h-1.5 w-20 md:w-24 bg-red-600 rounded mt-2 md:mt-3" />
        </div>

        <div className="bg-gray-800/30 rounded-xl md:rounded-2xl border border-gray-800 p-4 md:p-6 lg:p-8 min-h-[400px] md:min-h-[500px]">
          {renderContent()}
        </div>
      </main>

      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 sticky bottom-0 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4 md:gap-6">
            <button
              onClick={goToPrev}
              disabled={activeSection === 1}
              className={`flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-medium transition-all touch-manipulation ${
                activeSection === 1
                  ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500'
              }`}
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden sm:inline text-base md:text-lg">Previous</span>
            </button>

            <div className="flex gap-1.5 md:gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-2.5 md:w-3 h-2.5 md:h-3 rounded-full transition-all touch-manipulation ${
                    activeSection === section.id
                      ? 'bg-red-600 w-6 md:w-8'
                      : activeSection > section.id
                      ? 'bg-green-500'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              disabled={activeSection === 9}
              className={`flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-medium transition-all touch-manipulation ${
                activeSection === 9
                  ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-600/30'
              }`}
            >
              <span className="hidden sm:inline text-base md:text-lg">Next</span>
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
