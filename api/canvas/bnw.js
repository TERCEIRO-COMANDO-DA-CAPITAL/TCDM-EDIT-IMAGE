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

    // Valida a URL recebida
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

    // Usa a MESMA variável de ambiente da API RemoveBG
    const apiKey = process.env.REMOVEBG_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "REMOVEBG_API_KEY não configurada."
      });
    }

    // API BNW verdadeira
    const apiUrl =
      "https://zero-two-apis.store/api/canvas/bnw" +
      "?link=" + encodeURIComponent(imageUrl) +
      "&apikey=" + encodeURIComponent(apiKey);

    const response = await fetch(apiUrl);

    const contentType =
      response.headers.get("content-type") || "";

    const body = await response.arrayBuffer();

    // Repassa o status original
    res.status(response.status);

    // Repassa o Content-Type original
    res.setHeader(
      "Content-Type",
      contentType || "application/octet-stream"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=300"
    );

    res.setHeader(
      "Content-Length",
      body.byteLength
    );

    return res.send(Buffer.from(body));

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erro interno na ponte.",
      details: error.message
    });
  }
}
