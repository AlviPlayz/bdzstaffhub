
import { supabase } from '@/integrations/supabase/client';
import { ActionWeight } from './types';

/**
 * Get the weight for an action
 */
export const getActionWeight = async (action: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('action_weights')
      .select('weight')
      .eq('action', action)
      .maybeSingle();

    if (error) {
      console.error('Error fetching action weight:', error);
      return 0;
    }

    return data?.weight || 0;
  } catch (err) {
    console.error('Exception fetching action weight:', err);
    return 0;
  }
};

/**
 * Get all action weights
 */
export const getAllActionWeights = async (): Promise<ActionWeight[]> => {
  try {
    const { data, error } = await supabase
      .from('action_weights')
      .select('*')
      .order('action');

    if (error) {
      console.error('Error fetching action weights:', error);
      return [];
    }

    return data as ActionWeight[];
  } catch (err) {
    console.error('Exception fetching action weights:', err);
    return [];
  }
};

/**
 * Update or create an action weight
 */
export const upsertActionWeight = async (action: string, weight: number, description?: string): Promise<ActionWeight | null> => {
  try {
    const { data, error } = await supabase
      .from('action_weights')
      .upsert({
        action,
        weight,
        description,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating action weight:', error);
      return null;
    }

    return data as ActionWeight;
  } catch (err) {
    console.error('Exception updating action weight:', err);
    return null;
  }
};
