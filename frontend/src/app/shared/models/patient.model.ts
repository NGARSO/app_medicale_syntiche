export interface Patient {
  id?: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  cin: string;
  email?: string;
  telephone: string;
  sexe: 'M' | 'F';
  groupe_sanguin?: string;
  antecedents?: string;
  created_at?: string;
  updated_at?: string;
}
