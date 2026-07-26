type ApiErrorPayload = {
  ok?: boolean;
  code?: string;
  message?: string;
  error?: string | { code?: string; message?: string };
};

export class CommercialApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, options: { code?: string; status: number }) {
    super(message);
    this.name = "CommercialApiError";
    this.code = options.code;
    this.status = options.status;
  }
}

function errorDetails(payload: ApiErrorPayload, status: number) {
  const nested = payload.error && typeof payload.error === "object" ? payload.error : undefined;
  const message = payload.message
    || nested?.message
    || (typeof payload.error === "string" ? payload.error : "")
    || `请求失败 HTTP ${status}`;
  return { message, code: payload.code || nested?.code };
}

function requestOptions(options: RequestInit) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return { credentials: "include" as const, ...options, headers };
}

async function readError(response: Response) {
  const payload = await response.clone().json().catch(() => ({} as ApiErrorPayload)) as ApiErrorPayload;
  const details = errorDetails(payload, response.status);
  throw new CommercialApiError(details.message, { code: details.code, status: response.status });
}

export async function commercialJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, requestOptions(options));
  const payload = await response.json().catch(() => ({})) as T & ApiErrorPayload;
  if (!response.ok || payload.ok === false) {
    const details = errorDetails(payload, response.status);
    throw new CommercialApiError(details.message, { code: details.code, status: response.status });
  }
  return payload;
}

export async function commercialBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const response = await fetch(path, requestOptions(options));
  if (!response.ok) await readError(response);
  return response.blob();
}
