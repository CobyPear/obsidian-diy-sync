export const refreshToken = async (url: string, username: string) => {
  const res = await fetch(`${url}/api/refresh_token`, {
    method: "POST",
    body: JSON.stringify({
      username,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    console.log("data", data);
  }
};
