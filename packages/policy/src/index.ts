export type Permission = string;
export type Role = string;

export type RoleMap = Record<Role, Permission[]>;

export const hasPermission = (perms: Permission[] | undefined, need: Permission) =>
  !!perms && perms.includes(need);

export const expandRoles = (roles: Role[] = [], map: RoleMap = {}): Permission[] => {
  const set = new Set<string>();
  for (const r of roles) (map[r] || []).forEach(p => set.add(p));
  return Array.from(set);
};
