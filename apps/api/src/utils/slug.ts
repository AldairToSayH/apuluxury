export const slugSchemaPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return slugSchemaPattern.test(value);
}
