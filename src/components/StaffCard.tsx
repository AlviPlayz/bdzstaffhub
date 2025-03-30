
import React from 'react';
import { StaffMember } from '@/types/staff';
import PerformanceBar from './PerformanceBar';
import { getGradeColorClass } from '@/utils/gradeUtils';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StaffCardProps {
  staff: StaffMember;
  compact?: boolean;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff, compact = false }) => {
  const { name, role, avatar, metrics, overallScore, overallGrade } = staff;
  
  // Get the first 3 metrics for compact view
  const metricEntries = Object.entries(metrics).slice(0, compact ? 3 : undefined);

  return (
    <div className="cyber-panel rounded-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden cyber-border">
            <img 
              src={avatar} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <span className={`${getGradeColorClass(overallGrade)} letter-grade`}>
              {overallGrade}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-digital text-white">{name}</h3>
          <div className="flex justify-between items-center">
            <p className="text-sm text-cyber-cyan">{role}</p>
            <p className="text-sm">Score: <span className="text-cyber-cyan font-bold">{overallScore.toFixed(1)}</span></p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {metricEntries.map(([key, metric]) => (
          <PerformanceBar key={key} metric={metric} />
        ))}
      </div>
      
      {compact && (
        <div className="mt-4 flex justify-end">
          <Link to={`/staff/${staff.id}`} className="cyber-button text-sm py-1 px-3 rounded flex items-center gap-1">
            View Details <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default StaffCard;
