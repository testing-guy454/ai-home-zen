import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { temperature, humidity } = await req.json();
    console.log('Processing AI fan control:', { temperature, humidity });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Call Lovable AI (Gemini) to determine optimal fan speed using tool calling
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a smart home automation AI. Based on temperature and humidity, determine optimal fan speed (0-100%). Consider comfort levels: ideal temp is 22-26°C, ideal humidity is 40-60%. Higher values require higher fan speed.'
          },
          {
            role: 'user',
            content: `Current conditions: Temperature ${temperature}°C, Humidity ${humidity}%. What fan speed should I use?`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'set_fan_speed',
              description: 'Set the optimal fan speed based on environmental conditions',
              parameters: {
                type: 'object',
                properties: {
                  fanSpeed: {
                    type: 'number',
                    description: 'Optimal fan speed percentage (0-100)'
                  },
                  reason: {
                    type: 'string',
                    description: 'Explanation for the chosen fan speed'
                  }
                },
                required: ['fanSpeed', 'reason'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'set_fan_speed' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall || !toolCall.function.arguments) {
      throw new Error('No tool call response from AI');
    }

    const aiResponse = JSON.parse(toolCall.function.arguments);
    console.log('AI recommendation:', aiResponse);

    return new Response(
      JSON.stringify({
        fanSpeed: aiResponse.fanSpeed,
        reason: aiResponse.reason
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-fan-control:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
