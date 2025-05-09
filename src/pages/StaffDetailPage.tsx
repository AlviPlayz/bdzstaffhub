
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStaffMemberById, getStaffScore } from '@/services/staff';
import { StaffMember } from '@/types/staff';
import StaffCard from '@/components/StaffCard';
import PerformanceBar from '@/components/PerformanceBar';
import LoadingState from '@/components/LoadingState';
import { ArrowLeft, BarChart, Activity } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScoreEvent } from '@/services/staff/events/types';
import ScoreEventsList from '@/components/staff/ScoreEventsList';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StaffDetailPage: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [scoreEvents, setScoreEvents] = useState<ScoreEvent[]>([]);
  const [activeTab, setActiveTab] = useState<string>('metrics');
  const [dynamicScore, setDynamicScore] = useState<number>(0);

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
          
          // Fetch dynamic score
          if (staffData.role !== 'Manager' && staffData.role !== 'Owner') {
            const score = await getStaffScore(id);
            setDynamicScore(score);
          }
          
          // Fetch score events
          fetchScoreEvents(id);
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
    
    // Set up realtime subscription for score events
    const channel = supabase
      .channel('public:score_events')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'score_events',
        filter: `staff_id=eq.${id}`
      }, (payload) => {
        console.log('New score event received:', payload);
        setScoreEvents(prev => [payload.new as ScoreEvent, ...prev]);
        
        // Update dynamic score
        if (staff?.role !== 'Manager' && staff?.role !== 'Owner') {
          getStaffScore(id!).then(score => setDynamicScore(score));
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);
  
  const fetchScoreEvents = async (staffId: string) => {
    try {
      const { data, error } = await supabase
        .from('score_events')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching score events:', error);
        return;
      }
      
      setScoreEvents(data as ScoreEvent[]);
    } catch (err) {
      console.error('Exception fetching score events:', err);
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  // Add cache-busting parameter to avatar URL if it's not the placeholder
  const getAvatarUrl = (avatarUrl: string) => {
    if (!avatarUrl || avatarUrl === '/placeholder.svg' || imageError) {
      return '/placeholder.svg';
    }

    // Add a timestamp to bust cache
    try {
      const url = new URL(avatarUrl);
      if (!url.searchParams.has('t')) {
        url.searchParams.set('t', Date.now().toString());
      }
      return url.toString();
    } catch (e) {
      return avatarUrl;
    }
  };

  if (loading) {
    return <LoadingState message="Loading staff details..." />;
  }

  if (error || !staff) {
    return <div className="container mx-auto p-4 min-h-screen">
        <div className="cyber-panel p-8 text-center">
          <h1 className="text-2xl text-red-500 mb-4">Error</h1>
          <p className="text-white mb-6">{error || 'Staff member not found'}</p>
          <button onClick={handleGoBack} className="cyber-button flex items-center gap-2 mx-auto">
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>;
  }

  // Check if the staff is a Manager (Owner) for special styling
  const isOwner = staff.role === 'Owner' || (staff.role === 'Manager' && staff.rank === 'Owner');
  const isManager = staff.role === 'Manager' || staff.role === 'Owner';

  // Display values for managers
  const displayScore = isManager ? 'Immeasurable' : dynamicScore.toFixed(1);
  const displayGrade = isManager ? 'SSS+' : staff.overallGrade;

  return <div className="container mx-auto p-4 min-h-screen">
      <button onClick={handleGoBack} className="cyber-button mb-4 flex items-center gap-2">
        <ArrowLeft size={16} />
        Back
      </button>
      
      <h1 className="text-3xl cyber-text-glow font-digital text-white mb-6">Staff Details</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          {/* Staff basic info */}
          <div className={`cyber-panel mb-6 ${isOwner ? 'border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.7)]' : ''}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {isOwner && <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-amber-400 animate-pulse z-10" title="Owner">
                    👑
                  </div>}
                <div className={`w-20 h-20 rounded-md overflow-hidden cyber-border ${isOwner ? 'shadow-[0_0_10px_rgba(255,0,0,0.7)]' : ''}`}>
                  <Avatar className="w-full h-full">
                    <AvatarImage src={getAvatarUrl(staff.avatar)} alt={staff.name} className="w-full h-full object-cover" onError={() => setImageError(true)} />
                    <AvatarFallback className="bg-cyber-darkpurple text-cyber-cyan">
                      {getInitials(staff.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-digital text-white">{staff.name}</h2>
                <div className="flex items-center gap-2">
                  <p className={`${isOwner ? 'text-red-500 font-bold' : 'text-cyber-cyan'}`}>
                    {staff.role}{isOwner ? ' (Owner)' : ''}
                  </p>
                  {!isOwner && staff.rank && <span className={`text-sm ${isManager ? 'text-red-400' : 'text-cyber-yellow'}`}>({staff.rank})</span>}
                </div>
                <div className="mt-2 flex items-center">
                  <span className="mr-2">Overall Grade:</span>
                  <span className={`letter-grade text-lg ${isManager ? 'grade-sss' : ''}`}>
                    {displayGrade}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="mr-2">Score:</span>
                  <span className="text-cyber-cyan font-bold">
                    {displayScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Tabs */}
          <div className="cyber-panel">
            <Tabs defaultValue="metrics" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="metrics" className="flex items-center gap-2 text-base">
                  <BarChart size={16} /> Performance Metrics
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2 text-base">
                  <Activity size={16} /> Activity Log
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="metrics">
                <h2 className="text-xl font-digital text-cyber-cyan mb-4">Performance Metrics</h2>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                  {Object.entries(staff.metrics).map(([key, metric]) => (
                    <PerformanceBar key={key} metric={metric} staffRole={staff.role} staffRank={staff.rank} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <h2 className="text-xl font-digital text-cyber-cyan mb-4">Activity Log</h2>
                <ScoreEventsList events={scoreEvents} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>;
};

export default StaffDetailPage;
