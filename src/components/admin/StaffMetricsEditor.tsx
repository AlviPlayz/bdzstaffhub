
import React, { useState, useEffect } from 'react';
import { StaffMember } from '@/types/staff';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGradeColorClass } from '@/services/staff/staffGrading';

interface StaffMetricsEditorProps {
  selectedStaff: StaffMember | null;
  onScoreChange: (metricKey: string, newScore: number) => void;
  saveChanges: () => void;
  onCancelEdit: () => void;
  onRemoveStaff: () => void;
}

const StaffMetricsEditor: React.FC<StaffMetricsEditorProps> = ({
  selectedStaff,
  onScoreChange,
  saveChanges,
  onCancelEdit,
  onRemoveStaff
}) => {
  const [rank, setRank] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (selectedStaff) {
      setRank(selectedStaff.rank || '');
      setImageError(false); // Reset image error state when staff changes
    }
  }, [selectedStaff]);
  
  if (!selectedStaff) {
    return (
      <div className="col-span-2">
        <div className="cyber-panel h-[600px] flex flex-col justify-center items-center">
          <p className="text-white text-center mb-2">Select a staff member to view and edit their metrics</p>
          <p className="text-cyber-cyan/50">No staff member selected</p>
        </div>
      </div>
    );
  }
  
  // Helper function to get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Add cache-busting parameter to avatar URL
  const getAvatarUrl = (avatarUrl: string) => {
    if (!avatarUrl || avatarUrl === '/placeholder.svg' || imageError) {
      return '/placeholder.svg';
    }
    
    try {
      // Add a timestamp to bust cache
      const timestamp = Date.now().toString();
      
      // Check if it's already a URL object
      if (avatarUrl.startsWith('http')) {
        const url = new URL(avatarUrl);
        url.searchParams.set('t', timestamp);
        return url.toString();
      } else {
        // For local paths or other formats
        const separator = avatarUrl.includes('?') ? '&' : '?';
        return `${avatarUrl}${separator}t=${timestamp}`;
      }
    } catch (e) {
      console.error('Error formatting avatar URL:', e);
      return avatarUrl;
    }
  };
  
  // Check if the staff is a Manager or Manager(Owner)
  const isManager = selectedStaff.role === 'Manager';
  const isOwner = isManager && selectedStaff.rank === 'Owner';
  
  // Get rank options based on staff role
  const getRankOptions = () => {
    const role = selectedStaff.role;
    
    if (role === 'Moderator') {
      return (
        <>
          <SelectItem value="Sr. Mod">Sr. Mod</SelectItem>
          <SelectItem value="Mod">Mod</SelectItem>
          <SelectItem value="Jr. Mod">Jr. Mod</SelectItem>
          <SelectItem value="Trial Mod">Trial Mod</SelectItem>
        </>
      );
    } else if (role === 'Builder') {
      return (
        <>
          <SelectItem value="Head Builder">Head Builder</SelectItem>
          <SelectItem value="Builder">Builder</SelectItem>
          <SelectItem value="Trial Builder">Trial Builder</SelectItem>
        </>
      );
    } else if (role === 'Manager') {
      return (
        <>
          <SelectItem value="Owner">Owner</SelectItem>
          <SelectItem value="Manager">Manager</SelectItem>
        </>
      );
    } else {
      return <SelectItem value="Manager">Manager</SelectItem>;
    }
  };
  
  // Handle rank change
  const handleRankChange = (newRank: string) => {
    setRank(newRank);
    selectedStaff.rank = newRank;
  };
  
  // Display role name
  const displayRole = isOwner ? 'Manager (Owner)' : selectedStaff.role;
  
  return (
    <div className="col-span-2">
      <div className="cyber-panel h-[600px] overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {isOwner && (
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-amber-400 animate-pulse z-10" title="Owner">
                👑
              </div>
            )}
            <div className={`w-16 h-16 rounded-md overflow-hidden cyber-border ${isOwner ? 'shadow-[0_0_12px_rgba(255,0,0,0.7)]' : ''}`}>
              <Avatar className="w-full h-full">
                <AvatarImage 
                  src={getAvatarUrl(selectedStaff.avatar)} 
                  alt={selectedStaff.name}
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.error('Image failed to load:', selectedStaff.avatar);
                    setImageError(true);
                  }}
                />
                <AvatarFallback className="bg-cyber-darkpurple text-cyber-cyan">
                  {getInitials(selectedStaff.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <h2 className="text-2xl cyber-text-glow font-digital text-white">{selectedStaff.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${isOwner ? 'text-red-500 font-bold' : 'text-cyber-cyan'}`}>
                {displayRole}
              </span>
              <div className="w-full max-w-xs">
                <Select 
                  value={rank}
                  onValueChange={handleRankChange}
                  defaultValue={rank || undefined}
                >
                  <SelectTrigger className="bg-cyber-black border border-cyber-cyan/40 text-white h-7 text-xs py-0">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-black border border-cyber-cyan text-white">
                    {getRankOptions()}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6 mb-6">
          <h3 className="text-xl font-digital text-cyber-cyan border-b border-cyber-cyan/30 pb-2">Performance Metrics</h3>
          
          {Object.entries(selectedStaff.metrics).map(([key, metric]) => {
            const gradeColorClass = getGradeColorClass(isManager ? 'SSS+' : metric.letterGrade);
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor={`metric-${key}`} className="text-white">{metric.name}</label>
                  <span className={`letter-grade text-sm ${gradeColorClass}`}>
                    {isManager ? 'SSS+' : metric.letterGrade}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <input
                    id={`metric-${key}`}
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={isManager ? 10 : metric.score}
                    onChange={(e) => !isManager && onScoreChange(key, parseFloat(e.target.value))}
                    className="w-full cyber-range"
                    disabled={isManager}
                  />
                  <span className="text-cyber-cyan font-mono w-20 text-right">
                    {isManager ? 'Immeasurable' : metric.score.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-4 justify-between">
          <button 
            onClick={onRemoveStaff}
            className="cyber-button-danger"
          >
            Remove Staff
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={onCancelEdit}
              className="cyber-button-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={saveChanges}
              className="cyber-button"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffMetricsEditor;
