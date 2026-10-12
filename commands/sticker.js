const { downloadMediaMessage } = require('@habibicox10/zapo-id')
const { findImage, streamToBuffer } = require('../lib/helper')

module.exports = {
    name: 'sticker',
    description: 'Bikin stiker dari gambar (reply/kirim gambar dengan caption)',
    async run({ client, chatJid, event }) {
        const imageMsg = findImage(event.message)

        if (!imageMsg) {
            await client.message.send(
                chatJid,
                '❌ Kirim/reply gambar dengan caption *.sticker*'
            )
            return
        }

        await client.message.send(chatJid, '⏳ Bikin stiker...')
        try {
            // Coba konversi jadi stiker WebP
            let webp = null
            try {
                const stream = await downloadMediaMessage(
                    { imageMessage: imageMsg },
                    { asSticker: true }
                )
                webp = await streamToBuffer(stream)
            } catch {
                webp = null
            }

            // Fallback: kirim sebagai gambar biasa kalau konversi gagal
            if (!webp) {
                const stream = await downloadMediaMessage({ imageMessage: imageMsg })
                const buf = await streamToBuffer(stream)
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
