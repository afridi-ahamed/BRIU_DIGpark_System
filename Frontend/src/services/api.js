
const BASE_URL = 'http://127.0.0.1:8000';

function getToken() {
  return localStorage.getItem('parkingToken');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 204 No Content — no body to parse
  if (response.status === 204) return { ok: true };

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

// ── Authentication ──────────────────────────────────────────
export async function loginUser(username, password) {
  return request('/api/user/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// ── University Member Verification ──────────────────────────
export async function verifyUniversityMember(universityId) {
  return request(`/api/users/verify/${universityId}/`);
}

export async function getUniversityMembers() {
  return request('/api/users/members/');
}

export async function createMemberAccount(data) {
  return request('/api/user/create-member-account/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Parking Lots ─────────────────────────────────────────────
export async function getAllParkingLots() {
  return request('/api/parkings/get-all-lots/');
}

export async function createParkingLot(data) {
  return request('/api/parkings/create-lot/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateParkingLot(pk, data) {
  return request(`/api/parking/update-lot/${pk}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteParkingLot(pk) {
  return request(`/api/parking/delete-lot/${pk}/`, { method: 'DELETE' });
}

// ── Bookings ─────────────────────────────────────────────────
export async function getAllBookings() {
  return request('/api/parkings/get-all-bookings/');
}

export async function createBooking(data) {
  return request('/api/parkings/create-booking/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBooking(pk, data) {
  return request(`/api/parking/update-booking/${pk}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function cancelBooking(pk) {
  return request(`/api/parking/delete-booking/${pk}/`, { method: 'DELETE' });
}

// ── Vehicle Exit ─────────────────────────────────────────────
export async function exitVehicle(exitToken) {
  return request('/api/parking/exit-vehicle/', {
    method: 'POST',
    body: JSON.stringify({ exit_token: exitToken }),
  });
}

// ── Staff Management ─────────────────────────────────────────
export async function getAllStaff() {
  return request('/api/users/get-all-staff/');
}

export async function createStaff(data) {
  return request('/api/user/create-staff/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStaff(pk, data) {
  return request(`/api/user/update-staff/${pk}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteStaff(pk) {
  return request(`/api/user/delete-staff/${pk}/`, { method: 'DELETE' });
}
