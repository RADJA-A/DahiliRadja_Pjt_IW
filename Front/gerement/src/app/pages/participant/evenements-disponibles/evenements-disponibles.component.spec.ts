import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvenementsDisponiblesComponent } from './evenements-disponibles.component';

describe('EvenementsDisponiblesComponent', () => {
  let component: EvenementsDisponiblesComponent;
  let fixture: ComponentFixture<EvenementsDisponiblesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvenementsDisponiblesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvenementsDisponiblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
