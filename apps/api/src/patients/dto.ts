import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, RegistrationSource, CustomerStatus } from '@prisma/client';

export class CreateFamilyMemberDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsDateString()
  @IsNotEmpty()
  dob: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsEnum(RegistrationSource)
  @IsOptional()
  registrationSource?: RegistrationSource;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFamilyMemberDto)
  familyMembers?: CreateFamilyMemberDto[];
}

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus;
}
