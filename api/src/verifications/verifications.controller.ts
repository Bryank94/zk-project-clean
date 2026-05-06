import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { buildVerifyScoreTransaction } from '../blockchain/score-registry';
import { CreateVerificationDto } from './dto/create-verification.dto';

@Controller('verifications')
export class VerificationsController {
  @Post()
  async verify(@Body() body: CreateVerificationDto) {
    try {
      const transaction = await buildVerifyScoreTransaction(body);

      return {
        status: 'ready_for_signature',
        message: 'Submit this transaction with MetaMask or another user-controlled wallet.',
        transaction,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Blockchain transaction preparation failed'
      );
    }
  }
}
