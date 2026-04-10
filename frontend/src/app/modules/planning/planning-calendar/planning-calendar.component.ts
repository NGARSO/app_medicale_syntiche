import { Component, OnInit, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DisponibiliteService } from '../../../core/services/disponibilite.service';
import { LoadingService } from '../../../core/services/loading.service';
import { MedecinService } from '../../../core/services/medecin.service';
import { PatientService } from '../../../core/services/patient.service';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { CalendarOptions } from '@fullcalendar/core';

@Component({
  selector: 'app-planning-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ReactiveFormsModule],
  templateUrl: './planning-calendar.component.html',
  styleUrl: './planning-calendar.component.scss'
})
export class PlanningCalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: any;
  private dispService = inject(DisponibiliteService);
  private medService = inject(MedecinService);
  private loadingService = inject(LoadingService);
  private patientService = inject(PatientService);
  private rdvService = inject(RendezVousService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  showModal = false;
  activeModalState: 'menu' | 'booking' | 'availability' | 'patient' = 'menu';
  selectedDateStr = '';
  selectedDate: Date | null = null;

  // Forms
  bookingForm!: FormGroup;
  availabilityForm!: FormGroup;
  quickPatientForm!: FormGroup;

  patients: any[] = [];
  filteredPatients: any[] = [];
  searchControl = new FormControl('');
  selectedPatient: any = null;

  debugMessage = '';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour'
    },
    events: [],
    eventDisplay: 'block',
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    height: '700px',
    expandRows: true,
    allDaySlot: false,
    nowIndicator: true,
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    unselectAuto: true,
    locale: 'fr',
    dateClick: this.handleDateClick.bind(this),
    select: this.handleDateClick.bind(this)
  };

  medecins: any[] = [];
  medecinFilter = new FormControl('');
  loading = false;

  ngOnInit() {
    // Liaison explicite des événements au démarrage
    this.calendarOptions = {
      ...this.calendarOptions,
      dateClick: (info: any) => this.handleDateClick(info),
      select: (info: any) => this.handleDateClick(info)
    };

    this.initForms();
    this.loadMedecins();
    this.loadEvents();
    this.medecinFilter.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.loadEvents());

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => val && val.length > 1 ? this.patientService.getAll(1, 10, val) : of({data: []}))
    ).subscribe((res: any) => {
      this.filteredPatients = res.data || [];
      this.cdr.detectChanges();
    });
  }

  initForms() {
    this.bookingForm = this.fb.group({
      patient_id: ['', Validators.required],
      medecin_id: ['', Validators.required],
      date_heure: ['', Validators.required],
      motif: ['', Validators.required],
      notes: [''],
      statut: ['EN_ATTENTE']
    });

    this.availabilityForm = this.fb.group({
      medecin_id: ['', Validators.required],
      jour_semaine: [1, Validators.required],
      heure_debut: ['08:00', Validators.required],
      heure_fin: ['12:00', Validators.required],
    });

    this.quickPatientForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      cin: ['', Validators.required],
      telephone: ['', Validators.required],
      date_naissance: ['', Validators.required],
      sexe: ['M', Validators.required],
    });
  }

  loadMedecins() {
    this.medService.getAll(1, 100).subscribe((res: any) => {
      this.medecins = res.data || [];
    });
  }

  loadEvents() {
    const medecinId = this.medecinFilter.value ? Number(this.medecinFilter.value) : null;
    if (!medecinId) {
      this.calendarOptions = { ...this.calendarOptions, events: [] };
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.loadingService.wrap(this.dispService.getByMedecin(medecinId)).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        
        const events = data.map((disp: any) => ({
          id: disp.id?.toString(),
          title: 'Disponible',
          startTime: disp.heure_debut,
          endTime: disp.heure_fin,
          daysOfWeek: [disp.jour_semaine], // 0 for Sunday, 1-6 for Mon-Sat
          display: 'block',
          backgroundColor: '#10b981',
          borderColor: '#059669',
          textColor: 'white'
        }));

        this.calendarOptions = { ...this.calendarOptions, events };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  handleDateClick(info: any) {
    const dateStr = info.dateStr || info.startStr;
    this.selectedDateStr = dateStr;
    this.selectedDate = info.date || info.start;
    
    this.openAvailability();
    this.showModal = true;
    this.cdr.detectChanges();
  }

  selectPatient(p: any) {
    this.selectedPatient = p;
    this.bookingForm.patchValue({ patient_id: p.id });
    this.filteredPatients = [];
    this.searchControl.setValue(`${p.nom.toUpperCase()} ${p.prenom}`, { emitEvent: false });
    this.cdr.detectChanges();
  }

  openBooking() {
    this.activeModalState = 'booking';
    this.bookingForm.reset({
      date_heure: this.selectedDateStr.substring(0, 16),
      medecin_id: this.medecinFilter.value || '',
      statut: 'EN_ATTENTE'
    });
    this.selectedPatient = null;
    this.searchControl.setValue('');
    this.cdr.detectChanges();
  }

  openAvailability() {
    this.activeModalState = 'availability';
    const day = this.selectedDate ? this.selectedDate.getDay() : 1;
    const time = this.selectedDateStr.includes('T') ? this.selectedDateStr.split('T')[1].substring(0, 5) : '08:00';
    this.availabilityForm.reset({
      medecin_id: this.medecinFilter.value || '',
      jour_semaine: day,
      heure_debut: time,
      heure_fin: this.addHour(time)
    });
    this.cdr.detectChanges();
  }

  private addHour(time: string): string {
    const [h, m] = time.split(':').map(Number);
    return `${(h + 1).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  submitBooking() {
    if (this.bookingForm.invalid) return;
    this.loadingService.wrap(this.rdvService.create(this.bookingForm.value)).subscribe(() => {
      this.closeModal();
      this.loadEvents();
    });
  }

  submitAvailability() {
    if (this.availabilityForm.invalid) return;
    this.loadingService.wrap(this.dispService.create(this.availabilityForm.value)).subscribe(() => {
      this.closeModal();
      this.loadEvents();
    });
  }

  submitQuickPatient() {
    if (this.quickPatientForm.invalid) return;
    this.loadingService.wrap(this.patientService.create(this.quickPatientForm.value)).subscribe((p: any) => {
      this.selectPatient(p);
      this.activeModalState = 'booking';
    });
  }

  closeModal() {
    this.showModal = false;
    this.activeModalState = 'menu';
    this.cdr.detectChanges();
  }

  viewAvailableDoctors() {
    console.log('Viewing available doctors for:', this.selectedDateStr);
    this.closeModal();
    // In a future update, this could open a modal list of doctors with matching availability
  }

  // Aliases for compatibility with cached templates
  goToBookAppointment() { this.openBooking(); }
  goToAddAvailability() { this.openAvailability(); }

  onEventsSet(events: any[]) {
    console.log('Events set:', events.length);
  }
}
