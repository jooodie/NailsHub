/** Server Component / Action 錯誤顯示用 */
export function formatDataError(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
