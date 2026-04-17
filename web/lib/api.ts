/** 後端 API base（本機預設 FastAPI） */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  return url ?? "http://127.0.0.1:8000";
}
