export type StatutRdv = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE';

export interface RendezVous {
  id?: number;
  date_heure: string;
  statut: StatutRdv;
  motif: string;
  notes?: string;
  patient_id: number;
  medecin_id: number;
  patient?: any;
  medecin?: any;
  created_at?: string;
  updated_at?: string;
}
