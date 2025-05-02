
import { supabase } from '@/integrations/supabase/client';

/**
 * Get the current score for a staff member from the events ledger
 */
export const getStaffScore = async (staffId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .rpc('calculate_staff_score', { staff_uuid: staffId });

    if (error) {
      console.error('Error calculating staff score:', error);
      return 0;
    }

    return data || 0;
  } catch (err) {
    console.error('Exception calculating staff score:', err);
    return 0;
  }
};
