import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesInscriptionsComponent } from './mes-inscriptions.component';

describe('MesInscriptionsComponent', () => {
  let component: MesInscriptionsComponent;
  let fixture: ComponentFixture<MesInscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesInscriptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesInscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
