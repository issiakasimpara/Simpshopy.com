import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestRequest {
  apiKey: string;
  serverName: string;
  fromEmail: string;
  fromName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { apiKey, serverName, fromEmail, fromName }: TestRequest = await req.json();

    if (!apiKey || !serverName) {
      return new Response(
        JSON.stringify({ error: 'API Key and Server Name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Envoyer un email de test via Mailzeet
    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Mailzeet - Simpshopy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Test Mailzeet réussi !</h1>
            <p>Configuration Simpshopy + Mailzeet</p>
          </div>
          
          <div class="content">
            <div class="success">
              <h3>🎉 Félicitations !</h3>
              <p>Votre configuration Mailzeet fonctionne parfaitement avec Simpshopy.</p>
            </div>
            
            <p><strong>Détails du test :</strong></p>
            <ul>
              <li>Serveur SMTP : ${serverName}</li>
              <li>Email expéditeur : ${fromEmail}</li>
              <li>Nom expéditeur : ${fromName}</li>
              <li>Date du test : ${new Date().toLocaleString('fr-FR')}</li>
            </ul>
            
            <p>Vous pouvez maintenant utiliser Mailzeet pour envoyer des emails transactionnels depuis Simpshopy.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch('https://api.mailzeet.com/v1/mails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    body: JSON.stringify({
      sender: {
        email: fromEmail,
        name: fromName
      },
      recipients: [{
        email: fromEmail, // Envoyer à soi-même pour le test
        name: 'Test'
      }],
      subject: '✅ Test Mailzeet - Configuration {{company}}',
      html: testEmailHtml,
      params: {
        company: 'Simpshopy',
        test_date: new Date().toLocaleString('fr-FR'),
        server_name: serverName
      },
      server: serverName
    }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Mailzeet API Error: ${errorData}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Test Mailzeet error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
