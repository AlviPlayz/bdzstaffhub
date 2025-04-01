
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStaffMemberById } from '@/services/supabaseService';
import { StaffMember } from '@/types/staff';
import StaffCard from '@/components/StaffCard';
import PerformanceBar from '@/components/PerformanceBar';
import LoadingState from '@/components/LoadingState';
import { ArrowLeft } from 'lucide-react';

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        if (!id) {
          setError('No staff ID provided');
          setLoading(false);
          return;
        }

        const staffData = await getStaffMemberById(id);
        
        if (staffData) {
          setStaff(staffData);
        } else {
          setError('Staff member not found');
        }
      } catch (err) {
        console.error('Error fetching staff details:', err);
        setError('Failed to load staff details');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <LoadingState message="Loading staff details..." />;
  }

  if (error || !staff) {
    return (
      <div className="container mx-auto p-4 min-h-screen">
        <div className="cyber-panel p-8 text-center">
          <h1 className="text-2xl text-red-500 mb-4">Error</h1>
          <p className="text-white mb-6">{error || 'Staff member not found'}</p>
          <button 
            onClick={handleGoBack} 
            className="cyber-button flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <button 
        onClick={handleGoBack} 
        className="cyber-button mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      
      <h1 className="text-3xl cyber-text-glow font-digital text-white mb-6">Staff Details</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Staff basic info */}
          <div className="cyber-panel mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden cyber-border">
                  <img 
                    src={staff.avatar || '/placeholder.svg'} 
                    alt={staff.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-digital text-white">{staff.name}</h2>
                <p className="text-cyber-cyan">{staff.role}</p>
                <div className="mt-2 flex items-center">
                  <span className="mr-2">Overall Grade:</span>
                  <span className={`letter-grade text-lg ${staff.role === 'Manager' || staff.role === 'Owner' ? 'grade-sss' : ''}`}>
                    {staff.role === 'Manager' || staff.role === 'Owner' ? 'SSS+' : staff.overallGrade}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="mr-2">Score:</span>
                  <span className="text-cyber-cyan font-bold">
                    {staff.role === 'Manager' || staff.role === 'Owner' ? 'Immeasurable' : staff.overallScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="cyber-panel">
            <h2 className="text-xl font-digital text-cyber-cyan mb-4">Performance Metrics</h2>
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
              {Object.entries(staff.metrics).map(([key, metric]) => (
                <PerformanceBar key={key} metric={metric} staffRole={staff.role} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="cyber-panel">
          <h2 className="text-xl font-digital text-cyber-cyan mb-4">Performance History</h2>
          <div className="p-4 bg-cyber-darkpurple/50 rounded">
            <p className="text-white">Performance history data will be implemented in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailPage;
