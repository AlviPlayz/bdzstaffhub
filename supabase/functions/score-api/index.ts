
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse request path and body
    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)

    // Handle different API endpoints
    if (path[1] === 'add' && req.method === 'POST') {
      return await handleAddScore(req, supabase)
    } else if (path[1] === 'log' && req.method === 'GET') {
      return await handleGetLog(req, supabase)
    }
    
    // Return 404 for invalid endpoints
    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { 
        status: 404, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})

async function handleAddScore(req: Request, supabase: any) {
  // Parse request
  const body = await req.json()
  const { staffId, action, source, metadata } = body
  
  if (!staffId || !action || !source) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: staffId, action, source" }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  // Verify API token
  const token = req.headers.get('authorization')?.split(' ')[1]
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: "API token is required" }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  const { data: tokenData } = await supabase
    .from('api_tokens')
    .select('is_active')
    .eq('token', token)
    .eq('is_active', true)
    .maybeSingle()
    
  if (!tokenData) {
    return new Response(
      JSON.stringify({ error: "Invalid or inactive API token" }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  // Get weight for this action
  const { data: actionData } = await supabase
    .from('action_weights')
    .select('weight')
    .eq('action', action)
    .maybeSingle()
    
  if (!actionData) {
    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  // Create score event
  const points = body.points || actionData.weight
  
  const { data: eventData, error: eventError } = await supabase
    .from('score_events')
    .insert({
      staff_id: staffId,
      action,
      points,
      source,
      metadata: metadata || {}
    })
    .select()
    .single()
    
  if (eventError) {
    return new Response(
      JSON.stringify({ error: `Failed to create score event: ${eventError.message}` }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  // Update the last used time for the token
  await supabase
    .from('api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token', token)
  
  // Return success
  return new Response(
    JSON.stringify({ 
      success: true,
      event: eventData
    }),
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      } 
    }
  )
}

async function handleGetLog(req: Request, supabase: any) {
  // Parse request
  const url = new URL(req.url)
  const staffId = url.searchParams.get('staffId')
  
  if (!staffId) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameter: staffId" }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  // Verify API token
  const token = req.headers.get('authorization')?.split(' ')[1]
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: "API token is required" }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  const { data: tokenData } = await supabase
    .from('api_tokens')
    .select('is_active')
    .eq('token', token)
    .eq('is_active', true)
    .maybeSingle()
    
  if (!tokenData) {
    return new Response(
      JSON.stringify({ error: "Invalid or inactive API token" }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  // Get events for this staff member
  const { data: events, error: eventsError } = await supabase
    .from('score_events')
    .select('*')
    .eq('staff_id', staffId)
    .order('created_at', { ascending: false })
    .limit(50)
    
  if (eventsError) {
    return new Response(
      JSON.stringify({ error: `Failed to get score events: ${eventsError.message}` }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
  
  // Update the last used time for the token
  await supabase
    .from('api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token', token)
  
  // Return events
  return new Response(
    JSON.stringify({ 
      success: true,
      events
    }),
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      } 
    }
  )
}
