import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchShipmentComponent } from './batch-shipment.component';

describe('BatchShipmentComponent', () => {
  let component: BatchShipmentComponent;
  let fixture: ComponentFixture<BatchShipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchShipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
