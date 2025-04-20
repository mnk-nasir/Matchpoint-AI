export function getAccessToken(): string | null {
  try {
    return (
      localStorage.getItem('mp_access_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('jwt') ||
      null
    );
  } catch {
    return null;
  }
}

export function setAccessToken(token: string) {
  try {
    localStorage.setItem('mp_access_token', token);
  } catch {
    // ignore
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access');
    localStorage.removeItem('jwt');
    localStorage.removeItem('mp_access_token');
  } catch {
    // ignore
  }
}
export function getRefreshToken(): string | null {
  try {
    return (
      localStorage.getItem('mp_refresh_token') ||
      localStorage.getItem('refresh_token') ||
      localStorage.getItem('refresh') ||
      null
    );
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string) {
  try {
    localStorage.setItem('mp_refresh_token', token);
  } catch {
  }
}

export function clearRefreshToken() {
  try {
    localStorage.removeItem('mp_refresh_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
  } catch {
  }
}
