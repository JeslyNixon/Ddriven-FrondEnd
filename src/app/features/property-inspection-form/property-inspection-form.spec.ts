import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyInspectionFormComponent } from './property-inspection-form';

describe('PropertyInspectionForm', () => {
  let component: PropertyInspectionFormComponent;
  let fixture: ComponentFixture<PropertyInspectionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyInspectionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyInspectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
