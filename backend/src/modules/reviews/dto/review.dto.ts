import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ReviewDecisionType } from '../../../entities/enums';

export class ReviewCommentDto {
  @IsString()
  @IsNotEmpty()
  comment!: string;
}

export class ReviewDecisionDto {
  @IsEnum(ReviewDecisionType)
  decision!: ReviewDecisionType;

  @IsObject()
  @IsOptional()
  qualityChecklist?: Record<string, boolean>;

  @IsString()
  @IsOptional()
  comment?: string;
}
