import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
export const TENANT = process.env.NEXT_PUBLIC_TENANT_ID!;

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});
