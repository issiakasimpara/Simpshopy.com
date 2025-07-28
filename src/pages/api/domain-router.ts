import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hostname = searchParams.get('hostname');

  if (!hostname) {
    return NextResponse.json(
      { error: 'Hostname parameter required' },
      { status: 400 }
    );
  }

  try {
    console.log(`Looking up domain: ${hostname}`);

    // Check if this is a custom domain
    const { data: customDomain, error: domainError } = await supabase
      .from('custom_domains')
      .select(`
        id,
        custom_domain,
        verified,
        ssl_enabled,
        store_id,
        stores (
          id,
          name,
          description,
          logo_url,
          settings,
          status
        )
      `)
      .eq('custom_domain', hostname)
      .eq('verified', true)
      .single();

    if (domainError || !customDomain) {
      // Check if this is the main domain or a subdomain
      if (hostname.includes('simpshopy.com') || hostname.includes('localhost')) {
        return NextResponse.json({
          isMainDomain: true,
          hostname,
          message: 'Main application domain',
        });
      }

      return NextResponse.json({
        error: 'Domain not found or not verified',
        hostname,
        suggestion: 'Please verify your domain configuration',
      }, { status: 404 });
    }

    // Get store products and additional data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        images,
        status,
        category_id,
        categories (
          id,
          name,
          description
        )
      `)
      .eq('store_id', customDomain.store_id)
      .eq('status', 'active');

    // Get site template for the store (latest published version)
    const { data: siteTemplate, error: templateError } = await supabase
      .from('site_templates')
      .select('template_data, is_published, updated_at')
      .eq('store_id', customDomain.store_id)
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const storeData = {
      domain: customDomain,
      store: customDomain.stores,
      products: products || [],
      siteTemplate: siteTemplate?.template_data || null,
      metadata: {
        totalProducts: products?.length || 0,
        storeActive: customDomain.stores?.status === 'active',
        sslEnabled: customDomain.ssl_enabled,
        lastUpdated: new Date().toISOString(),
      },
    };

    return NextResponse.json(storeData);

  } catch (error) {
    console.error('Domain router error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { hostname } = body;

  if (!hostname) {
    return NextResponse.json(
      { error: 'Hostname parameter required' },
      { status: 400 }
    );
  }

  // Same logic as GET
  return GET(request);
} 