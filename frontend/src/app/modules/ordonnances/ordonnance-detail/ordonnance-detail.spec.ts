import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdonnanceDetail } from './ordonnance-detail';

describe('OrdonnanceDetail', () => {
  let component: OrdonnanceDetail;
  let fixture: ComponentFixture<OrdonnanceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdonnanceDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdonnanceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
