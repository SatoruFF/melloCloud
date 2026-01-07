export const PERMISSIONS = {
    AVAILABLE: 2,      // 0000000010
    SEARCH: 8,         // 0000001000
    READ: 32,          // 0000100000
    EDIT: 128,         // 0010000000
    CREATE: 512,       // 1000000000
    EXPORT: 1024,      // 10000000000
    DELETE: 2048,      // 100000000000
    ACCESS: 8192,      // 10000000000000
    ADMIN: 32768,      // 1000000000000000
    DENY: 131072,      // 100000000000000000
  } as const;
  
  // Комбинации прав
  export const PERMISSION_PRESETS = {
    VIEWER: PERMISSIONS.READ | PERMISSIONS.SEARCH | PERMISSIONS.AVAILABLE, // 42
    EDITOR: PERMISSIONS.READ | PERMISSIONS.EDIT | PERMISSIONS.SEARCH | PERMISSIONS.AVAILABLE, // 170
    CONTRIBUTOR: PERMISSIONS.READ | PERMISSIONS.EDIT | PERMISSIONS.CREATE | PERMISSIONS.SEARCH | PERMISSIONS.AVAILABLE, // 682
    FULL_ACCESS: PERMISSIONS.READ | PERMISSIONS.EDIT | PERMISSIONS.CREATE | PERMISSIONS.DELETE | PERMISSIONS.EXPORT | PERMISSIONS.SEARCH | PERMISSIONS.AVAILABLE, // 3754
    OWNER: PERMISSIONS.ADMIN, // 32768 (все права)
  } as const;
  
  // Проверка наличия прав
  export const hasPermission = (userLevel: number, requiredPermission: number): boolean => {
    // Если есть DENY - запрещаем всё
    if (userLevel & PERMISSIONS.DENY) {
      return false;
    }
    
    // Если ADMIN - разрешаем всё (кроме DENY)
    if (userLevel & PERMISSIONS.ADMIN) {
      return true;
    }
    
    // Проверяем битовую маску
    return (userLevel & requiredPermission) === requiredPermission;
  };
  
  // Добавить право
  export const addPermission = (currentLevel: number, newPermission: number): number => {
    return currentLevel | newPermission;
  };
  
  // Убрать право
  export const removePermission = (currentLevel: number, permissionToRemove: number): number => {
    return currentLevel & ~permissionToRemove;
  };
  
  // Получить список прав
  export const getPermissionsList = (level: number): string[] => {
    const permissions: string[] = [];
    
    if (level & PERMISSIONS.DENY) return ['DENY'];
    if (level & PERMISSIONS.ADMIN) return ['ADMIN'];
    
    if (level & PERMISSIONS.AVAILABLE) permissions.push('AVAILABLE');
    if (level & PERMISSIONS.SEARCH) permissions.push('SEARCH');
    if (level & PERMISSIONS.READ) permissions.push('READ');
    if (level & PERMISSIONS.EDIT) permissions.push('EDIT');
    if (level & PERMISSIONS.CREATE) permissions.push('CREATE');
    if (level & PERMISSIONS.EXPORT) permissions.push('EXPORT');
    if (level & PERMISSIONS.DELETE) permissions.push('DELETE');
    if (level & PERMISSIONS.ACCESS) permissions.push('ACCESS');
    
    return permissions;
  };
  