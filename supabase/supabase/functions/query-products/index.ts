import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QueryRequest {
  query: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!openAiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    // Initialize OpenAI
    const openai = new OpenAIApi(new Configuration({
      apiKey: openAiKey,
    }))

    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { query } = await req.json() as QueryRequest

    // Generate embedding for the query
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: query,
    })
    const embedding = embeddingResponse.data.data[0].embedding

    // Search for similar products
    const { data: products, error: searchError } = await supabase.rpc(
      'match_products',
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5,
      }
    )

    if (searchError) throw searchError

    // Generate response using GPT
    const prompt = `
      Based on the following product data, answer this question: "${query}"
      
      Products:
      ${products.map(p => `- ${p.name} from ${p.supplier_name} at $${p.price}`).join('\n')}
      
      Please provide a clear and concise answer focusing on the relevant product information.
      If asked about lowest prices, mention the supplier and exact price.
      If no relevant products are found, politely state that.
    `.trim()

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides information about products and their prices.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const response = completion.data.choices[0].message?.content || 'Sorry, I could not process your request.'

    return new Response(
      JSON.stringify({ response }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})