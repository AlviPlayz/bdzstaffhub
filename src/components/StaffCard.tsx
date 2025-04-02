
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
    
    // Add a timestamp to bust cache
    const url = new URL(avatar);
    if (!url.searchParams.has('t')) {
      url.searchParams.set('t', Date.now().toString());
    }
    return url.toString();
  }, [avatar, imageError]);
  
  return (
    <div className="cyber-panel rounded-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden cyber-border">
            <Avatar className="w-full h-full">
              <AvatarImage 
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => {
                  console.log("Image failed to load:", avatar);
                  setImageError(true);
                }}
              />
              <AvatarFallback className="bg-cyber-darkpurple text-cyber-cyan">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
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
            <div>
              <p className="text-sm text-cyber-cyan">{role}</p>
              {rank && <p className="text-xs text-cyber-yellow">{rank}</p>}
            </div>
            <p className="text-sm">
              Score: <span className="text-cyber-cyan font-bold">
                {role === 'Manager' || role === 'Owner' ? 'Immeasurable' : overallScore.toFixed(1)}
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
