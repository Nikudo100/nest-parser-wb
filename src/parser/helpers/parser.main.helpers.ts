export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, g1) => g1.toUpperCase());
  }

export function convertKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(convertKeysToCamelCase);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[snakeToCamel(key)] = convertKeysToCamelCase(value);
        return acc;
      }, {} as Record<string, any>);
    }
    return obj;
}