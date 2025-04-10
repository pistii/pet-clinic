let isRefreshing = false;
let refreshPromise = null;
async function fetchWithAuth(url, {
    method = "GET",
    data = null,
    isFormData = false,
    headers = {},
    _retry = false,
  } = {}) {
    const accessToken = localStorage.getItem("access_token");
  
    const finalHeaders = {
        ...headers,
        Authorization: `Bearer ${accessToken}`
    }

    if (!isFormData && data) {
      finalHeaders["Content-Type"] = "application/json";
    }
  
    const options = {
      method,
      headers: finalHeaders,
    };
  
    if (data) {
      options.body = isFormData ? data : JSON.stringify(data);
    }
    
    let response = await fetch(SERVER_URL + url, options);

    // Token expired? Refresh and retry once
    if (response.status === 401 && !_retry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        localStorage.setItem("access_token", newToken);
        return fetchWithAuth(url, {
          method,
          data,
          isFormData,
          headers,
          _retry: true,
        });
      }
    }
  
    return response;
  }
  
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");
  
    try {
      const res = await fetch(SERVER_URL + "/api/users/refresh", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${refreshToken}`
        },
      });

      if (res.ok) {
        const data = await res.json();
        return data.access_token;
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
    
    localStorage.clear();
    window.location.replace("/");
    return null;
  }
  