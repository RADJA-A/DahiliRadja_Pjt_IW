import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesEvenementsComponent } from './mes-evenements.component';

describe('MesEvenementsComponent', () => {
  let component: MesEvenementsComponent;
  let fixture: ComponentFixture<MesEvenementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesEvenementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesEvenementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
