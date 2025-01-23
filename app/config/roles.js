export const USER_ROLES = {
  ADMINISTRATOR: 'administrator',
  MANAGER: 'manager',
  STUDENT: 'student'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMINISTRATOR]: {
    canAccessDashboard: true,
    canAccessUsers: true,
    canAccessMentors: true,
    canManageRoles: true,
    canAccessStudents: true,
    canManageStudents: true,
    canAccessPlan: true,
    canAccessAccount: true,
    canAccessInstitutions: true
  },
  [USER_ROLES.MANAGER]: {
    canAccessDashboard: true,
    canAccessUsers: false,
    canAccessMentors: true,
    canManageRoles: false,
    canAccessStudents: true,
    canManageStudents: false,
    canAccessPlan: true,
    canAccessAccount: true,
    canAccessInstitutions: false
  },
  [USER_ROLES.STUDENT]: {
    canAccessDashboard: false,
    canAccessUsers: false,
    canAccessMentors: true,
    canManageRoles: false,
    canAccessStudents: false,
    canManageStudents: false,
    canAccessPlan: false,
    canAccessAccount: true,
    canAccessInstitutions: false
  }
};
