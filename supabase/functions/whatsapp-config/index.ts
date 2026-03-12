import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  console.log("===== NEW REQUEST =====")
  console.log("Method:", req.method)
  console.log("URL:", req.url)

  if (req.method === 'OPTIONS') {
    console.log("CORS preflight")
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const authHeader = req.headers.get('Authorization')
    console.log("Authorization header:", authHeader ? "present" : "missing")

    if (!authHeader) {
      console.warn("Unauthorized: missing Authorization header")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) console.error("Auth error:", authError)
    if (!user) {
      console.warn("Unauthorized: user not found")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    console.log("Authenticated user:", user.id)

    const { data: storeRow, error: storeError } = await supabase
      .schema('core')
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (storeError) console.error("Store query error:", storeError)

    const storeId = storeRow?.id
    if (!storeId) {
      console.warn("Store not found for user:", user.id)
      return new Response(JSON.stringify({ error: 'Store not found' }), { status: 404, headers: corsHeaders })
    }

    console.log("Store found:", storeId)

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'get'
    console.log("Action:", action)

    if (req.method === 'GET' || action === 'get') {
      console.log("Fetching whatsapp config")
      const { data: config, error } = await supabase
        .schema('integrations')
        .from('whatsapp_config')
        .select('*')
        .eq('store_id', storeId)
        .single()

      if (error) console.error("Config fetch error:", error)
      console.log("Config result:", config)

      return new Response(
        JSON.stringify({ config: config || null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    console.log("Request body:", body)

    if (action === 'save') {
      console.log("Saving config")
      const { api_key, instance_name, evolution_url, send_on_pending, send_on_confirmed, send_on_preparing, send_on_out_for_delivery, send_on_delivered, send_on_cancelled } = body

      if (!api_key || !instance_name) {
        console.warn("Missing required fields")
        return new Response(JSON.stringify({ error: 'api_key e instance_name são obrigatórios' }), { status: 400, headers: corsHeaders })
      }

      const upsertData = {
        store_id: storeId,
        api_key,
        instance_name,
        evolution_url: evolution_url || 'https://evolutionapi.birdra1n.com',
        send_on_pending: send_on_pending ?? false,
        send_on_confirmed: send_on_confirmed ?? true,
        send_on_preparing: send_on_preparing ?? true,
        send_on_out_for_delivery: send_on_out_for_delivery ?? true,
        send_on_delivered: send_on_delivered ?? true,
        send_on_cancelled: send_on_cancelled ?? true,
        updated_at: new Date().toISOString(),
      }

      const { data: existing } = await supabase.schema('integrations').from('whatsapp_config').select('id').eq('store_id', storeId).single()

      let result
      if (existing) {
        result = await supabase.schema('integrations').from('whatsapp_config').update(upsertData).eq('store_id', storeId).select().single()
      } else {
        result = await supabase.schema('integrations').from('whatsapp_config').insert(upsertData).select().single()
      }

      if (result.error) {
        console.error("Save error:", result.error)
        return new Response(JSON.stringify({ error: result.error.message }), { status: 500, headers: corsHeaders })
      }

      return new Response(JSON.stringify({ success: true, config: result.data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'connect') {
      console.log("Connecting instance")
      const { data: config } = await supabase.schema('integrations').from('whatsapp_config').select('*').eq('store_id', storeId).single()

      if (!config) {
        return new Response(JSON.stringify({ error: 'Salve a configuração primeiro' }), { status: 400, headers: corsHeaders })
      }

      try {
        const evoRes = await fetch(`${config.evolution_url}/instance/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': config.api_key },
          body: JSON.stringify({ instanceName: config.instance_name, qrcode: true, integration: 'WHATSAPP-BAILEYS' }),
        })

        const evoData = await evoRes.json()
        await supabase.schema('integrations').from('whatsapp_config').update({ instance_status: 'connecting' }).eq('store_id', storeId)

        return new Response(JSON.stringify({ success: true, data: evoData }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      } catch (err) {
        console.error("Connect error:", err)
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
      }
    }

    if (action === 'qrcode') {
      console.log("Getting QR code")
      const { data: config } = await supabase.schema('integrations').from('whatsapp_config').select('*').eq('store_id', storeId).single()

      if (!config) {
        return new Response(JSON.stringify({ error: 'Configuração não encontrada' }), { status: 404, headers: corsHeaders })
      }

      try {
        const evoRes = await fetch(`${config.evolution_url}/instance/connect/${config.instance_name}`, {
          method: 'GET',
          headers: { 'apikey': config.api_key },
        })

        const evoData = await evoRes.json()
        console.log("Evolution QR response:", evoData)

        return new Response(JSON.stringify(evoData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      } catch (err) {
        console.error("QR code error:", err)
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
      }
    }

    if (action === 'status') {
      console.log("Checking status")
      const { data: config } = await supabase.schema('integrations').from('whatsapp_config').select('*').eq('store_id', storeId).single()

      if (!config) {
        return new Response(JSON.stringify({ error: 'Configuração não encontrada' }), { status: 404, headers: corsHeaders })
      }

      try {
        const evoRes = await fetch(`${config.evolution_url}/instance/connectionState/${config.instance_name}`, {
          method: 'GET',
          headers: { 'apikey': config.api_key },
        })

        const evoData = await evoRes.json()
        const connected = evoData?.instance?.state === 'open'
        
        await supabase.schema('integrations').from('whatsapp_config').update({ instance_status: connected ? 'connected' : 'disconnected' }).eq('store_id', storeId)

        return new Response(JSON.stringify(evoData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      } catch (err) {
        console.error("Status check error:", err)
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
      }
    }

    return new Response(JSON.stringify({ error: 'Action inválida' }), { status: 400, headers: corsHeaders })

  } catch (err) {
    console.error("Unexpected error:", err)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: corsHeaders })
  }
})
