import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrdonnanceService } from '../../../core/services/ordonnance.service';
import { ConsultationService } from '../../../core/services/consultation.service';
import { PatientService } from '../../../core/services/patient.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-ordonnance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ordonnance-form.component.html',
  styleUrl: './ordonnance-form.component.scss'
})
export class OrdonnanceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ordService = inject(OrdonnanceService);
  private consService = inject(ConsultationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ordonnanceForm!: FormGroup;
  consultation: any;
  loading = false;
  submitting = false;

  ngOnInit() {
    this.initForm();
    const consId = this.route.snapshot.queryParams['consultationId'];
    if (consId) {
      this.loadConsultation(consId);
    }
  }

  initForm() {
    this.ordonnanceForm = this.fb.group({
      consultation_id: ['', Validators.required],
      patient_id: ['', Validators.required],
      date_prescription: [new Date().toISOString().split('T')[0], Validators.required],
      date_expiration: [null],
      notes_generales: [''],
      items: this.fb.array([this.createItem()])
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      nom_medicament: ['', Validators.required],
      dosage: [''],
      frequence: [''],
      duree: [''],
      instructions: ['']
    });
  }

  get items() {
    return this.ordonnanceForm.get('items') as FormArray;
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  loadConsultation(id: number) {
    this.loading = true;
    this.consService.getById(id).subscribe((res: any) => {
      setTimeout(() => {
        this.consultation = res;
        this.ordonnanceForm.patchValue({
          consultation_id: res.id,
          patient_id: res.patient_id
        });
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  submit() {
    if (this.ordonnanceForm.invalid) {
      this.ordonnanceForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const rawData = this.ordonnanceForm.value;
    const formattedData = {
      ...rawData,
      date_expiration: rawData.date_expiration || null
    };

    this.ordService.create(formattedData).subscribe({
      next: (res) => {
        this.submitting = false;
        this.router.navigate(['/ordonnances']);
      },
      error: (err) => {
        this.submitting = false;
        alert('Erreur lors de la création : ' + (err.error?.message || 'Serveur injoignable'));
        this.cdr.detectChanges();
      }
    });
  }
}
