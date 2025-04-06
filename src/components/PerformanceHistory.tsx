
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { StaffRole } from '@/types/staff';
import { generateHistoricalData } from '@/utils/historyUtils';
import HistoryTabList from './history/HistoryTabList';
import HistoryTab from './history/HistoryTab';
import NoHistoryMessage from './history/NoHistoryMessage';

interface PerformanceHistoryProps {
  staffId: string;
  staffRole: StaffRole;
  staffRank?: string;
}

const PerformanceHistory: React.FC<PerformanceHistoryProps> = ({ 
  staffId, 
  staffRole, 
  staffRank 
}) => {
  const [historyData, setHistoryData] = useState([]);
  const [activeTab, setActiveTab] = useState<string>('current');
  
  const isManager = staffRole === 'Manager' || staffRole === 'Owner';

  useEffect(() => {
    // Only fetch history data if not a manager role
    if (!isManager) {
      const data = generateHistoricalData(staffId, staffRole, staffRank);
      setHistoryData(data);
    }
  }, [staffId, staffRole, staffRank, isManager]);

  // Show a different UI for managers
  if (isManager) {
    return (
      <div className="p-4 bg-cyber-darkpurple/50 rounded">
        <NoHistoryMessage staffRole={staffRole} isEmptyHistory={false} />
      </div>
    );
  }

  return (
    <div className="p-4 bg-cyber-darkpurple/50 rounded">
      {historyData.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <HistoryTabList 
            historyData={historyData} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <TabsContent value="current" className="pt-4 border-t border-cyber-cyan/20">
            <p className="text-cyber-cyan mb-4">Current performance data is displayed in the Performance Metrics panel.</p>
          </TabsContent>
          
          {historyData.map((entry, index) => (
            <HistoryTab 
              key={index}
              entry={entry}
              index={index}
              tabValue={`week-${index + 1}`}
              staffRole={staffRole}
            />
          ))}
        </Tabs>
      ) : (
        <NoHistoryMessage staffRole={staffRole} isEmptyHistory={true} />
      )}
    </div>
  );
};

export default PerformanceHistory;
