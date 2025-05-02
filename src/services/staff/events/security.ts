
import { supabase } from '@/integrations/supabase/client';

/**
 * Verify an API token is valid
 */
export const verifyApiToken = async (token: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('api_tokens')
      .select('is_active')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      console.error('Error verifying API token:', error);
      return false;
    }

    // Update the last used time
    await supabase
      .from('api_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', token);

    return true;
  } catch (err) {
    console.error('Exception verifying API token:', err);
    return false;
  }
};

/**
 * Create a new API token
 */
export const createApiToken = async (name: string, source: string): Promise<string | null> => {
  try {
    // Generate a secure random token
    const tokenBytes = new Uint8Array(32);
    window.crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const { data, error } = await supabase
      .from('api_tokens')
      .insert({
        name,
        source,
        token,
        is_active: true
      })
      .select('token')
      .single();

    if (error) {
      console.error('Error creating API token:', error);
      return null;
    }

    return data.token;
  } catch (err) {
    console.error('Exception creating API token:', err);
    return null;
  }
};
