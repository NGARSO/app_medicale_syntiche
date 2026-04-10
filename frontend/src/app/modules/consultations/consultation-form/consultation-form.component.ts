import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConsultationService } from '../../../core/services/consultation.service';
import { PatientService } from '../../../core/services/patient.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-consultation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './consultation-form.component.html',
  styleUrl: './consultation-form.component.scss'
})
export class ConsultationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private consService = inject(ConsultationService);
  private patientService = inject(PatientService);
  private medService = inject(MedecinService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  consultationForm!: FormGroup;
  patients: any[] = [];
  medecins: any[] = [];
  submitting = false;

  ngOnInit() {
    this.initForm();
    this.loadData();
    
    // Si on vient d'un RDV
    const rdvId = this.route.snapshot.queryParams['rdvId'];
    const patientId = this.route.snapshot.queryParams['patientId'];
    const medecinId = this.route.snapshot.queryParams['medecinId'];
    
    if (rdvId) this.consultationForm.patchValue({ rendez_vous_id: rdvId });
    if (patientId) this.consultationForm.patchValue({ patient_id: patientId });
    if (medecinId) this.consultationForm.patchValue({ medecin_id: medecinId });
  }

  initForm() {
    this.consultationForm = this.fb.group({
      patient_id: ['', Validators.required],
      medecin_id: ['', Validators.required],
      rendez_vous_id: [''],
      date_consultation: [new Date().toISOString().split('T')[0], Validators.required],
      motif: ['', Validators.required],
      diagnostic: [''],
      poids: [''],
      tension: [''],
      temperature: [''],
      notes: ['']
    });
  }

  loadData() {
    this.patientService.getAll(1, 100).subscribe(res => this.patients = res.data);
    this.medService.getAll(1, 100).subscribe(res => this.medecins = res.data);
  }

  onSubmit() {
    if (this.consultationForm.invalid) return;
    this.submitting = true;
    this.consService.create(this.consultationForm.value).subscribe({
      next: (res) => {
        this.submitting = false;
        this.router.navigate(['/consultations', res.id]);
      },
      error: () => this.submitting = false
    });
  }
}
