import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionProcessComponent } from './production-process.component';

describe('ProductionProcessComponent', () => {
  let component: ProductionProcessComponent;
  let fixture: ComponentFixture<ProductionProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductionProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
