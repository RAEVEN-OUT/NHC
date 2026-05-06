import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsArray()
  roleIds?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class UpdateUserStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  status!: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export class AssignRolesDto {
  @IsArray()
  roleIds!: string[];
}

export class ResetUserPasswordDto {
  @IsString()
  @MinLength(8)
  password!: string;
}
