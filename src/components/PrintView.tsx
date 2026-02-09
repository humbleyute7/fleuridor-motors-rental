import { RentalSession } from '../types/rental';
import { Printer, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PrintViewProps {
  session: RentalSession;
  onPrint: () => void;
}

export default function PrintView({ session, onPrint }: PrintViewProps) {
  const [showPreview, setShowPreview] = useState(true);

  const calculateDays = () => {
    const pickup = new Date(session.pickup_date);
    const returnDate = new Date(session.return_date);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const days = calculateDays();
  const contractId = session.id?.slice(0, 8).toUpperCase() || 'DRAFT';

  const handlePrint = () => {
    onPrint();
    window.print();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8 no-print">
        <div className="flex items-center gap-3 md:gap-4">
          <Printer className="w-6 h-6 md:w-7 md:h-7 text-red-400" />
          <h2 className="text-xl md:text-2xl font-bold text-white">Print Contract</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-red-500/20"
          >
            <Printer className="w-5 h-5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 no-print">
        Click "Print / Save PDF" to open your browser's print dialog. From there you can print directly or choose "Save as PDF" as the destination.
      </p>

      <div className={`overflow-auto rounded-lg border border-gray-700 no-print ${showPreview ? 'max-h-[65vh]' : 'max-h-0 overflow-hidden border-0'}`}>
        <div
          style={{
            width: '816px',
            padding: '40px',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: '#111827',
            fontSize: '12px',
            lineHeight: '1.4',
          }}
        >
          <ContractContent session={session} days={days} contractId={contractId} />
        </div>
      </div>

      <div
        id="print-contract"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '100%',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#111827',
          fontSize: '11px',
          lineHeight: '1.35',
          padding: '10px',
        }}
      >
        <ContractContent session={session} days={days} contractId={contractId} />
      </div>
    </div>
  );
}

function ContractContent({
  session,
  days,
  contractId,
}: {
  session: RentalSession;
  days: number;
  contractId: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #111827',
          paddingBottom: '10px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#DC2626' }}>FLEURIDOR</div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>MOTORS LTD.</div>
          <div style={{ fontSize: '8px', color: '#6b7280', marginTop: '2px' }}>
            SALES, RENTALS, AUTO PARTS & SERVICES
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>VEHICLE RENTAL AGREEMENT</div>
          <div style={{ fontSize: '9px', color: '#6b7280' }}>
            South Dock Road, Providenciales | Tel: +1 (649) 241-7341
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>Contract #{contractId}</div>
          <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase' }}>
            {session.session_status}
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280' }}>
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '8px' }}>
              <InfoBox title="CUSTOMER INFORMATION">
                <Field label="Name" value={session.customer_name} />
                <Field label="Phone" value={session.customer_phone} />
                <Field label="Email" value={session.customer_email} />
                <Field label="Address" value={session.customer_address} />
              </InfoBox>
            </td>
            <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '8px' }}>
              <InfoBox title="VEHICLE INFORMATION">
                <Field label="License Plate" value={session.vehicle_plate} />
                <Field label="Vehicle Type" value={session.vehicle_type} />
                <Field label="Odometer" value={`${session.odometer.toLocaleString()} miles`} />
                <Field label="Fuel Level" value={`${session.fuel_level.toFixed(0)}%`} />
              </InfoBox>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <tbody>
          <tr>
            <td style={{ width: '33.33%', verticalAlign: 'top', paddingRight: '6px' }}>
              <InfoBox title="RENTAL PERIOD">
                <Field label="Pickup" value={new Date(session.pickup_date).toLocaleDateString()} />
                <Field label="Return" value={new Date(session.return_date).toLocaleDateString()} />
                <Field label="Duration" value={`${days} day(s)`} />
                <Field label="Mileage" value={`${session.allowed_mileage || 200} mi/day`} />
              </InfoBox>
            </td>
            <td style={{ width: '33.33%', verticalAlign: 'top', padding: '0 6px' }}>
              <InfoBox title="CHARGES" bg="#f9fafb">
                <Row left="Daily Rate" right={`$${session.daily_rate}`} />
                <Row left="Days" right={`x ${days}`} />
                <Row left="Deposit" right={`$${session.deposit}`} />
                <Row left="Total" right={`$${session.total_amount}`} bold border />
              </InfoBox>
            </td>
            <td style={{ width: '33.33%', verticalAlign: 'top', paddingLeft: '6px' }}>
              <InfoBox title="ADDITIONAL RATES">
                <Field label="Late Fee" value={`$${session.hourly_late_fee || 25}/hr`} />
                <Field label="Daily Late" value={`$${session.daily_late_fee || 150}/day`} />
                <Field label="Excess Mileage" value={`$${session.rate_per_mile || 0.25}/mi`} />
                <Field label="Refuel Cost" value={`$${session.refuel_price_per_gallon || 5}/gal`} />
              </InfoBox>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '8px' }}>
              <InfoBox title="ID DOCUMENTS">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '50%', textAlign: 'center', paddingRight: '4px' }}>
                        <PhotoSlot label="Passport/ID" url={session.passport_url} />
                      </td>
                      <td style={{ width: '50%', textAlign: 'center', paddingLeft: '4px' }}>
                        <PhotoSlot label="Driver's License" url={session.license_url} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </InfoBox>
            </td>
            <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '8px' }}>
              <InfoBox title="VEHICLE INSPECTION PHOTOS">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '25%', textAlign: 'center', padding: '0 2px' }}>
                        <PhotoSlot label="Front" url={session.photo_front} />
                      </td>
                      <td style={{ width: '25%', textAlign: 'center', padding: '0 2px' }}>
                        <PhotoSlot label="Rear" url={session.photo_rear} />
                      </td>
                      <td style={{ width: '25%', textAlign: 'center', padding: '0 2px' }}>
                        <PhotoSlot label="Left" url={session.photo_left} />
                      </td>
                      <td style={{ width: '25%', textAlign: 'center', padding: '0 2px' }}>
                        <PhotoSlot label="Right" url={session.photo_right} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </InfoBox>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '10px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '4px',
            marginBottom: '6px',
          }}
        >
          TERMS & CONDITIONS
        </div>
        <div style={{ fontSize: '9px', color: '#374151' }}>
          <p style={{ marginBottom: '3px' }}>
            1. The renter acknowledges receiving the vehicle with {session.fuel_level.toFixed(0)}%
            fuel level and {session.odometer.toLocaleString()} miles on the odometer. The vehicle
            must be returned in the same condition.
          </p>
          <p style={{ marginBottom: '3px' }}>
            2. Included mileage: {session.allowed_mileage || 200} miles per day. Excess mileage will
            be charged at ${session.rate_per_mile || 0.25} per mile.
          </p>
          <p style={{ marginBottom: '3px' }}>
            3. Late returns: ${session.hourly_late_fee || 25}/hour for the first 4 hours, then $
            {session.daily_late_fee || 150}/day thereafter.
          </p>
          <p style={{ marginBottom: '3px' }}>
            4. Fuel shortage upon return will be charged at $
            {session.refuel_price_per_gallon || 5.0}/gallon plus a service fee.
          </p>
          <p style={{ marginBottom: '3px' }}>
            5. The renter is responsible for all traffic violations, parking tickets, and toll
            charges incurred during the rental period.
          </p>
          <p style={{ marginBottom: '3px' }}>
            6. The vehicle is covered by basic liability insurance. Additional coverage options are
            available upon request.
          </p>
          <p>
            7. The vehicle must not be used for illegal purposes, racing, towing, or hire. Only
            authorized drivers aged 21+ may operate the vehicle.
          </p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '8px' }}>
              <InfoBox title="CUSTOMER SIGNATURE">
                <div
                  style={{
                    borderBottom: '2px solid #111827',
                    height: '45px',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  {session.signature_data && (
                    <img
                      src={session.signature_data}
                      alt="Customer Signature"
                      style={{ maxHeight: '40px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  )}
                </div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>
                  Date:{' '}
                  {session.created_at
                    ? new Date(session.created_at).toLocaleDateString()
                    : '_______________'}
                </div>
              </InfoBox>
            </td>
            <td style={{ width: '50%', verticalAlign: 'top', paddingLeft: '8px' }}>
              <InfoBox title="AUTHORIZED REPRESENTATIVE">
                <div
                  style={{
                    borderBottom: '2px solid #111827',
                    height: '45px',
                    marginBottom: '4px',
                  }}
                />
                <div style={{ fontSize: '9px', color: '#6b7280' }}>Date: _______________</div>
              </InfoBox>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          textAlign: 'center',
          fontSize: '9px',
          color: '#6b7280',
          borderTop: '1px solid #d1d5db',
          paddingTop: '8px',
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#111827' }}>FLEURIDOR MOTORS LTD.</div>
        <div>South Dock Road, Providenciales, Turks and Caicos Islands, TKCA 1ZZ</div>
        <div>Tel: +1 (649) 241-7341 | Email: info@fleuridormotorsltd.com</div>
      </div>
    </div>
  );
}

function InfoBox({
  title,
  children,
  bg,
}: {
  title: string;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        padding: '10px',
        background: bg || 'transparent',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '10px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '4px',
          marginBottom: '6px',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '3px', fontSize: '11px' }}>
      <span style={{ fontWeight: 600 }}>{label}:</span> {value}
    </div>
  );
}

function Row({
  left,
  right,
  bold,
  border,
}: {
  left: string;
  right: string;
  bold?: boolean;
  border?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2px',
        fontSize: '11px',
        fontWeight: bold ? 'bold' : undefined,
        borderTop: border ? '1px solid #d1d5db' : undefined,
        paddingTop: border ? '3px' : undefined,
        marginTop: border ? '3px' : undefined,
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

function PhotoSlot({ label, url }: { label: string; url?: string }) {
  return (
    <div>
      <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '3px' }}>{label}</div>
      <div
        style={{
          width: '100%',
          height: '60px',
          background: '#f3f4f6',
          borderRadius: '3px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {url ? (
          <img
            src={url}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '9px', color: '#9ca3af' }}>N/A</span>
        )}
      </div>
    </div>
  );
}
