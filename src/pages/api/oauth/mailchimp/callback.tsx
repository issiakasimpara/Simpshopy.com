import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const MailchimpCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Traitement du callback Mailchimp...')
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        console.log('📋 Paramètres callback:', { code: !!code, state: !!state, error })

        if (error) {
          console.error('❌ Erreur OAuth:', error)
          navigate('/integrations/mailchimp?error=oauth_denied')
          return
        }

        if (!code || !state) {
          console.error('❌ Code ou state manquant')
          navigate('/integrations/mailchimp?error=oauth_invalid')
          return
        }

        // Rediriger directement vers l'Edge Function
        const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mailchimp-callback?code=${code}&state=${state}`
        console.log('🔄 Redirection vers Edge Function:', edgeFunctionUrl)
        
        // Rediriger directement vers l'Edge Function
        window.location.href = edgeFunctionUrl

      } catch (error) {
        console.error('❌ Erreur traitement callback:', error)
        navigate('/integrations/mailchimp?error=callback_failed')
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Connexion à Mailchimp...</h2>
        <p className="text-muted-foreground">Veuillez patienter pendant que nous finalisons votre installation.</p>
      </div>
    </div>
  )
}

export default MailchimpCallback
