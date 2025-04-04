
import React from 'react';
import { StaffMember, StaffRole, LetterGrade } from '@/types/staff';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StaffListProps {
  filteredStaff: StaffMember[];
  selectedStaff: StaffMember | null;
  onStaffSelect: (staff: StaffMember) => void;
}

const StaffList: React.FC<StaffListProps> = ({ 
  filteredStaff, 
  selectedStaff, 
  onStaffSelect 
}) => {
  
  const getStaffRoleLabel = (role: StaffRole): string => {
    switch (role) {
      case 'Moderator': return 'Moderator';
      case 'Builder': return 'Builder';
      case 'Manager': return 'Manager';
      case 'Owner': return 'Owner';
      default: return 'Unknown';
    }
  };
  
  const getLetterGradeClassName = (grade: LetterGrade): string => {
    switch (grade) {
      case 'S+': return 'text-green-500';
      case 'S': return 'text-green-400';
      case 'A+': return 'text-lime-500';
      case 'A': return 'text-lime-400';
      case 'B+': return 'text-yellow-500';
      case 'B': return 'text-yellow-400';
      case 'C': return 'text-orange-500';
      case 'D': return 'text-orange-400';
      case 'E': return 'text-red-500';
      case 'E-': return 'text-red-400';
      case 'SSS+': return 'text-fuchsia-400';
      case 'Immeasurable': return 'text-fuchsia-400';
      default: return 'text-gray-400';
    }
  };
  
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
    if (!avatarUrl || avatarUrl === '/placeholder.svg') {
      return '/placeholder.svg';
    }
    
    try {
      // Add a timestamp to bust cache
      const url = new URL(avatarUrl);
      if (!url.searchParams.has('t')) {
        url.searchParams.set('t', Date.now().toString());
      }
      return url.toString();
    } catch (e) {
      return avatarUrl;
    }
  };

  // Check if staff is owner for special styling
  const isOwner = (staff: StaffMember): boolean => {
    return staff.role === 'Owner';
  };
  
  // Sort staff so Owners always appear at the top
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (a.role === 'Owner' && b.role !== 'Owner') return -1;
    if (a.role !== 'Owner' && b.role === 'Owner') return 1;
    return 0;
  });
  
  return (
    <div className="lg:col-span-1">
      <div className="cyber-panel h-[600px] overflow-y-auto">
        <h2 className="text-lg font-digital text-white mb-4">Staff Members ({filteredStaff.length})</h2>
        <div className="space-y-3">
          {sortedStaff.map(staff => (
            <div 
              key={staff.id}
              onClick={() => onStaffSelect(staff)}
              className={`flex items-center p-3 rounded transition-all cursor-pointer
                ${selectedStaff?.id === staff.id 
                  ? 'bg-cyber-cyan/20 border border-cyber-cyan' 
                  : 'hover:bg-cyber-darkpurple'}`}
            >
              <div className="w-10 h-10 rounded-md overflow-hidden mr-3"> {/* Changed from rounded-full to rounded-md */}
                <Avatar className={`w-full h-full ${isOwner(staff) ? 'shadow-[0_0_10px_rgba(255,0,0,0.7)]' : ''}`}>
                  <AvatarImage 
                    src={getAvatarUrl(staff.avatar)} 
                    alt={staff.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <AvatarFallback className="bg-cyber-darkpurple text-cyber-cyan">
                    {getInitials(staff.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  {isOwner(staff) && (
                    <span className="text-amber-400 mr-1" title="Owner">👑</span>
                  )}
                  <h3 className="text-white font-cyber">{staff.name}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-cyber-cyan text-sm">{getStaffRoleLabel(staff.role)}</p>
                    {staff.rank && <p className="text-cyber-yellow text-xs">{staff.rank}</p>}
                  </div>
                  <p className={`text-sm text-white ${getLetterGradeClassName(staff.overallGrade)}`}>{staff.overallGrade}</p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredStaff.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/60 font-cyber">No staff members found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffList;
