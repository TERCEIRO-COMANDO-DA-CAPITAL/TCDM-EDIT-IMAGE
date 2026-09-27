import sharp from "sharp";

export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                error: "Use GET."
            });
        }

        const url = req.query.url;
        const amount = req.query.amount;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: "Informe ?url=URL_DA_IMAGEM"
            });
        }

        if (amount === undefined) {
            return res.status(400).json({
                success: false,
                error: "Informe ?amount=VALOR"
            });
        }

        const saturation = Number(amount);

        if (
            !Number.isFinite(saturation) ||
            saturation < 0 ||
            saturation > 10
        ) {
            return res.status(400).json({
                success: false,
                error: "Amount deve ser um número entre 0 e 10."
            });
        }

        let imageUrl;

        try {
            imageUrl = new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                error: "A URL da imagem é inválida."
            });
        }

        if (
            imageUrl.protocol !== "http:" &&
            imageUrl.protocol !== "https:"
        ) {
            return res.status(400).json({
                success: false,
                error: "A URL precisa começar com http:// ou https://."
            });
        }

        const response = await fetch(imageUrl.toString());

        if (!response.ok) {
            return res.status(400).json({
                success: false,
                error: "Não foi possível acessar a imagem.",
                status: response.status
            });
        }

        const input = Buffer.from(
            await response.arrayBuffer()
        );

        if (!input.length) {
            return res.status(400).json({
                success: false,
                error: "A imagem recebida está vazia."
            });
        }

        let output;

        try {
            output = await sharp(input)
                .modulate({
                    saturation: saturation
                })
                .png()
                .toBuffer();
        } catch {
            return res.status(400).json({
                success: false,
                error: "O conteúdo recebido não é uma imagem válida."
            });
        }

        res.setHeader(
            "Content-Type",
            "image/png"
        );

        res.setHeader(
            "Cache-Control",
            "public, max-age=300"
        );

        res.setHeader(
            "Content-Length",
            output.length
        );

        return res.status(200).send(output);

    } catch (error) {
        console.error("SATURATION ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Erro interno ao aumentar a saturação.",
            details: error.message
        });
    }
}

Exemplos

/api/saturation?url=https://site.com/foto.jpg&amount=1

Original.

/api/saturation?url=https://site.com/foto.jpg&amount=2

2× a saturação.

/api/saturation?url=https://site.com/foto.jpg&amount=3

Cores bem mais fortes.

/api/saturation?url=https://site.com/foto.jpg&amount=0

Sem saturação, ficando em escala de cinza.

O bom aqui é que ele não depende da extensão ".jpg" ou ".png". Ele baixa os bytes e deixa o Sharp identificar/processar a imagem, evitando aquele pequeno circo de URLs que dizem ser imagem mas entregam HTML.
