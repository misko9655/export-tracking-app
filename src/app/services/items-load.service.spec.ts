import { TestBed } from '@angular/core/testing';

import { ItemsLoadService } from './items-load.service';

describe('ItemsLoadService', () => {
  let service: ItemsLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemsLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
