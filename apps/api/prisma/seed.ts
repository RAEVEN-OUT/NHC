import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const roleNames = [
  'super_admin',
  'admin',
  'receptionist',
  'field_manager',
  'field_executive',
  'customer',
];

const permissions = [
  ['user.view', 'Users', 'View users'],
  ['user.create', 'Users', 'Create users'],
  ['user.edit', 'Users', 'Edit users'],
  ['user.delete', 'Users', 'Soft delete users'],
  ['user.status', 'Users', 'Block, activate, or deactivate users'],
  ['user.reset_password', 'Users', 'Reset user passwords'],
  ['user.activity', 'Users', 'View user activity'],
  ['role.view', 'Roles', 'View roles'],
  ['role.create', 'Roles', 'Create roles'],
  ['role.edit', 'Roles', 'Edit roles'],
  ['role.delete', 'Roles', 'Soft delete roles'],
  ['role.assign', 'Roles', 'Assign roles to users'],
  ['permission.view', 'Permissions', 'View permissions'],
  ['permission.assign', 'Permissions', 'Attach permissions to roles'],
  ['session.view', 'Sessions', 'View active sessions'],
  ['session.force_logout', 'Sessions', 'Force logout sessions'],
  ['audit.view', 'Audit', 'View audit logs'],
  ['patient.view', 'Patients', 'View patient list and profiles'],
  ['patient.create', 'Patients', 'Register new patients'],
  ['patient.edit', 'Patients', 'Update patient information'],
  ['patient.delete', 'Patients', 'Soft delete patients'],
  ['family.manage', 'Patients', 'Manage patient family members'],
  ['card.manage', 'Patients', 'Issue and manage membership cards'],
];

const rolePermissions: Record<string, string[]> = {
  super_admin: permissions.map(([key]) => key),
  admin: [
    'user.view',
    'user.create',
    'user.edit',
    'user.status',
    'role.view',
    'role.assign',
    'permission.view',
    'session.view',
    'patient.view',
    'patient.create',
    'patient.edit',
    'patient.delete',
    'family.manage',
    'card.manage',
  ],
  receptionist: [
    'user.view',
    'patient.view',
    'patient.create',
    'patient.edit',
    'family.manage',
    'card.manage',
  ],
  field_manager: [
    'user.view',
    'patient.view',
    'patient.create',
  ],
  field_executive: [
    'patient.create',
  ],
  customer: [],
};

async function main() {
  const roleByName = new Map<string, string>();
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, isSystem: true, description: name.replace(/_/g, ' ') },
    });
    roleByName.set(name, role.id);
  }

  const permissionByKey = new Map<string, string>();
  for (const [key, group, description] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: { group, description },
      create: { key, group, description },
    });
    permissionByKey.set(key, permission.id);
  }

  for (const [roleName, keys] of Object.entries(rolePermissions)) {
    const roleId = roleByName.get(roleName)!;
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    for (const key of keys) {
      await prisma.rolePermission.create({
        data: { roleId, permissionId: permissionByKey.get(key)! },
      });
    }
  }

  const email = process.env.SEED_SUPER_ADMIN_EMAIL ?? 'admin@nhc.local';
  const phone = process.env.SEED_SUPER_ADMIN_PHONE ?? '9999999999';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Admin@12345';
  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: { phone },
    create: {
      email,
      phone,
      username: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: await bcrypt.hash(password, 12),
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: roleByName.get('super_admin')! } },
    update: {},
    create: { userId: superAdmin.id, roleId: roleByName.get('super_admin')! },
  });

  console.log(`Seeded roles, permissions, and super admin: ${email} / ${phone}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
