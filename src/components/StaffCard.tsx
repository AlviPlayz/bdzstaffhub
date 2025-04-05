
import React, { useState, useEffect } from 'react';
import { StaffMember, ROLE_CONSTANTS } from '@/types/staff';
import { getGradeColorClass } from '@/utils/gradeUtils';
import { ArrowUpRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StaffCardProps {
  staff: StaffMember;
  compact?: boolean;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff, compact = false }) => {
  const { name, role, rank, avatar, overallScore, overallGrade } = staff;
  const [imageError, setImageError] = useState(false);
  
  // Check if the staff is an Owner for special styling
  const isOwner = role === 'Owner';
  const isManager = role === 'Manager';
  
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
    if (isOwner || isManager) {
      return 'Immeasurable';
    }
    return overallScore.toFixed(1);
  }, [role, overallScore, isOwner, isManager]);
  
  // Special handling for Manager/Owner grades - always show SSS+ for overall grade
  const displayGrade = React.useMemo(() => {
    if (isOwner || isManager) {
      return 'SSS+';
    }
    return overallGrade;
  }, [role, overallGrade, isOwner, isManager]);
  
  // Card style classes for Owner
  const cardClasses = React.useMemo(() => {
    let classes = "cyber-panel rounded-lg transition-all duration-300 hover:scale-[1.02]";
    
    if (isOwner) {
      classes += " border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.7)]";
    }
    
    return classes;
  }, [isOwner]);
  
  return (
    <div className={cardClasses}>
      <div className="flex items-center gap-4">
        <div className="relative">
          {isOwner && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-amber-400 animate-pulse">
                    <Crown size={18} className="fill-amber-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{ROLE_CONSTANTS.OWNER.TOOLTIP}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className={`w-16 h-16 rounded-md overflow-hidden cyber-border ${isOwner ? 'shadow-[0_0_10px_rgba(255,0,0,0.7)]' : ''}`}>
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
              <p className={`text-sm ${isOwner ? 'text-red-500 font-bold' : 'text-cyber-cyan'}`}>{role}</p>
              {rank && <p className={`text-xs ${isOwner ? 'text-red-400' : 'text-cyber-yellow'}`}>{rank}</p>}
            </div>
            <p className="text-sm">
              Score: <span className={`font-bold ${isOwner ? 'text-fuchsia-400' : 'text-cyber-cyan'}`}>
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
