
import React from 'react';
import { LetterGrade, PerformanceMetric } from '@/types/staff';
import { getGradeColorClass } from '@/utils/gradeUtils';

interface PerformanceBarProps {
  metric: PerformanceMetric;
}

const PerformanceBar: React.FC<PerformanceBarProps> = ({ metric }) => {
  const { name, score, letterGrade } = metric;
  const percentage = Math.min(Math.max(0, score * 10), 100); // Convert 0-10 score to 0-100 percentage

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-digital text-cyber-cyan cyber-text-glow">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{score.toFixed(1)}</span>
          <span className={`${getGradeColorClass(letterGrade)} letter-grade`}>
            {letterGrade}
          </span>
        </div>
      </div>
      <div className="neon-progress-bg">
        <div 
          className="neon-progress-bar animate-pulse-glow" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default PerformanceBar;
