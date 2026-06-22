const webConfig = {
  apiUrl: (import.meta.env.VITE_PUBLIC_API_BASE || "").replace(/\/$/, ""),
};

export default webConfig;
