import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvantagesComponent } from './avantages.component';

describe('AvantagesComponent', () => {
  let component: AvantagesComponent;
  let fixture: ComponentFixture<AvantagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvantagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvantagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
