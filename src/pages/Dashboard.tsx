
import React from 'react';
import { useStaff } from '@/contexts/StaffContext';
import StaffCard from '@/components/StaffCard';
import { BarChart3, Shield, Hammer, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingState from '@/components/LoadingState';

const Dashboard: React.FC = () => {
  const { moderators, builders, managers, loading, error } = useStaff();
  
  // Get top performers from each category
  const topModerator = [...moderators].sort((a, b) => b.overallScore - a.overallScore)[0];
  const topBuilder = [...builders].sort((a, b) => b.overallScore - a.overallScore)[0];
  
  // Sort managers by role first (Owner at top), then by overall score
  const sortedManagers = [...managers].sort((a, b) => {
    // Owner always comes first
    if (a.role === 'Owner' && b.role !== 'Owner') return -1;
    if (a.role !== 'Owner' && b.role === 'Owner') return 1;
    
    // Then sort by overall score
    return b.overallScore - a.overallScore;
  });
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-digital text-white mb-2">
            <span className="text-cyber-cyan cyber-text-glow">BDZ</span> STAFF DASHBOARD
          </h1>
          <p className="text-white/60 font-cyber">Real-time performance metrics and staff rankings</p>
        </div>
        <LoadingState />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-digital text-white mb-2">
            <span className="text-cyber-cyan cyber-text-glow">BDZ</span> STAFF DASHBOARD
          </h1>
          <p className="text-white/60 font-cyber">Real-time performance metrics and staff rankings</p>
        </div>
        <div className="cyber-panel text-center py-12">
          <p className="text-red-500 font-digital text-xl mb-2">DATABASE CONNECTION ERROR</p>
          <p className="text-white/60 font-cyber">Failed to load staff data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-digital text-white mb-2">
          <span className="text-cyber-cyan cyber-text-glow">BDZ</span> STAFF DASHBOARD
        </h1>
        <p className="text-white/60 font-cyber">Real-time performance metrics and staff rankings</p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="cyber-panel flex items-center">
          <div className="bg-cyber-purple/30 p-3 rounded-lg mr-4">
            <Shield size={24} className="text-cyber-cyan" />
          </div>
          <div>
            <h3 className="text-sm text-white/60 font-cyber">Moderators</h3>
            <p className="text-2xl font-digital text-white">{moderators.length}</p>
          </div>
        </div>
        
        <div className="cyber-panel flex items-center">
          <div className="bg-cyber-purple/30 p-3 rounded-lg mr-4">
            <Hammer size={24} className="text-cyber-cyan" />
          </div>
          <div>
            <h3 className="text-sm text-white/60 font-cyber">Builders</h3>
            <p className="text-2xl font-digital text-white">{builders.length}</p>
          </div>
        </div>
        
        <div className="cyber-panel flex items-center">
          <div className="bg-cyber-purple/30 p-3 rounded-lg mr-4">
            <Trophy size={24} className="text-cyber-cyan" />
          </div>
          <div>
            <h3 className="text-sm text-white/60 font-cyber">Leadership</h3>
            <p className="text-2xl font-digital text-white">{managers.length}</p>
          </div>
        </div>
      </div>
      
      {/* Leadership Section (Owner + Managers) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Trophy size={20} className="text-cyber-cyan mr-2" />
            <h2 className="text-xl font-digital text-white">Leadership Overview</h2>
          </div>
          <Link to="/managers" className="cyber-button text-sm py-1 px-3 rounded">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedManagers.map(manager => (
            <StaffCard key={manager.id} staff={manager} />
          ))}
        </div>
      </div>
      
      {/* Top Performers */}
      <div className="mb-10">
        <div className="flex items-center mb-6">
          <BarChart3 size={20} className="text-cyber-cyan mr-2" />
          <h2 className="text-xl font-digital text-white">Top Performers</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topModerator && (
            <div>
              <div className="flex items-center mb-3">
                <Shield size={16} className="text-cyber-cyan mr-2" />
                <h3 className="text-md font-cyber text-white">Top Moderator</h3>
              </div>
              <StaffCard staff={topModerator} compact />
            </div>
          )}
          
          {topBuilder && (
            <div>
              <div className="flex items-center mb-3">
                <Hammer size={16} className="text-cyber-cyan mr-2" />
                <h3 className="text-md font-cyber text-white">Top Builder</h3>
              </div>
              <StaffCard staff={topBuilder} compact />
            </div>
          )}
        </div>
      </div>
      
      {/* Recent activity - just for visual completeness */}
      <div>
        <div className="flex items-center mb-6">
          <div className="relative mr-2">
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse-glow"></div>
            <div className="absolute -inset-1 border border-cyber-cyan rounded-full opacity-50"></div>
          </div>
          <h2 className="text-xl font-digital text-white">Live System Status</h2>
        </div>
        
        <div className="cyber-panel">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-cyber-cyan/20">
              <span className="text-sm text-white/80 font-cyber">Database Sync</span>
              <span className="text-sm text-cyber-cyan font-digital">ONLINE</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-cyber-cyan/20">
              <span className="text-sm text-white/80 font-cyber">Last Update</span>
              <span className="text-sm text-cyber-cyan font-digital">JUST NOW</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-cyber-cyan/20">
              <span className="text-sm text-white/80 font-cyber">System Performance</span>
              <span className="text-sm text-cyber-cyan font-digital">100%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-white/80 font-cyber">Staff Data</span>
              <span className="text-sm text-cyber-cyan font-digital">REAL-TIME</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
