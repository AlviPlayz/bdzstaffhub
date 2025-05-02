
import { supabase } from '@/integrations/supabase/client';
import { ScoreEvent } from './types';

/**
 * Subscribe to real-time score events
 * @param callback Function to call when a new score event is received
 * @returns Unsubscribe function
 */
export const subscribeToScoreEvents = (callback: (event: ScoreEvent) => void): () => void => {
  const channel = supabase
    .channel('public:score_events')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'score_events' 
    }, (payload) => {
      console.log('New score event received:', payload);
      callback(payload.new as ScoreEvent);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
