import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class SubmitTaskDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  gitUrl?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsObject()
  @IsOptional()
  checklist?: Record<string, boolean>;
}

export class ClaimTaskDto {
  @IsOptional()
  claimHours?: number;
}
