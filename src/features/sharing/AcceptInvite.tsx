import { useEffect, useRef } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSession } from '@/app/session'
import { acceptInvite } from '@/data/repo'

export const AcceptInvite = () => {
  const { code = '' } = useParams()
  const { user, ready } = useSession()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (!ready || !user || handled.current) return
    handled.current = true
    acceptInvite(code, user.id).then((result) => {
      if (result === 'ok') toast.success('Convite aceito. Agora vocês cuidam juntos.')
      if (result === 'already-member') toast.info('Você já faz parte do cuidado desse pet.')
      if (result === 'not-found') toast.error('Esse convite não existe mais. Peça um código novo.')
      navigate('/app/familia', { replace: true })
    })
  }, [ready, user, code, navigate])

  if (ready && !user) return <Navigate to={`/entrar?convite=${encodeURIComponent(code)}`} replace />
  return <div className="min-h-dvh bg-ground" />
}
