
import React from 'react';
import { StaffRole } from '@/types/staff';

interface NoHistoryMessageProps {
  staffRole: StaffRole;
  isEmptyHistory: boolean;
}

const NoHistoryMessage: React.FC<NoHistoryMessageProps> = ({ staffRole, isEmptyHistory }) => {
  const isManager = staffRole === 'Manager' || staffRole === 'Owner';
  
  if (isManager) {
    return (
      <div className="text-cyber-cyan text-center py-6">
        <p className="mb-2">Performance history is not tracked for management roles.</p>
        <p className="text-sm opacity-70">Management performance is considered immeasurable.</p>
      </div>
    );
  }
  
  if (isEmptyHistory) {
    return (
      <p className="text-white text-center py-6">
        No historical data available yet. Performance history will be updated weekly every Saturday.
      </p>
    );
  }
  
  return null;
};

export default React.memo(NoHistoryMessage);
