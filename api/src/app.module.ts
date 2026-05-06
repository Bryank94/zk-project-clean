import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttestationsModule } from './attestations/attestations.module';
import { VerificationSessionsModule } from './verification-sessions/verification-sessions.module';
import { VerificationsModule } from './verifications/verifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AttestationsModule,
    VerificationSessionsModule,
    VerificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
