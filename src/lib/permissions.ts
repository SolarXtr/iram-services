export type Permission = 
  | 'CREATE_RESEARCH'
  | 'EDIT_OWN_RESEARCH'
  | 'EDIT_ALL_RESEARCH'
  | 'DELETE_RESEARCH'
  | 'BOOK_CONSULTATION'
  | 'CANCEL_OWN_CONSULT'
  | 'MANAGE_CEU_SCHEDULE'
  | 'APPROVE_REWARD'
  | 'VIEW_EXECUTIVE_STATS'
  | 'MANAGE_USERS'
  | 'VIEW_DB_EXPLORER';

export type UserRole = 'RESEARCHER' | 'STAFF' | 'EXECUTIVE' | 'STAFF_CEU';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  RESEARCHER: [
    'CREATE_RESEARCH',
    'EDIT_OWN_RESEARCH',
    'BOOK_CONSULTATION',
    'CANCEL_OWN_CONSULT',
  ],
  STAFF: [
    'CREATE_RESEARCH',
    'EDIT_ALL_RESEARCH',
    'DELETE_RESEARCH',
    'BOOK_CONSULTATION',
    'CANCEL_OWN_CONSULT',
    'MANAGE_CEU_SCHEDULE',
    'MANAGE_USERS',
    'VIEW_DB_EXPLORER',
    'VIEW_EXECUTIVE_STATS',
  ],
  EXECUTIVE: [
    'APPROVE_REWARD',
    'VIEW_EXECUTIVE_STATS',
  ],
  STAFF_CEU: [
    'BOOK_CONSULTATION',
    'CANCEL_OWN_CONSULT',
    'MANAGE_CEU_SCHEDULE',
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  RESEARCHER: 'นักวิจัย (RESEARCHER)',
  STAFF: 'เจ้าหน้าที่ (STAFF)',
  EXECUTIVE: 'ผู้บริหาร (EXECUTIVE)',
  STAFF_CEU: 'เจ้าหน้าที่ CEU (STAFF_CEU)',
};

/**
 * Get unified permissions for a list of roles
 */
export function getPermissionsForRoles(roles: UserRole[]): Set<Permission> {
  const permissions = new Set<Permission>();
  roles.forEach((role) => {
    const list = ROLE_PERMISSIONS[role];
    if (list) {
      list.forEach((p) => permissions.add(p));
    }
  });
  return permissions;
}

/**
 * Check if a set of roles has a specific permission
 */
export function hasPermission(roles: UserRole[], permission: Permission): boolean {
  const userPerms = getPermissionsForRoles(roles);
  return userPerms.has(permission);
}
