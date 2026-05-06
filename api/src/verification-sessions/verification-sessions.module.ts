import { Module } from '@nestjs/common';
import { VerificationSessionsController } from './verification-sessions.controller';
import { VerificationSessionsService } from './verification-sessions.service';

@Module({
  controllers: [VerificationSessionsController],
  providers: [VerificationSessionsService]
})
export class VerificationSessionsModule {}
