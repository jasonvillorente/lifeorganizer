export const checkRes = async (res: Response) => {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Server error: ${res.status}`);
    }
    return data;
  } else {
    const text = await res.text();
    console.error(`Non-JSON response from ${res.url} (${res.status}):`, text);
    throw new Error(`Server error: ${res.status}. The server returned an unexpected response format.`);
  }
};
