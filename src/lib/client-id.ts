type CryptoSource = Pick<Crypto, "getRandomValues" | "randomUUID">;

function randomBytes(source: CryptoSource | undefined) {
  const bytes = new Uint8Array(16);
  if (typeof source?.getRandomValues === "function") {
    source.getRandomValues(bytes);
    return bytes;
  }
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function createLocalId(source: CryptoSource | undefined = globalThis.crypto) {
  if (typeof source?.randomUUID === "function") return source.randomUUID();
  const bytes = randomBytes(source);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createClientId(prefix: string, source: CryptoSource | undefined = globalThis.crypto) {
  return `${prefix}_${createLocalId(source).replaceAll("-", "")}`;
}
