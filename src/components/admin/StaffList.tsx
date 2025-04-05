
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
  
  const getLetterGradeClassName = (grade: LetterGrade, role: StaffRole): string => {
    // Special case for Owner
    if (role === 'Owner') return 'text-fuchsia-400';
    // Special case for Manager (use same style as SSS+)
    if (role === 'Manager' && grade === 'SSS+') return 'text-fuchsia-400';
    
    // Regular grades
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
      case 'Immeasurable': return 'text-purple-400';
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
  
  // Sort staff so Owners always appear at the top, followed by Managers, then others
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (a.role === 'Owner' && b.role !== 'Owner') return -1;
    if (a.role !== 'Owner' && b.role === 'Owner') return 1;
    if (a.role === 'Manager' && b.role !== 'Manager') return -1;
    if (a.role !== 'Manager' && b.role === 'Manager') return 1;
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
                  ? isOwner(staff) 
                    ? 'bg-red-500/20 border border-red-500' 
                    : 'bg-cyber-cyan/20 border border-cyber-cyan' 
                  : isOwner(staff)
                    ? 'hover:bg-red-500/10 border border-red-500/40'
                    : 'hover:bg-cyber-darkpurple'
                }`}
            >
              <div className="relative">
                {isOwner(staff) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-amber-400 animate-pulse z-10" title="Owner of the Realm">
                    👑
                  </div>
                )}
                <div className={`w-10 h-10 ${isOwner(staff) ? 'rounded-none' : 'rounded-md'} overflow-hidden mr-3 ${isOwner(staff) ? 'shadow-[0_0_10px_rgba(255,0,0,0.7)]' : ''}`}>
                  <Avatar className="w-full h-full">
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
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-white font-cyber">{staff.name}</h3>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-sm ${isOwner(staff) ? 'text-red-500 font-bold' : staff.role === 'Manager' ? 'text-purple-400' : 'text-cyber-cyan'}`}>
                      {getStaffRoleLabel(staff.role)}
                    </p>
                    {staff.rank && (
                      <p className={`text-xs ${isOwner(staff) ? 'text-red-400' : 'text-cyber-yellow'}`}>
                        {staff.rank}
                      </p>
                    )}
                  </div>
                  <p className={`text-sm ${getLetterGradeClassName(staff.overallGrade, staff.role)}`}>
                    {staff.role === 'Owner' || staff.role === 'Manager' ? 'SSS+' : staff.overallGrade}
                  </p>
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
