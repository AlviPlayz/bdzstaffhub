
import React, { useState, useEffect } from 'react';
import { StaffMember } from '@/types/staff';
import { getGradeColorClass } from '@/utils/gradeUtils';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StaffCardProps {
  staff: StaffMember;
  compact?: boolean;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff, compact = false }) => {
  const { name, role, rank, avatar, overallScore, overallGrade } = staff;
  const [imageError, setImageError] = useState(false);
  
  // Extract initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Add cache-busting parameter to avatar URL if it's not the placeholder
  const avatarUrl = React.useMemo(() => {
    if (!avatar || avatar === '/placeholder.svg' || imageError) {
      return '/placeholder.svg';
    }
    
    try {
      // Try to parse as URL and add timestamp
      const url = new URL(avatar);
      url.searchParams.set('t', Date.now().toString());
      return url.toString();
    } catch (e) {
      // If URL parsing fails, just add timestamp parameter
      const separator = avatar.includes('?') ? '&' : '?';
      return `${avatar}${separator}t=${Date.now()}`;
    }
  }, [avatar, imageError]);
  
  // Special handling for Manager/Owner scores
  const displayScore = React.useMemo(() => {
    if (role === 'Manager' || role === 'Owner') {
      return 'Immeasurable';
    }
    return overallScore.toFixed(1);
  }, [role, overallScore]);
  
  // Special handling for Manager/Owner grades
  const displayGrade = React.useMemo(() => {
    if (role === 'Manager' || role === 'Owner') {
      return 'SSS+';
    }
    return overallGrade;
  }, [role, overallGrade]);
  
  return (
    <div className="cyber-panel rounded-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-md overflow-hidden cyber-border"> {/* Changed from rounded-full to rounded-md */}
            <Avatar className="w-full h-full">
              <AvatarImage 
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => {
                  console.error("Image failed to load:", avatar);
                  setImageError(true);
                }}
              />
              <AvatarFallback className="bg-cyber-darkpurple text-cyber-cyan">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute -bottom-1 -right-1">
            <span className={`${getGradeColorClass(displayGrade)} letter-grade`}>
              {displayGrade}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-digital text-white">{name}</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-cyber-cyan">{role}</p>
              {rank && <p className="text-xs text-cyber-yellow">{rank}</p>}
            </div>
            <p className="text-sm">
              Score: <span className="text-cyber-cyan font-bold">
                {displayScore}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Link to={`/staff/${staff.id}`} className="cyber-button text-sm py-1 px-3 rounded flex items-center gap-1">
          View Profile <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default StaffCard;
