
import React, { useEffect, useState } from 'react';
import { LetterGrade, PerformanceMetric } from '@/types/staff';
import { getGradeColorClass } from '@/utils/gradeUtils';
import { motion } from 'framer-motion';

interface PerformanceBarProps {
  metric: PerformanceMetric;
  staffRole?: string;
  isOverallGrade?: boolean;
}

const PerformanceBar: React.FC<PerformanceBarProps> = ({ 
  metric, 
  staffRole,
  isOverallGrade = false 
}) => {
  const { name, score, letterGrade } = metric;
  const percentage = Math.min(Math.max(0, score * 10), 100); // Convert 0-10 score to 0-100 percentage
  const [isVisible, setIsVisible] = useState(false);
  
  // Special handling for Manager/Owner roles
  const isManagerOrOwner = staffRole === 'Manager' || staffRole === 'Owner';
  
  // For all grades for Manager/Owner, always display SSS+
  // (previously we used "Immeasurable" for category-level metrics, now use SSS+ everywhere)
  const displayGrade = isManagerOrOwner ? 'SSS+' : letterGrade;
  
  // Display score - similarly handle based on if overall or category
  const displayScore = isManagerOrOwner ? 'Immeasurable' : score.toFixed(1);
  
  // Add animation delay effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-digital text-cyber-cyan cyber-text-glow">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{displayScore}</span>
          <span className={`${getGradeColorClass(displayGrade)} letter-grade`}>
            {displayGrade}
          </span>
        </div>
      </div>
      <div className="neon-progress-bg">
        <motion.div 
          className="neon-progress-bar" 
          initial={{ width: 0 }}
          animate={{ width: isVisible ? (isManagerOrOwner ? '100%' : `${percentage}%`) : 0 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            delay: 0.1
          }}
        />
      </div>
    </div>
  );
};

export default PerformanceBar;
