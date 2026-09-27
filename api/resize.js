import sharp from "sharp";

export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                error: "Use GET."
            });
        }

        const {
            url,
            width,
            height,
            format = "png"
        } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: "Informe ?url=URL_DA_IMAGEM"
            });
        }

        if (!width || !height) {
            return res.status(400).json({
                success: false,
                error: "Informe width e height."
            });
        }

        const w = Number(width);
        const h = Number(height);

        if (
            !Number.isInteger(w) ||
            !Number.isInteger(h) ||
            w < 1 ||
            h < 1 ||
            w > 9999 ||
            h > 9999
        ) {
            return res.status(400).json({
                success: false,
                error: "Width e height devem estar entre 1 e 9999."
            });
        }

        let imageUrl;

        try {
            imageUrl = new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                error: "URL da imagem inválida."
            });
        }

        if (
            imageUrl.protocol !== "http:" &&
            imageUrl.protocol !== "https:"
        ) {
            return res.status(400).json({
                success: false,
                error: "A URL precisa usar HTTP ou HTTPS."
            });
        }

        const response = await fetch(imageUrl);

        if (!response.ok) {
            return res.status(400).json({
                success: false,
                error: "Não foi possível obter a imagem.",
                status: response.status
            });
        }

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.startsWith("image/")) {
            return res.status(400).json({
                success: false,
                error: "A URL não retornou uma imagem."
            });
        }

        const input = Buffer.from(
            await response.arrayBuffer()
        );

        let image = sharp(input).resize({
            width: w,
            height: h,
            fit: "fill"
        });

        switch (format.toLowerCase()) {

            case "png":
                image = image.png();

                res.setHeader(
                    "Content-Type",
                    "image/png"
                );
                break;

            case "jpg":
            case "jpeg":
                image = image.jpeg({
                    quality: 85
                });

                res.setHeader(
                    "Content-Type",
                    "image/jpeg"
                );
                break;

            case "webp":
                image = image.webp({
                    quality: 85
                });

                res.setHeader(
                    "Content-Type",
                    "image/webp"
                );
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: "Formato inválido. Use png, jpg ou webp."
                });
        }

        const output = await image.toBuffer();

        res.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable"
        );

        res.setHeader(
            "Content-Length",
            output.length
        );

        return res.status(200).send(output);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            error: "Erro ao processar a imagem."
        });
    }
              }
