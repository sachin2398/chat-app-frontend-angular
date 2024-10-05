import { TestBed } from '@angular/core/testing';

import { LoginserviceService} from './loginservices.service';

describe('LoginservicesService', () => {
  let service: LoginserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
