import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
