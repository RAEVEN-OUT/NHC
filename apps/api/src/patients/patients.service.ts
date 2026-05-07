import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { CustomerStatus } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: { search?: string; status?: string; city?: string }) {
    return this.prisma.customer.findMany({
      where: {
        deletedAt: null,
        status: query.status as any,
        city: query.city ? { contains: query.city, mode: 'insensitive' } : undefined,
        OR: query.search
          ? [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
              { customerCode: { contains: query.search, mode: 'insensitive' } },
              { membershipCards: { some: { cardNumber: { contains: query.search, mode: 'insensitive' } } } },
            ]
          : undefined,
      },
      include: {
        membershipCards: { where: { status: 'ACTIVE' }, take: 1 },
        registeredBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        familyMembers: true,
        membershipCards: true,
        registeredBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async create(dto: CreatePatientDto, actorId?: string) {
    const existingPhone = await this.prisma.customer.findUnique({ where: { phone: dto.phone } });
    if (existingPhone) throw new BadRequestException('Phone number already registered');

    if (dto.email) {
      const existingEmail = await this.prisma.customer.findUnique({ where: { email: dto.email } });
      if (existingEmail) throw new BadRequestException('Email already registered');
    }

    const customerCode = await this.generateCustomerCode();
    
    const patient = await this.prisma.customer.create({
      data: {
        customerCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        dob: new Date(dto.dob),
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        city: dto.city,
        district: dto.district,
        state: dto.state,
        pincode: dto.pincode,
        registrationSource: dto.registrationSource,
        registeredById: actorId,
        familyMembers: dto.familyMembers?.length
          ? {
              create: dto.familyMembers.map((fm) => ({
                fullName: fm.fullName,
                relationship: fm.relationship,
                dob: fm.dob ? new Date(fm.dob) : null,
                gender: fm.gender,
                phone: fm.phone,
              })),
            }
          : undefined,
        membershipCards: {
          create: {
            cardNumber: await this.generateCardNumber(),
            issueDate: new Date(),
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year default
          },
        },
      },
      include: {
        familyMembers: true,
        membershipCards: true,
      },
    });

    await this.audit.log({
      actorId,
      action: 'patient.created',
      entityType: 'customers',
      entityId: patient.id,
      newValues: patient,
    });

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto, actorId?: string) {
    await this.findOne(id);
    
    // Extract familyMembers from DTO to handle separately
    const { familyMembers, ...updateData } = dto;

    const patient = await this.prisma.customer.update({
      where: { id },
      data: {
        ...updateData,
        dob: updateData.dob ? new Date(updateData.dob) : undefined,
        familyMembers: familyMembers !== undefined ? {
          deleteMany: {}, // Remove all existing family members
          create: familyMembers.map((fm) => ({
            fullName: fm.fullName,
            relationship: fm.relationship,
            dob: fm.dob ? new Date(fm.dob) : null,
            gender: fm.gender,
            phone: fm.phone,
          })),
        } : undefined,
      },
      include: {
        familyMembers: true,
      },
    });

    await this.audit.log({
      actorId,
      action: 'patient.updated',
      entityType: 'customers',
      entityId: id,
      newValues: patient,
    });

    return patient;
  }

  async hardDelete(id: string, actorId?: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({
      where: { id },
    });

    await this.audit.log({
      actorId,
      action: 'patient.deleted',
      entityType: 'customers',
      entityId: id,
    });

    return { deleted: true };
  }

  async reissueCard(id: string, actorId?: string) {
    const patient = await this.findOne(id);

    // Deactivate all existing cards
    await this.prisma.membershipCard.updateMany({
      where: { customerId: id, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    // Create new card
    const newCard = await this.prisma.membershipCard.create({
      data: {
        customerId: id,
        cardNumber: await this.generateCardNumber(),
        issueDate: new Date(),
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
    });

    await this.audit.log({
      actorId,
      action: 'patient.card_reissued',
      entityType: 'membership_cards',
      entityId: newCard.id,
      metadata: { patientId: id },
    });

    return newCard;
  }

  private async generateCustomerCode(): Promise<string> {
    const year = new Date().getFullYear();
    const lastCustomer = await this.prisma.customer.findFirst({
      where: { customerCode: { startsWith: `NHC-${year}-` } },
      orderBy: { customerCode: 'desc' },
    });

    let nextNumber = 1;
    if (lastCustomer) {
      const parts = lastCustomer.customerCode.split('-');
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      nextNumber = lastNumber + 1;
    }

    return `NHC-${year}-${nextNumber.toString().padStart(5, '0')}`;
  }

  private async generateCardNumber(): Promise<string> {
    const prefix = '7999'; // Example prefix
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${prefix}${random}`;
  }
}
