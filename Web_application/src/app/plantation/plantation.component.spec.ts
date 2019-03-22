import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantationComponent } from './plantation.component';

describe('PlantationComponent', () => {
  let component: PlantationComponent;
  let fixture: ComponentFixture<PlantationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
