import { Test, TestingModule } from '@nestjs/testing';
import { VerificationSessionsController } from './verification-sessions.controller';

describe('VerificationSessionsController', () => {
  let controller: VerificationSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationSessionsController],
    }).compile();

    controller = module.get<VerificationSessionsController>(VerificationSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
