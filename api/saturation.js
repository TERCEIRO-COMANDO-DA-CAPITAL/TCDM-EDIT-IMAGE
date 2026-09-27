import sharp from "sharp";

export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                error: "Use GET."
            });
        }

        const { url, amount } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: "Informe ?url=URL_DA_IMAGEM"
            });
        }

        if (!amount) {
            return res.status(400).json({
                success: false,
                error: "Informe ?amount=VALOR"
            });
        }

        const saturation = Number(amount);

        if (!Number.isFinite(saturation)) {
            return res.status(400).json({
                success: false,
                error: "Amount inválido."
            });
        }

        if (saturation < 0 || saturation > 10) {
            return res.status(400).json({
                success: false,
                error: "Amount deve estar entre 0 e 10."
            });
        }

        const imageUrl = new URL(url);

        if (
            imageUrl.protocol !== "http:" &&
            imageUrl.protocol !== "https:"
        ) {
            return res.status(400).json({
                success: false,
                error: "URL inválida."
            });
        }

        const response = await fetch(imageUrl);

        if (!response.ok) {
            return res.status(400).json({
                success: false,
                error: "Não foi possível baixar a imagem.",
                status: response.status
            });
        }

        const buffer = Buffer.from(
            await response.arrayBuffer()
        );

        if (!buffer.length) {
            return res.status(400).json({
                success: false,
                error: "Imagem vazia."
            });
        }

        const output = await sharp(buffer)
            .modulate({
                saturation: saturation
            })
            .png()
            .toBuffer();

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=300");

        return res.status(200).send(output);

    } catch (error) {
        console.error("SATURATION:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
