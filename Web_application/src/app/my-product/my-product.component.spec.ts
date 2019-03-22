import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProductComponent } from './my-product.component';

describe('MyProductComponent', () => {
  let component: MyProductComponent;
  let fixture: ComponentFixture<MyProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
