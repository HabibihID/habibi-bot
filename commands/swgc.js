// swgc — kirim pesan model "status grup" ke semua grup (EKSPERIMENTAL)
// .swgc <pesan> | kirim gambar + caption .swgc <pesan> | .swgc stop
//
// Cara kerja: bungkus pesan dalam protobuf groupStatusMessageV2,
// lalu kirim via client.message.send() sebagai raw IMessage.
const crypto = require('node:crypto')
const { downloadMediaMessage } = require('@habibicox10/zapo-id')

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

let running = false
let stopped = false

// Bungkus konten jadi groupStatusMessageV2
function wrapGroupStatus(innerMessage) {
    const messageSecret = crypto.randomBytes(32)
    return {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: {
            message: {
                ...innerMessage,
                messageContextInfo: { messageSecret }
            }
        }
    }
}

module.exports = {
    name: 'swgc',
    description: 'Kirim status ke semua grup (eksperimental)',
    async run({ client, chatJid, args, event }) {
        const sub = (args[0] || '').toLowerCase()

        if (sub === 'stop') {
            if (!running) {
                await client.message.send(chatJid, 'SWGC tidak sedang berjalan.')
                return
            }
            stopped = true
            await client.message.send(chatJid, '🛑 Menghentikan SWGC...')
            return
        }

        if (running) {
            await client.message.send(chatJid, '⚠️ SWGC sudah berjalan.')
            return
        }

        const text = args.join(' ').trim()

        // Cek gambar: langsung atau quoted
        const msg = event.message
        let imageMsg = msg?.imageMessage || null
        const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage
        if (!imageMsg && quoted?.imageMessage) imageMsg = quoted.imageMessage

        if (!text && !imageMsg) {
            await client.message.send(
                chatJid,
                `*SWGC*\n\nCara pakai:\n.swgc <pesan>\nKirim gambar/video + caption .swgc <pesan>\n.swgc stop`
            )
            return
        }

        let groups
        try {
            groups = await client.group.queryAllGroups()
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal ambil grup: ${e.message}`)
            return
        }
        const targets = (groups || []).filter((g) => g.jid?.endsWith('@g.us'))
        if (!targets.length) {
            await client.message.send(chatJid, '❌ Tidak ada grup.')
            return
        }

        // Download media kalau ada (gambar/video)
        let mediaBuf = null
        let mediaType = null // 'image' | 'video'
        const videoMsg = msg?.videoMessage || quoted?.videoMessage
        if (imageMsg) {
            mediaType = 'image'
        } else if (videoMsg) {
            mediaType = 'video'
        }

        if (mediaType) {
            try {
                await client.message.send(chatJid, '⏳ Upload media...')
                const dlMsg = mediaType === 'image'
                    ? { imageMessage: imageMsg }
                    : { videoMessage: videoMsg }
                mediaBuf = await downloadMediaMessage({ message: dlMsg, key: event.key })
            } catch (e) {
                await client.message.send(chatJid, `❌ Gagal download media: ${e.message}`)
                return
            }
        }

        running = true
        stopped = false
        let sukses = 0, gagal = 0
        await client.message.send(
            chatJid,
            `📢 SWGC dimulai! Target: *${targets.length}* grup\n⚠️ Fitur eksperimental`
        )

        for (let i = 0; i < targets.length; i++) {
            if (stopped) break
            const g = targets[i]
            try {
                let inner
                if (mediaBuf) {
                    // Upload ke server WA, lalu bikin protobuf manual
                    const mimetype = mediaType === 'image' ? 'image/jpeg' : 'video/mp4'
                    const upload = await client.message.upload(mediaBuf, {
                        type: mediaType,
                        mimetype
                    })
                    if (mediaType === 'image') {
                        inner = {
                            imageMessage: {
                                url: upload.url,
                                mimetype,
                                caption: text || '',
                                fileSha256: upload.fileSha256,
                                fileLength: upload.fileLength,
                                mediaKey: upload.mediaKey,
                                fileEncSha256: upload.fileEncSha256,
                                directPath: upload.directPath,
                                mediaKeyTimestamp: upload.mediaKeyTimestamp
                            }
                        }
                    } else {
                        inner = {
                            videoMessage: {
                                url: upload.url,
                                mimetype,
                                fileSha256: upload.fileSha256,
                                fileLength: upload.fileLength,
                                mediaKey: upload.mediaKey,
                                caption: text || '',
                                fileEncSha256: upload.fileEncSha256,
                                directPath: upload.directPath,
                                mediaKeyTimestamp: upload.mediaKeyTimestamp,
                                streamingSidecar: upload.streamingSidecar
                            }
                        }
                    }
                } else {
                    inner = { conversation: text }
                }
                const wrapped = wrapGroupStatus(inner)
                await client.message.send(g.jid, wrapped)
                sukses++
            } catch (e) {
                gagal++
                console.log(`[swgc] gagal ${g.jid}: ${e.message}`)
            }
            if (i < targets.length - 1) await delay(4000)
        }

        running = false
        await client.message.send(
            chatJid,
            `✅ SWGC ${stopped ? 'dihentikan' : 'selesai'}!\nBerhasil: *${sukses}*\nGagal: *${gagal}*`
        )
    }
}
