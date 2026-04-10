import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrdonnanceService } from '../../../core/services/ordonnance.service';
import { ConsultationService } from '../../../core/services/consultation.service';
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
      date_expiration: [''],
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
    this.consService.getById(id).subscribe(res => {
      // On utilise setTimeout pour éviter l'erreur ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.consultation = res;
        this.ordonnanceForm.patchValue({
          consultation_id: res.id,
          patient_id: res.patient_id
        });
        this.loading = false;
      });
    });
  }

  submit() {
    if (this.ordonnanceForm.invalid) return;
    this.submitting = true;
    this.ordService.create(this.ordonnanceForm.value).subscribe({
      next: (res) => {
        this.submitting = false;
        // Navigation vers la liste avec message de succès
        this.router.navigate(['/ordonnances']);
      },
      error: () => this.submitting = false
    });
  }
}
