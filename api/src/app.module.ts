import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttestationsModule } from './attestations/attestations.module';
import { VerificationSessionsModule } from './verification-sessions/verification-sessions.module';
import { VerificationsModule } from './verifications/verifications.module';

@Module({
  imports: [AttestationsModule, VerificationSessionsModule, VerificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
