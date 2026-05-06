import { Controller, Get, Param } from '@nestjs/common';

@Controller('verification-sessions')
export class VerificationSessionsController {
  @Get(':id')
  getSession(@Param('id') id: string) {
    return {
      id,
      threshold: 50,
      challenge: 42,
      network: 'amoy',
    };
  }
}
