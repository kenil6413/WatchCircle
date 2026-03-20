async function request(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload;
}

export function signupUser(formData) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function getCurrentUser() {
  return request("/api/auth/session");
}

export function loginUser(formData) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function logoutUser() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export function changePassword(formData) {
  return request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function getGroups() {
  return request("/api/groups");
}

export function createGroup(formData) {
  return request("/api/groups", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function updateGroup(groupId, formData) {
  return request(`/api/groups/${encodeURIComponent(groupId)}`, {
    method: "PUT",
    body: JSON.stringify(formData),
  });
}

export function leaveGroup(groupId) {
  return request(`/api/groups/${encodeURIComponent(groupId)}/leave`, {
    method: "POST",
  });
}

export function deleteGroup(groupId) {
  return request(`/api/groups/${encodeURIComponent(groupId)}`, {
    method: "DELETE",
  });
}

export function joinGroup(formData) {
  return request("/api/groups/join", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function addRecommendation(groupId, formData) {
  return request(`/api/groups/${encodeURIComponent(groupId)}/recommendations`, {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function removeRecommendation(groupId, recommendationId) {
  return request(
    `/api/groups/${encodeURIComponent(groupId)}/recommendations/${encodeURIComponent(recommendationId)}`,
    {
      method: "DELETE",
    }
  );
}

export function voteRecommendation(groupId, recommendationId, direction) {
  return request(
    `/api/groups/${encodeURIComponent(groupId)}/recommendations/${encodeURIComponent(recommendationId)}/vote`,
    {
      method: "POST",
      body: JSON.stringify({ direction }),
    }
  );
}

export function addRecommendationComment(groupId, recommendationId, text) {
  return request(
    `/api/groups/${encodeURIComponent(groupId)}/recommendations/${encodeURIComponent(recommendationId)}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    }
  );
}

export function searchMediaTitles(query, category) {
  const params = new URLSearchParams({
    q: query,
    category,
  });

  return request(`/api/media/search?${params.toString()}`);
}

export function removeGroupMember(groupId, memberUserId) {
  return request(
    `/api/groups/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberUserId)}`,
    {
      method: "DELETE",
    }
  );
}

export function getWatchlist() {
  return request("/api/watchlist");
}

export function getWatchlistStats() {
  return request("/api/watchlist/stats");
}

export function createWatchlistItem(formData) {
  return request("/api/watchlist", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function updateWatchlistItem(itemId, formData) {
  return request(`/api/watchlist/${encodeURIComponent(itemId)}`, {
    method: "PUT",
    body: JSON.stringify(formData),
  });
}

export function deleteWatchlistItem(itemId) {
  return request(`/api/watchlist/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });
}
