import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeFrame = '24h' } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate time range
    let timeFilter = new Date();
    switch (timeFrame) {
      case '1h':
        timeFilter.setHours(timeFilter.getHours() - 1);
        break;
      case '24h':
        timeFilter.setHours(timeFilter.getHours() - 24);
        break;
      case '7d':
        timeFilter.setDate(timeFilter.getDate() - 7);
        break;
      case '30d':
        timeFilter.setDate(timeFilter.getDate() - 30);
        break;
      case 'all':
        timeFilter = new Date(0); // Beginning of time
        break;
    }

    // Fetch sensor readings for analysis
    let query = supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false });

    if (timeFrame !== 'all') {
      query = query.gte('created_at', timeFilter.toISOString());
    }

    const { data: readings, error: dbError } = await query.limit(1000);

    if (dbError) throw dbError;

    if (!readings || readings.length < 10) {
      return new Response(
        JSON.stringify({ anomalies: [], message: 'Insufficient data for analysis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate statistics
    const temps = readings.map(r => Number(r.temperature));
    const hums = readings.map(r => Number(r.humidity));
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgHum = hums.reduce((a, b) => a + b, 0) / hums.length;
    const stdTemp = Math.sqrt(temps.reduce((sq, n) => sq + Math.pow(n - avgTemp, 2), 0) / temps.length);
    const stdHum = Math.sqrt(hums.reduce((sq, n) => sq + Math.pow(n - avgHum, 2), 0) / hums.length);

    // Prepare data summary for AI
    const timeFrameLabel = timeFrame === '1h' ? 'last hour' : 
                          timeFrame === '24h' ? 'last 24 hours' : 
                          timeFrame === '7d' ? 'last 7 days' : 
                          timeFrame === '30d' ? 'last 30 days' : 'all time';
    
    const dataSummary = `
Sensor data analysis for ${timeFrameLabel}:
- Temperature: avg=${avgTemp.toFixed(1)}°C, std=${stdTemp.toFixed(1)}°C, range=${Math.min(...temps).toFixed(1)}-${Math.max(...temps).toFixed(1)}°C
- Humidity: avg=${avgHum.toFixed(1)}%, std=${stdHum.toFixed(1)}%, range=${Math.min(...hums).toFixed(1)}-${Math.max(...hums).toFixed(1)}%
- Total readings analyzed: ${readings.length}
- Recent readings: ${readings.slice(0, 5).map(r => `${r.temperature}°C/${r.humidity}%`).join(', ')}
- Fan usage patterns: ${readings.filter(r => r.fan_state === 'ON').length}/${readings.length} readings with fan ON
- Motion events: ${readings.filter(r => r.motion_state === 'DETECTED').length}/${readings.length} readings with motion
`;

    // Call Lovable AI for anomaly detection
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a smart home anomaly detection expert. Analyze sensor data and identify unusual patterns, potential issues, or recommendations. Return ONLY a JSON object with this structure:
{
  "anomalies": [
    {"type": "warning|error|info", "title": "Brief title", "description": "Detailed description", "recommendation": "What to do"}
  ],
  "insights": ["Key insight 1", "Key insight 2"]
}`
          },
          {
            role: 'user',
            content: dataSummary
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices[0].message.content;
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const result = JSON.parse(content);

    return new Response(
      JSON.stringify({
        anomalies: result.anomalies || [],
        insights: result.insights || [],
        statistics: {
          avgTemp: avgTemp.toFixed(1),
          avgHum: avgHum.toFixed(1),
          dataPoints: readings.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in anomaly detection:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
