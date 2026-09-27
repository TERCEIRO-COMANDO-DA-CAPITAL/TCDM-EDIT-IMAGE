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

        if (amount === undefined || amount === "") {
            return res.status(400).json({
                success: false,
                error: "Informe ?amount=VALOR"
            });
        }

        const saturation = Number(
            String(amount).replace(",", ".")
        );

        if (
            !Number.isFinite(saturation) ||
            saturation < 0 ||
            saturation > 10
        ) {
            return res.status(400).json({
                success: false,
                error: "Amount deve ser um número entre 0 e 10.",
                received: amount
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
                error: "A URL precisa usar http ou https."
            });
        }

        const response = await fetch(imageUrl.toString(), {
            method: "GET",
            redirect: "follow",
            headers: {
                "User-Agent": "Mozilla/5.0 TCDM-Image-API"
            }
        });

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

        } catch (error) {
            console.error(
                "SHARP ERROR:",
                error
            );

            return res.status(400).json({
                success: false,
                error: "Não foi possível processar esta imagem.",
                details: error.message
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
        console.error(
            "SATURATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Erro interno na API de saturação.",
            details: error.message
        });
    }
}

Seu BDFD continua assim

$httpGet[https://tcdm-edit-image.vercel.app/api/saturation?url=$url[encode;$input[url]]&amount=$input[amount]]

E o link da imagem:

https://tcdm-edit-image.vercel.app/api/saturation?url=$url[encode;$input[url]]&amount=$input[amount]

O que mudou

- Aceita "2" normalmente.
- Aceita "2.5".
- Aceita "2,5".
- Segue redirecionamentos.
- Envia "User-Agent", ajudando com alguns CDNs.
- Se o Sharp rejeitar a imagem, agora retorna 400 com o erro real, em vez de transformar o problema em "500".
- Continua usando "0" até "10".
- Continua retornando PNG.

O Sharp documenta "saturation" como um multiplicador, então "1" mantém a saturação, "2" duplica e "0" remove a saturação.

Se depois desse código aparecer outro erro, o campo "details" vai entregar exatamente o motivo. Finalmente teremos uma pista em vez do clássico "500: parabéns, nada explica nada".
