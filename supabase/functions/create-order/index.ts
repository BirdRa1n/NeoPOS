import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
}

interface CreateOrderRequest {
  store_id: string;
  type: 'delivery' | 'pickup';
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'meal_voucher' | 'other';
  items: OrderItem[];
  customer: {
    name: string;
    phone: string;
  };
  delivery?: {
    zone_id: string;
    address: string;
    complement?: string;
    reference?: string;
    latitude?: number;
    longitude?: number;
  };
  change_for?: number;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    );

    const body: CreateOrderRequest = await req.json();

    if (!body.store_id || !body.items?.length) {
      return new Response(
        JSON.stringify({ error: 'store_id e items são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.type === 'delivery' && !body.delivery?.zone_id) {
      return new Response(
        JSON.stringify({ error: 'delivery.zone_id é obrigatório para entregas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let customerId: string | null = null;
    if (body.customer.phone) {
      const { data: existingCustomer } = await supabase
        .schema('core')
        .from('customers')
        .select('id')
        .eq('store_id', body.store_id)
        .eq('phone', body.customer.phone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer } = await supabase
          .schema('core')
          .from('customers')
          .insert({
            store_id: body.store_id,
            name: body.customer.name,
            phone: body.customer.phone,
            address: body.delivery?.address,
            complement: body.delivery?.complement,
            latitude: body.delivery?.latitude,
            longitude: body.delivery?.longitude,
          })
          .select('id')
          .single();

        customerId = newCustomer?.id || null;
      }
    }

    let deliveryFee = 0;
    let deliveryZoneId: string | null = null;
    let deliveryNeighborhood: string | null = null;

    if (body.type === 'delivery' && body.delivery?.zone_id) {
      const { data: zone } = await supabase
        .schema('core')
        .from('delivery_zones')
        .select('id, neighborhood, delivery_fee')
        .eq('id', body.delivery.zone_id)
        .single();

      if (zone) {
        deliveryFee = Number(zone.delivery_fee);
        deliveryZoneId = zone.id;
        deliveryNeighborhood = zone.neighborhood;
      }
    }

    const subtotal = body.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const total = subtotal + deliveryFee;

    const { data: order, error: orderError } = await supabase
      .schema('orders')
      .from('orders')
      .insert({
        store_id: body.store_id,
        customer_id: customerId,
        type: body.type,
        status: 'pending',
        payment_method: body.payment_method,
        change_for: body.change_for,
        delivery_address: body.delivery?.address,
        delivery_complement: body.delivery?.complement,
        delivery_zone_id: deliveryZoneId,
        delivery_neighborhood_snapshot: deliveryNeighborhood,
        delivery_latitude: body.delivery?.latitude,
        delivery_longitude: body.delivery?.longitude,
        delivery_fee: deliveryFee,
        subtotal,
        total,
        notes: body.notes,
      })
      .select('id, order_number')
      .single();

    if (orderError) throw orderError;

    const orderItems = body.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      subtotal: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .schema('orders')
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          total,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
