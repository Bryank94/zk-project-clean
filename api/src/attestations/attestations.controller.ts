import { Body, Controller, Post } from '@nestjs/common';

@Controller('attestations')
export class AttestationsController {
  @Post()
  createAttestation(@Body() body: any) {
    return {
      status: 'ok',
      message: 'Attestation received',
      data: body,
    };
  }
}
