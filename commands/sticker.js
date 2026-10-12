const { downloadMediaMessage } = require('@habibicox10/zapo-id')

module.exports = {
    name: 'sticker',
    description: 'Bikin stiker dari gambar (reply/kirim gambar dengan caption)',
    async run({ client, chatJid, event }) {
        const msg = event.message
        // Cari imageMessage: langsung atau dari quoted
        let imageMsg = msg?.imageMessage || null
        const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage
        if (!imageMsg && quoted?.imageMessage) imageMsg = quoted.imageMessage

        if (!imageMsg) {
            await client.message.send(
                chatJid,
                '❌ Kirim/reply gambar dengan caption *.sticker*'
            )
            return
        }

        await client.message.send(chatJid, '⏳ Bikin stiker...')
        try {
            const webp = await downloadMediaMessage(
                { message: { imageMessage: imageMsg }, key: event.key },
                { asSticker: true }
            ).catch(() => null)

            // Fallback: kirim sebagai image biasa kalau konversi gagal
            if (!webp) {
                const buf = await downloadMediaMessage({
                    message: { imageMessage: imageMsg },
                    key: event.key
                })
                await client.message.send(chatJid, {
                    type: 'image',
                    media: buf,
                    mimetype: 'image/jpeg',
                    caption: '⚠️ Gagal jadi stiker, kirim sebagai gambar.'
                })
                return
            }

            await client.message.send(chatJid, {
                type: 'sticker',
                media: webp,
                mimetype: 'image/webp'
            })
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal bikin stiker: ${e.message}`)
        }
    }
}
