import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';

export class CreateVerificationDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  pA!: [string, string];

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  pB!: [[string, string], [string, string]];

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  pC!: [string, string];

  @IsArray()
  @ArrayMinSize(8)
  @ArrayMaxSize(8)
  publicSignals!: string[];
}
