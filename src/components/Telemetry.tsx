import { useState, useEffect, useRef } from 'react';
import { Gauge } from 'lucide-react';

interface TelemetryProps {
  odometer: number;
  fuelLevel: number;
  onOdometerChange: (value: number) => void;
  onFuelLevelChange: (value: number) => void;
}

export default function Telemetry({
  odometer,
  fuelLevel,
  onOdometerChange,
  onFuelLevelChange,
}: TelemetryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const gaugeRef = useRef<SVGSVGElement>(null);
  const tickCount = 60;

  const handleFuelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFuelLevelChange(parseFloat(e.target.value));
  };

  const handleGaugeClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!gaugeRef.current) return;

    const rect = gaugeRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height - 20;

    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    let angle = Math.atan2(-y, x) * (180 / Math.PI);
    angle = 180 - angle;

    if (angle < 0) angle = 0;
    if (angle > 180) angle = 180;

    const percentage = (angle / 180) * 100;
    onFuelLevelChange(Math.round(percentage * 10) / 10);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const getTickColor = (percentage: number) => {
    if (percentage <= fuelLevel) {
      if (percentage < 15) {
        return '#ef4444';
      } else if (percentage < 85) {
        return '#e5e7eb';
      } else {
        return '#22d3ee';
      }
    }
    return '#374151';
  };

  return (
    <div className="tablet-card">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Gauge className="w-6 h-6 md:w-7 md:h-7 text-red-400" />
        <h2 className="tablet-heading">Vehicle Telemetry</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="md:flex md:flex-col md:justify-center">
          <label className="tablet-label">
            Odometer Reading (Miles)
          </label>
          <div className="relative">
            <input
              type="number"
              value={odometer}
              onChange={(e) => onOdometerChange(parseInt(e.target.value) || 0)}
              className="tablet-input text-2xl md:text-3xl font-mono pr-12"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm md:text-base">
              MI
            </span>
          </div>

          <div className="mt-6 md:mt-8 p-4 md:p-5 bg-gray-800/50 rounded-lg md:rounded-xl border border-gray-700">
            <div className="flex items-center justify-between text-sm md:text-base">
              <span className="text-gray-400">Estimated Range:</span>
              <span className="text-white font-semibold text-lg md:text-xl">
                {Math.round((fuelLevel / 100) * 400)} miles
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="tablet-label">
            Fuel Level: {fuelLevel.toFixed(1)}%
          </label>

          <div className="bg-gray-800 rounded-lg md:rounded-xl p-6 md:p-8 border border-gray-700">
            <div className="relative flex flex-col items-center">
              <svg
                ref={gaugeRef}
                width="300"
                height="180"
                viewBox="0 0 300 180"
                className="cursor-pointer select-none w-full max-w-[350px] md:max-w-[400px] h-auto touch-manipulation"
                onClick={handleGaugeClick}
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {Array.from({ length: tickCount }).map((_, index) => {
                  const percentage = (index / (tickCount - 1)) * 100;
                  const angle = (index / (tickCount - 1)) * 180;
                  const angleRad = ((180 - angle) * Math.PI) / 180;

                  const isLargeTick = index % 10 === 0;
                  const isMediumTick = index % 5 === 0 && !isLargeTick;

                  const innerRadius = isLargeTick ? 100 : isMediumTick ? 110 : 115;
                  const outerRadius = 130;

                  const x1 = 150 + innerRadius * Math.cos(angleRad);
                  const y1 = 160 - innerRadius * Math.sin(angleRad);
                  const x2 = 150 + outerRadius * Math.cos(angleRad);
                  const y2 = 160 - outerRadius * Math.sin(angleRad);

                  const color = getTickColor(percentage);
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

                <text
                  x="40"
                  y="170"
                  fill="#ef4444"
                  fontSize="20"
                  fontWeight="bold"
                >
                  E
                </text>
                <text
                  x="250"
                  y="170"
                  fill="#22d3ee"
                  fontSize="20"
                  fontWeight="bold"
                >
                  F
                </text>

                <g>
                  {(() => {
                    const needleAngle = ((fuelLevel / 100) * 180 * Math.PI) / 180;
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
                          filter="url(#glow)"
                        />
                        <circle
                          cx="150"
                          cy="160"
                          r="8"
                          fill="#1f2937"
                          stroke="#fbbf24"
                          strokeWidth="3"
                        />
                      </>
                    );
                  })()}
                </g>

                <text
                  x="150"
                  y="145"
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="24"
                  fontWeight="bold"
                >
                  {fuelLevel.toFixed(1)}%
                </text>
              </svg>

              <div className="mt-6 w-full">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={fuelLevel}
                  onChange={handleFuelChange}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                  className="w-full h-3 md:h-4 bg-transparent appearance-none cursor-pointer fuel-slider touch-manipulation"
                />
              </div>

              <div className="flex justify-between w-full text-xs md:text-sm text-gray-500 mt-2 px-4">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fuel-slider::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
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
          width: 28px;
          height: 28px;
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
          height: 4px;
          background: linear-gradient(to right, #ef4444 0%, #ef4444 15%, #e5e7eb 15%, #e5e7eb 85%, #22d3ee 85%);
          border-radius: 2px;
        }

        .fuel-slider::-moz-range-track {
          height: 4px;
          background: linear-gradient(to right, #ef4444 0%, #ef4444 15%, #e5e7eb 15%, #e5e7eb 85%, #22d3ee 85%);
          border-radius: 2px;
        }

        @media (min-width: 768px) {
          .fuel-slider::-webkit-slider-thumb {
            width: 32px;
            height: 32px;
          }

          .fuel-slider::-moz-range-thumb {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}
