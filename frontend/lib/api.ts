import axios from "axios";
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/,"") || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

export async function getJSON<T>(url: string) { const { data } = await api.get<T>(url); return data; }
export async function postJSON<T>(url: string, payload: unknown) { const { data } = await api.post<T>(url, payload); return data; }
export async function putJSON<T>(url: string, payload: unknown) { const { data } = await api.put<T>(url, payload); return data; }
export async function del(url: string) { await api.delete(url); }
