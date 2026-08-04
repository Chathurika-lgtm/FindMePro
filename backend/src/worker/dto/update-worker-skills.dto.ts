import {
  IsArray,
  ArrayNotEmpty,
  IsUUID,
} from 'class-validator';

export class UpdateWorkerSkillsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  skillIds!: string[];
}