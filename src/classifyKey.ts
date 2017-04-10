export function classifyKey(keyPath: string): string {
  return `cnt-${keyPath.replace(/[^\w\d]/g, '-').replace(/-+/g, '-')}`.toLowerCase();
}
