import { Test, TestingModule } from '@nestjs/testing';
import { VerificationSessionsService } from './verification-sessions.service';

describe('VerificationSessionsService', () => {
  let service: VerificationSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationSessionsService],
    }).compile();

    service = module.get<VerificationSessionsService>(VerificationSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
