export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: "Use GET."
      });
    }

    const imageUrl = req.query.link;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Informe ?link=URL_DA_IMAGEM"
      });
    }

    try {
      const parsed = new URL(imageUrl);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error();
      }
    } catch {
      return res.status(400).json({
        success: false,
        error: "A URL informada é inválida."
      });
    }

    const apiKey = process.env.REMOVEBG_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "REMOVEBG_API_KEY não configurada."
      });
    }

    const apiUrl =
      "https://zero-two-apis.store/api/canvas/bnw" +
      "?link=" + encodeURIComponent(imageUrl) +
      "&apikey=" + encodeURIComponent(apiKey);

    const response = await fetch(apiUrl);

    const contentType =
      response.headers.get("content-type") || "";

    const body = await response.text();

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        external_status: response.status,
        external_content_type: contentType,
        external_response: body.slice(0, 2000),
        external_url: apiUrl.replace(
          encodeURIComponent(apiKey),
          "***"
        )
      });
    }

    res.status(200);

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=300"
    );

    return res.send(body);

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erro interno na ponte.",
      details: error.message
    });
  }
}
