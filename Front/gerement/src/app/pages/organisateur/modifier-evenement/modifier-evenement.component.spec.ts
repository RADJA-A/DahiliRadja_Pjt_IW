import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierEvenementComponent } from './modifier-evenement.component';

describe('ModifierEvenementComponent', () => {
  let component: ModifierEvenementComponent;
  let fixture: ComponentFixture<ModifierEvenementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierEvenementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierEvenementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
