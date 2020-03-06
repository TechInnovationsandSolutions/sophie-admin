import { TestBed } from '@angular/core/testing';

import { DashboardServService } from './dashboard-serv.service';

describe('DashboardServService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardServService = TestBed.get(DashboardServService);
    expect(service).toBeTruthy();
  });
});
