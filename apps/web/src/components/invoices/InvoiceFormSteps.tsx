'use client';

import { ReactNode } from 'react';
import { Badge } from '@/components/ui';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface InvoiceFormStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function InvoiceFormSteps({ steps, currentStep, className = '' }: InvoiceFormStepsProps) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm
                        ${isCompleted
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : isActive
                          ? 'border-primary-600 text-primary-600 bg-white'
                          : 'border-gray-300 text-gray-400 bg-white'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        flex-1 h-0.5 mx-4
                        ${isCompleted ? 'bg-primary-600' : 'bg-gray-300'}
                      `}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

