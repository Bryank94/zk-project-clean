import { Body, Controller, Post } from '@nestjs/common';

@Controller('verifications')
export class VerificationsController {
  @Post()
  verify(@Body() body: any) {
    return {
      status: 'received',
      message: 'Proof submitted for verification',
      proof: body.proof ? 'present' : 'missing',
      publicSignals: body.publicSignals ? 'present' : 'missing',
    };
  }
}
