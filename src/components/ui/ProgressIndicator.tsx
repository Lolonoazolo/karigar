'use client';

import React from 'react';

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps?: number;
  showLabels?: boolean;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps = 4,
}) => {
  return (
    <div className="w-full bg-[#e4e0d8] h-1.5 rounded-full overflow-hidden">
      <div
        className="bg-[#4a7c59] h-full transition-all duration-500 rounded-full"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  );
};
