export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        status: false,
        error: "Method not allowed"
      });
    }

    const { link, apikey } = req.query;

    if (!link) {
      return res.status(400).json({
        status: false,
        error: "Missing link parameter"
      });
    }

    const key = apikey || process.env.BNW_API_KEY;

    if (!key) {
      return res.status(401).json({
        status: false,
        error: "API key not configured"
      });
    }

    const apiUrl =
      `https://zero-two-apis.store/api/canvas/bnw?link=${encodeURIComponent(link)}&apikey=${encodeURIComponent(key)}`;

    const response = await fetch(apiUrl);

    const contentType = response.headers.get("content-type") || "";

    const body = await response.text();

    res.status(response.status);

    if (contentType.includes("application/json")) {
      try {
        return res.json(JSON.parse(body));
      } catch {
        return res.send(body);
      }
    }

    return res.send(body);

  } catch (error) {
    return res.status(500).json({
      status: false,
      error: "Proxy error",
      message: error.message
    });
  }
}
