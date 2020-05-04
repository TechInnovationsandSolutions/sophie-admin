import { TestBed } from '@angular/core/testing';

import { DomManipulationService } from './dom-manipulation.service';

describe('DomManipulationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DomManipulationService = TestBed.get(DomManipulationService);
    expect(service).toBeTruthy();
  });
});
