export type Species = 'cachorro' | 'gato' | 'outro'
export type Sex = 'macho' | 'femea'
export type CareType = 'vacina' | 'remedio' | 'consulta' | 'exame' | 'peso' | 'outro'
export type MemberRole = 'tutor' | 'familia' | 'cuidador'
export type RecurrenceKind = 'nenhuma' | 'horas' | 'diaria' | 'semanal' | 'mensal' | 'anual'

export type User = {
  id: string
  name: string
  hue: number
  createdAt: string
}

export type Pet = {
  id: string
  name: string
  species: Species
  breed?: string
  sex?: Sex
  birthDate?: string
  weightKg?: number
  photo?: Blob
  photoUrl?: string
  allergies?: string
  conditions?: string
  hue: number
  createdBy: string
  createdAt: string
}

export type Member = {
  id: string
  petId: string
  userId: string
  role: MemberRole
  addedAt: string
}

export type Invite = {
  code: string
  petId: string
  role: MemberRole
  createdBy: string
  createdAt: string
  acceptedBy?: string
}

export type HealthEvent = {
  id: string
  petId: string
  type: CareType
  title: string
  date: string
  notes?: string
  vet?: string
  clinic?: string
  weightKg?: number
  createdBy: string
  createdAt: string
}

export type Recurrence = {
  kind: RecurrenceKind
  every: number
}

export type Reminder = {
  id: string
  petId: string
  type: CareType
  title: string
  dueAt: string
  recurrence: Recurrence
  dose?: string
  notes?: string
  active: 0 | 1
  createdBy: string
  createdAt: string
}

export type Completion = {
  id: string
  reminderId: string
  petId: string
  title: string
  type: CareType
  dueAt: string
  doneAt: string
  doneBy: string
}

export type PetDocument = {
  id: string
  petId: string
  eventId?: string
  name: string
  mime: string
  size: number
  blob: Blob
  createdBy: string
  createdAt: string
}
