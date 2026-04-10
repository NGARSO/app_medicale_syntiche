export interface Medecin {
  id?: number;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  matricule: string;
  disponible: boolean;
  est_disponible_maintenant: boolean;
  created_at?: string;
  updated_at?: string;
}
