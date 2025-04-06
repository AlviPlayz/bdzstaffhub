
import React, { useState, useEffect } from 'react';
import { format, subDays, isSaturday } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceBar from './PerformanceBar';
import { PerformanceMetric, StaffRole } from '@/types/staff';

interface HistoryEntry {
  date: Date;
  metrics: Record<string, PerformanceMetric>;
  overallGrade: string;
  overallScore: number | string;
  rank: string;
}

interface PerformanceHistoryProps {
  staffId: string;
  staffRole: StaffRole;
  staffRank?: string;
}

const PerformanceHistory: React.FC<PerformanceHistoryProps> = ({ staffId, staffRole, staffRank }) => {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>('current');
  
  const isManager = staffRole === 'Manager';
  const isOwner = isManager && staffRank === 'Owner';

  useEffect(() => {
    // Function to generate mock historical data
    // In a real app, this would fetch from an API or database
    const generateHistoricalData = () => {
      const today = new Date();
      const history: HistoryEntry[] = [];
      
      // Generate up to 10 weeks of history
      for (let i = 1; i <= 10; i++) {
        // Find the previous Saturday (weekly snapshot day)
        let historyDate = subDays(today, i * 7);
        while (!isSaturday(historyDate)) {
          historyDate = subDays(historyDate, 1);
        }
        
        // For managers, all metrics are immeasurable
        if (isManager) {
          const managerMetrics: Record<string, PerformanceMetric> = {
            responsiveness: createImmeasurableMetric('Responsiveness'),
            fairness: createImmeasurableMetric('Fairness'),
            communication: createImmeasurableMetric('Communication'),
            conflictResolution: createImmeasurableMetric('Conflict Resolution'),
            ruleEnforcement: createImmeasurableMetric('Rule Enforcement'),
            engagement: createImmeasurableMetric('Engagement'),
            supportiveness: createImmeasurableMetric('Supportiveness'),
            adaptability: createImmeasurableMetric('Adaptability'),
            objectivity: createImmeasurableMetric('Objectivity'),
            initiative: createImmeasurableMetric('Initiative'),
            exterior: createImmeasurableMetric('Exterior'),
            interior: createImmeasurableMetric('Interior'),
            decoration: createImmeasurableMetric('Decoration'),
            effort: createImmeasurableMetric('Effort'),
            contribution: createImmeasurableMetric('Contribution'),
            cooperativeness: createImmeasurableMetric('Cooperativeness'),
            creativity: createImmeasurableMetric('Creativity'),
            consistency: createImmeasurableMetric('Consistency')
          };
          
          history.push({
            date: historyDate,
            metrics: managerMetrics,
            overallGrade: 'SSS+',
            overallScore: 'Immeasurable',
            rank: staffRank || 'Manager'
          });
        } else {
          // For regular staff, generate slightly varying metrics over time
          const metrics: Record<string, PerformanceMetric> = {};
          const metricKeys = ['responsiveness', 'fairness', 'communication', 'effort']; 
          
          metricKeys.forEach(key => {
            // Random slight variations in historical scores
            const baseScore = 7.5 + (Math.random() * 2 - 1);
            metrics[key] = {
              id: key,
              name: key.charAt(0).toUpperCase() + key.slice(1),
              score: parseFloat(baseScore.toFixed(1)),
              letterGrade: calculateLetterGrade(baseScore)
            };
          });
          
          // Calculate overall score based on metrics
          const totalScore = Object.values(metrics).reduce((sum, metric) => sum + metric.score, 0);
          const averageScore = totalScore / Object.values(metrics).length;
          
          history.push({
            date: historyDate,
            metrics: metrics,
            overallGrade: calculateLetterGrade(averageScore),
            overallScore: parseFloat(averageScore.toFixed(1)),
            rank: staffRank || (staffRole === 'Moderator' ? 'Mod' : 'Builder')
          });
        }
      }
      
      return history;
    };
    
    setHistoryData(generateHistoricalData());
  }, [staffId, staffRole, isManager, isOwner, staffRank]);
  
  // Helper function to calculate letter grade
  function calculateLetterGrade(score: number): string {
    if (score >= 9.5) return 'S+';
    if (score >= 8.5) return 'S';
    if (score >= 7.5) return 'A+';
    if (score >= 6.5) return 'A';
    if (score >= 5.5) return 'B+';
    if (score >= 4.5) return 'B';
    if (score >= 3.5) return 'C';
    if (score >= 2.5) return 'D';
    if (score >= 1) return 'E';
    return 'E-';
  }
  
  // Helper to create immeasurable metrics for managers
  const createImmeasurableMetric = (name: string): PerformanceMetric => {
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      score: 10, // We'll give it a 10 score for calculation purposes
      letterGrade: 'SSS+'
    };
  };

  return (
    <div className="p-4 bg-cyber-darkpurple/50 rounded">
      {historyData.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex flex-wrap gap-2 bg-transparent">
            <TabsTrigger 
              value="current" 
              className="cyber-tab"
            >
              Current
            </TabsTrigger>
            
            {historyData.map((entry, index) => (
              <TabsTrigger 
                key={index} 
                value={`week-${index + 1}`}
                className="cyber-tab"
              >
                {index + 1} {index === 0 ? 'Week Ago' : 'Weeks Ago'}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="current" className="pt-4 border-t border-cyber-cyan/20">
            <p className="text-cyber-cyan mb-4">Current performance data is displayed in the Performance Metrics panel.</p>
          </TabsContent>
          
          {historyData.map((entry, index) => (
            <TabsContent 
              key={index} 
              value={`week-${index + 1}`}
              className="pt-4 border-t border-cyber-cyan/20"
            >
              <div className="mb-4">
                <h3 className="text-lg text-white mb-2">Performance Snapshot</h3>
                <p className="text-sm text-cyber-cyan mb-1">
                  Date: <span className="text-white">{format(entry.date, 'EEEE, d MMMM yyyy')}</span>
                </p>
                <p className="text-sm text-cyber-cyan mb-1">
                  Rank: <span className="text-white">{entry.rank}</span>
                </p>
                <p className="text-sm text-cyber-cyan mb-1">
                  Overall Grade: <span className={`text-white letter-grade ${isManager ? 'grade-sss' : ''}`}>{entry.overallGrade}</span>
                </p>
                <p className="text-sm text-cyber-cyan mb-4">
                  Overall Score: <span className="text-white">{entry.overallScore}</span>
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-cyber-cyan border-b border-cyber-cyan/30 pb-1 mb-2">Metric Breakdown</h4>
                {Object.entries(entry.metrics).map(([key, metric]) => (
                  <PerformanceBar key={key} metric={metric} staffRole={staffRole} staffRank={entry.rank} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p className="text-white text-center">No historical data available yet. Performance history will be updated weekly.</p>
      )}
    </div>
  );
};

export default PerformanceHistory;
