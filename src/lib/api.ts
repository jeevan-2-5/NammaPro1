/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to make API calls to NammaPro backend server
const API_BASE = "";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("nammapro_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Something went wrong");
  }

  return response.json();
}
