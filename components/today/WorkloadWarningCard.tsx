'use client';

import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { WorkloadCapacityModel } from '../../lib/personalization/types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/Badge';

interface WorkloadWarningCardProps {
  workload: WorkloadCapacityModel;
}

export const WorkloadWarningCard: React.FC<WorkloadWarningCardProps> = ({ workload }) => {
  if (!workload.isOverloaded) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
            Workload Capacity Warning
          </span>
        </div>
        <Badge variant="danger" size="sm">
          {workload.scheduledHours.toFixed(1)}h / {workload.maxOverloadThresholdHours.toFixed(1)}h Max
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <p className="text-amber-900 dark:text-amber-300">
          Your scheduled commitments today (<strong>{workload.scheduledHours.toFixed(1)} hrs</strong>) exceed your sustainable daily threshold (7.0 hrs). Consider postponing low-priority tasks to prevent burnout.
        </p>
      </div>
    </div>
  );
};
