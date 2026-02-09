import { PenTool, RotateCcw } from 'lucide-react';
import { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  signatureData?: string;
  vehicleType: string;
  totalAmount: number;
  onSignatureChange: (data: string) => void;
}

export default function SignaturePad({
  signatureData,
  vehicleType,
  totalAmount,
  onSignatureChange,
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (signatureData && sigCanvas.current) {
      sigCanvas.current.fromDataURL(signatureData);
    }
  }, []);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    onSignatureChange('');
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      const data = sigCanvas.current.toDataURL();
      onSignatureChange(data);
    }
  };

  return (
    <div className="tablet-card">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <PenTool className="w-6 h-6 md:w-7 md:h-7 text-red-400" />
        <h2 className="tablet-heading">
          Signature & Legal Agreement
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-700 max-h-[400px] md:max-h-[500px] overflow-y-auto touch-pan-y">
          <h3 className="text-white font-semibold text-base md:text-lg mb-3 md:mb-4">
            Terms & Conditions
          </h3>
          <div className="text-sm md:text-base text-gray-300 space-y-3 md:space-y-4">
            <p>
              By signing below, I acknowledge that I have received the{' '}
              <span className="text-red-400 font-semibold">
                {vehicleType || 'vehicle'}
              </span>{' '}
              in good working condition and agree to the following terms:
            </p>

            <ol className="list-decimal list-inside space-y-2 md:space-y-3 text-gray-400">
              <li>
                I will return the vehicle in the same condition as received,
                with normal wear and tear excepted.
              </li>
              <li>
                I am responsible for any damage to the vehicle during the
                rental period, including but not limited to collision, theft,
                vandalism, or mechanical damage caused by misuse.
              </li>
              <li>
                The vehicle must be returned with the same fuel level as
                documented at pickup. Failure to do so will result in a
                refueling charge plus a service fee.
              </li>
              <li>
                I agree to pay the total amount of{' '}
                <span className="text-red-400 font-semibold">
                  ${totalAmount.toFixed(2)}
                </span>{' '}
                as outlined in the financial summary.
              </li>
              <li>
                I confirm that I possess a valid driver's license and meet all
                age and insurance requirements.
              </li>
              <li>
                I understand that I am responsible for all traffic violations,
                parking tickets, and toll charges incurred during the rental
                period.
              </li>
              <li>
                The security deposit will be refunded within 7-10 business days
                after vehicle return, subject to inspection and verification of
                no damages or violations.
              </li>
              <li>
                I agree not to use the vehicle for any illegal purposes,
                off-road driving, racing, or to transport hazardous materials.
              </li>
            </ol>

            <p className="text-gray-400 mt-4">
              This agreement is governed by the laws of the jurisdiction in
              which the vehicle is rented. Any disputes shall be resolved in
              accordance with applicable law.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <label className="tablet-label mb-0">
              Customer Signature
            </label>
            <button
              onClick={clearSignature}
              className="tablet-button bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white text-sm flex items-center gap-2 border border-gray-700"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              Clear
            </button>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl border-2 border-gray-700 overflow-hidden">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'signature-canvas w-full h-48 md:h-64 lg:h-72',
              }}
              backgroundColor="white"
              penColor="black"
              onEnd={handleEnd}
            />
          </div>

          <p className="text-xs md:text-sm text-gray-500 mt-2 md:mt-3">
            Please sign above using your finger or stylus
          </p>
        </div>
      </div>

      <style>{`
        .signature-canvas {
          touch-action: none;
        }
      `}</style>
    </div>
  );
}
