import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SessionProvider } from './session'

const AppLayout = lazy(() => import('./AppLayout').then((m) => ({ default: m.AppLayout })))
const Landing = lazy(() => import('@/landing/Landing').then((m) => ({ default: m.Landing })))
const Auth = lazy(() => import('@/features/auth/Auth').then((m) => ({ default: m.Auth })))
const AcceptInvite = lazy(() => import('@/features/sharing/AcceptInvite').then((m) => ({ default: m.AcceptInvite })))
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })))
const History = lazy(() => import('@/features/history/History').then((m) => ({ default: m.History })))
const Agenda = lazy(() => import('@/features/agenda/Agenda').then((m) => ({ default: m.Agenda })))
const Family = lazy(() => import('@/features/sharing/Family').then((m) => ({ default: m.Family })))
const PetProfile = lazy(() => import('@/features/pets/PetProfile').then((m) => ({ default: m.PetProfile })))
const NewPet = lazy(() => import('@/features/pets/NewPet').then((m) => ({ default: m.NewPet })))
const VetView = lazy(() => import('@/features/vet-view/VetView').then((m) => ({ default: m.VetView })))

const Fallback = () => <div className="min-h-dvh bg-ground" />

export const App = () => (
  <SessionProvider>
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/entrar" element={<Auth />} />
          <Route path="/convite/:code" element={<AcceptInvite />} />
          <Route path="/consulta/:petId" element={<VetView />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="historico" element={<History />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="familia" element={<Family />} />
            <Route path="pet" element={<PetProfile />} />
            <Route path="pets/novo" element={<NewPet />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    <Toaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast: '!rounded-2xl !border-line !bg-surface !text-ink !shadow-lift !font-sans',
          description: '!text-ink-soft',
          actionButton: '!bg-brand !text-white !rounded-full !font-semibold',
        },
      }}
    />
  </SessionProvider>
)
