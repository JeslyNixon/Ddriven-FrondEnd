import { TestBed } from '@angular/core/testing';

import { PropertyInspection } from './property-inspection';

describe('PropertyInspection', () => {
  let service: PropertyInspection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyInspection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
