export const ROLES = {
  CLIENT: 'CLIENT',
  WORKER: 'WORKER',
  REVIEWER: 'REVIEWER',
  ADMIN: 'ADMIN',
};

export function hasRole(user, ...roles) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  return roles.includes(user.role);
}

export function roleLabel(role) {
  const labels = {
    CLIENT: 'Client',
    WORKER: 'Worker',
    REVIEWER: 'Reviewer',
    ADMIN: 'Admin',
  };
  return labels[role] || role;
}

export function canCreateJob(user) {
  return hasRole(user, ROLES.CLIENT, ROLES.ADMIN);
}

export function canClaimTask(user) {
  return hasRole(user, ROLES.WORKER, ROLES.ADMIN);
}

export function canReview(user) {
  return hasRole(user, ROLES.REVIEWER, ROLES.ADMIN);
}
