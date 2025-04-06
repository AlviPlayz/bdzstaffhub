
import React from 'react';
import { format } from 'date-fns';
import { TabsContent } from '@/components/ui/tabs';
import PerformanceBar from '../PerformanceBar';
import { HistoryEntry } from '@/utils/historyUtils';
import { StaffRole } from '@/types/staff';

interface HistoryTabProps {
  entry: HistoryEntry;
  index: number;
  tabValue: string;
  staffRole: StaffRole;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  entry,
  index,
  tabValue,
  staffRole
}) => {
  const isManager = staffRole === 'Manager' || staffRole === 'Owner';

  return (
    <TabsContent 
      key={index} 
      value={tabValue}
      className="pt-4 border-t border-cyber-cyan/20"
    >
      <div className="mb-4">
        <h3 className="text-lg text-white mb-2">Performance Snapshot</h3>
        <p className="text-sm text-cyber-cyan mb-1">
          Date: <span className="text-white">{format(entry.date, 'EEEE, d MMMM yyyy')}</span>
        </p>
        <p className="text-sm text-cyber-cyan mb-1">
          Rank: <span className="text-white">{entry.rank}</span>
        </p>
        <p className="text-sm text-cyber-cyan mb-1">
          Overall Grade: <span className={`text-white letter-grade ${isManager ? 'grade-sss' : ''}`}>{entry.overallGrade}</span>
        </p>
        <p className="text-sm text-cyber-cyan mb-4">
          Overall Score: <span className="text-white">{entry.overallScore}</span>
        </p>
      </div>
      
      <div className="space-y-3">
        <h4 className="text-cyber-cyan border-b border-cyber-cyan/30 pb-1 mb-2">Metric Breakdown</h4>
        {Object.entries(entry.metrics).map(([key, metric]) => (
          <PerformanceBar key={key} metric={metric} staffRole={staffRole} staffRank={entry.rank} />
        ))}
      </div>
    </TabsContent>
  );
};

export default React.memo(HistoryTab);
