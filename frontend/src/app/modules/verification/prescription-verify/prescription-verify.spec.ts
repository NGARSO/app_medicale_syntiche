import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionVerify } from './prescription-verify';

describe('PrescriptionVerify', () => {
  let component: PrescriptionVerify;
  let fixture: ComponentFixture<PrescriptionVerify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionVerify]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescriptionVerify);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
