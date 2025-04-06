
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoryEntry, formatWeekAgo } from '@/utils/historyUtils';
import { format } from 'date-fns';

interface HistoryTabListProps {
  historyData: HistoryEntry[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

const HistoryTabList: React.FC<HistoryTabListProps> = ({ 
  historyData, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <TabsList className="mb-6 flex flex-nowrap overflow-x-auto gap-2 bg-transparent pb-2">
      <TabsTrigger 
        value="current" 
        className="cyber-tab"
        onClick={() => onTabChange('current')}
      >
        Current
      </TabsTrigger>
      
      {historyData.map((entry, index) => (
        <TabsTrigger 
          key={index} 
          value={`week-${index + 1}`}
          className="cyber-tab whitespace-nowrap"
          onClick={() => onTabChange(`week-${index + 1}`)}
        >
          {formatWeekAgo(entry.date)} ({format(entry.date, 'd MMM yyyy')})
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default React.memo(HistoryTabList);
