import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../common/decorators/user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { PatientsService } from './patients.service';

@Controller('patients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Permissions('patient.view')
  findAll(@Query() query: { search?: string; status?: string; city?: string }) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  @Permissions('patient.view')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Post()
  @Permissions('patient.create')
  create(@Body() dto: CreatePatientDto, @GetUser('sub') actorId: string) {
    return this.patientsService.create(dto, actorId);
  }

  @Patch(':id')
  @Permissions('patient.edit')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto, @GetUser('sub') actorId: string) {
    return this.patientsService.update(id, dto, actorId);
  }

  @Delete(':id')
  @Permissions('patient.delete')
  remove(@Param('id') id: string, @GetUser('sub') actorId: string) {
    return this.patientsService.hardDelete(id, actorId);
  }

  @Post(':id/reissue-card')
  @Permissions('card.manage')
  reissue(@Param('id') id: string, @GetUser('sub') actorId: string) {
    return this.patientsService.reissueCard(id, actorId);
  }
}
