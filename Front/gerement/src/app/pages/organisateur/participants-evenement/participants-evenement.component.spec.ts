import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantsEvenementComponent } from './participants-evenement.component';

describe('ParticipantsEvenementComponent', () => {
  let component: ParticipantsEvenementComponent;
  let fixture: ComponentFixture<ParticipantsEvenementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantsEvenementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantsEvenementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
