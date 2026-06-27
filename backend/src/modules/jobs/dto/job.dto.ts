import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus } from '../../../entities/enums';

export class JobRequirementDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  priority?: number;
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  stack!: string;

  @IsString()
  @IsOptional()
  constraints?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  virtualBudget?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobRequirementDto)
  @IsOptional()
  requirements?: JobRequirementDto[];
}

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  status!: JobStatus;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  type!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  difficulty?: number;

  @IsOptional()
  estimatedHours?: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  dependsOnTaskIds?: string[];
}
