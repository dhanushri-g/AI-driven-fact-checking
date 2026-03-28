import { CheckCircle, Circle, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProcessingStepsProps {
  currentStep: number;
}

const STEPS = [
  { label: 'Extracting Claims', icon: Zap },
  { label: 'Searching Evidence', icon: Zap },
  { label: 'Verifying Facts', icon: Zap },
  { label: 'Generating Verdict', icon: Zap },
];

export default function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  const [displayStep, setDisplayStep] = useState(currentStep);

  useEffect(() => {
    setDisplayStep(currentStep);
  }, [currentStep]);

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === displayStep;
          const isCompleted = index < displayStep;

          return (
            <div
              key={index}
              className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-blue-500/20 border border-blue-500/50'
                  : isCompleted
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-gray-800/30 border border-gray-700/30'
              }`}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                ) : isActive ? (
                  <Icon className="w-6 h-6 text-blue-400 animate-spin" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <span
                className={`font-medium transition-colors ${
                  isActive || isCompleted ? 'text-white' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
