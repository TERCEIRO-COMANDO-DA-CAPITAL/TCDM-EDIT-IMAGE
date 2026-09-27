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

    const apiKey = process.env.REMOVEBG_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "REMOVEBG_API_KEY não configurada."
      });
    }

    const apiUrl =
      "https://zero-two-apis.store/api/canvas/invert" +
      "?link=" + encodeURIComponent(imageUrl) +
      "&apikey=" + encodeURIComponent(apiKey);

    const response = await fetch(apiUrl);

    const contentType =
      response.headers.get("content-type") ||
      "application/octet-stream";

    const body = await response.arrayBuffer();

    res.status(response.status);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", body.byteLength);

    return res.send(Buffer.from(body));

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erro interno na ponte.",
      details: error.message
    });
  }
}
