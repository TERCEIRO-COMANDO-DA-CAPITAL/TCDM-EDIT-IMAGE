export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: "Use GET."
      });
    }

    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Informe ?url=URL_DA_IMAGEM"
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

    // Chave armazenada na Vercel
    const apiKey = process.env.REMOVEBG_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "REMOVEBG_API_KEY não configurada."
      });
    }

    // API verdadeira
    const apiUrl =
      "https://zero-two-apis.store/api/ia/removebg" +
      "?url=" + encodeURIComponent(imageUrl) +
      "&apikey=" + encodeURIComponent(apiKey);

    const response = await fetch(apiUrl);

    // Se a API retornar erro, não tenta tratar como PNG
    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        success: false,
        status: response.status,
        error: errorText.slice(0, 1000)
      });
    }

    // Tipo retornado pela API
    const contentType =
      response.headers.get("content-type") || "image/png";

    // Recebe o PNG diretamente
    const imageBuffer = Buffer.from(
      await response.arrayBuffer()
    );

    // Repassa o PNG para quem chamou nossa API
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      "public, max-age=300"
    );

    res.setHeader(
      "Content-Length",
      imageBuffer.length
    );

    return res.status(200).send(imageBuffer);

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erro interno na ponte.",
      details: error.message
    });
  }
}
