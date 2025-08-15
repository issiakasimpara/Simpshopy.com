import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const MailchimpCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Traitement du callback Mailchimp...')
        
        // Récupérer les paramètres de l'URL
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')
        
        console.log('📋 Paramètres callback:', { code: code ? 'PRÉSENT' : 'MANQUANT', state, error })
        
        if (error) {
          console.error('❌ Erreur OAuth:', error)
          navigate('/integrations/mailchimp?error=oauth_denied')
          return
        }
        
        if (!code || !state) {
          console.error('❌ Paramètres manquants')
          navigate('/integrations/mailchimp?error=missing_params')
          return
        }
        
        // Appeler l'Edge Function pour traiter le callback
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mailchimp-callback?` +
          `code=${code}&state=${state}`,
          {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors du traitement')
        }
        
        const result = await response.json()
        console.log('✅ Callback traité avec succès:', result)
        
        // Rediriger vers la page d'intégration avec succès
        navigate('/integrations/mailchimp?success=true')
        
      } catch (error) {
        console.error('❌ Erreur traitement callback:', error)
        navigate('/integrations/mailchimp?error=callback_failed')
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Finalisation de l'installation
          </h2>
          <p className="text-gray-600">
            Redirection vers Mailchimp en cours...
          </p>
        </div>
      </div>
    </div>
  )
}

export default MailchimpCallback
