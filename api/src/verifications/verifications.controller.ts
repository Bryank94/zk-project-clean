import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { scoreRegistry } from '../blockchain/score-registry';

@Controller('verifications')
export class VerificationsController {
  @Post()
  async verify(@Body() body: any) {
    try {
      const tx = await scoreRegistry.verifyScore(
        body.pA,
        body.pB,
        body.pC,
        body.publicSignals
      );

      const receipt = await tx.wait();

      return {
        status: 'verified',
        txHash: receipt.hash,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Blockchain verification failed'
      );
    }
  }
}
