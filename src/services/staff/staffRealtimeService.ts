
import { supabase } from '@/integrations/supabase/client';

// Function to subscribe to real-time updates
export const subscribeToRealTimeUpdates = (table: string, callback: () => void) => {
  console.log(`subscribeToRealTimeUpdates: Setting up subscription for table ${table}`);
  
  const channel = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      console.log(`Real-time update received for ${table}:`, payload.eventType);
      callback();
    })
    .subscribe();

  return () => {
    console.log(`Removing subscription for table ${table}`);
    supabase.removeChannel(channel);
  };
};
