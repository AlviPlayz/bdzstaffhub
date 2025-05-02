
import { supabase } from '@/integrations/supabase/client';
import { ScoreEvent, ScoreEventRequest } from './types';
import { getActionWeight } from './actionWeights';
import { toast } from '@/hooks/use-toast';

/**
 * Create a new score event in the database
 */
export const createScoreEvent = async (request: ScoreEventRequest): Promise<ScoreEvent | null> => {
  try {
    // Get weight for this action
    const weight = await getActionWeight(request.action);
    
    if (!weight) {
      console.error(`No weight found for action: ${request.action}`);
      return null;
    }

    const scoreEvent: ScoreEvent = {
      staff_id: request.staffId,
      action: request.action,
      points: weight,
      source: request.source,
      metadata: request.metadata || {}
    };

    const { data, error } = await supabase
      .from('score_events')
      .insert(scoreEvent)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating score event:', error);
      toast({
        title: "Error",
        description: `Failed to record score event: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }

    console.log('Score event created:', data);
    return data as ScoreEvent;
  } catch (err) {
    console.error('Exception creating score event:', err);
    return null;
  }
};

/**
 * Get all score events for a staff member
 */
export const getStaffScoreEvents = async (staffId: string): Promise<ScoreEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('score_events')
      .select('*')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching score events:', error);
      return [];
    }

    return data as ScoreEvent[];
  } catch (err) {
    console.error('Exception fetching score events:', err);
    return [];
  }
};
