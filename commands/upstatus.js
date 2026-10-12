// upstatus — posting ke WhatsApp Status/Story bot
// .upstatus <teks> | kirim gambar/video + caption .upstatus <teks>
const { downloadMediaMessage } = require('@habibicox10/zapo-id')
const { findImage, findVideo, streamToBuffer } = require('../lib/helper')

module.exports = {
    name: 'upstatus',
    description: 'Posting ke Status WhatsApp',
    async run({ client, chatJid, args, event }) {
        const text = args.join(' ').trim()
        const imageMsg = findImage(event.message)
        const videoMsg = findVideo(event.message)

        if (!text && !imageMsg && !videoMsg) {
            await client.message.send(
                chatJid,
                `*UPSTATUS*\n\nCara pakai:\n.upstatus <teks>\nKirim gambar/video + caption .upstatus <teks>`
            )
            return
        }

        try {
            let content
            if (imageMsg) {
                await client.message.send(chatJid, '⏳ Upload gambar...')
                const stream = await downloadMediaMessage({ imageMessage: imageMsg })
                const buf = await streamToBuffer(stream)
                content = { type: 'image', media: buf, mimetype: 'image/jpeg', caption: text || '' }
            } else if (videoMsg) {
                await client.message.send(chatJid, '⏳ Upload video...')
                const stream = await downloadMediaMessage({ videoMessage: videoMsg })
                const buf = await streamToBuffer(stream)
                content = { type: 'video', media: buf, mimetype: 'video/mp4', caption: text || '' }
            } else {
                content = text
            }

            // recipients kosong = ikut privacy setting status
            await client.status.send({ content, recipients: [] })
            await client.message.send(chatJid, '✅ Status terposting!')
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal posting status: ${e.message}`)
        }
    }
}
