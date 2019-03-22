import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBatchComponent } from './my-batch.component';

describe('MyBatchComponent', () => {
  let component: MyBatchComponent;
  let fixture: ComponentFixture<MyBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
