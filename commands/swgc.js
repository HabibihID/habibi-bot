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
                `*SWGC (eksperimental)*\n\nCara pakai:\n.swgc <pesan>\nKirim gambar + caption .swgc <pesan>\n.swgc stop`
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

        // Download gambar kalau ada
        let imageBuf = null
        if (imageMsg) {
            try {
                imageBuf = await downloadMediaMessage({
                    message: { imageMessage: imageMsg },
                    key: event.key
                })
            } catch (e) {
                await client.message.send(chatJid, `❌ Gagal download gambar: ${e.message}`)
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
                if (imageBuf) {
                    // Untuk gambar: kirim sebagai image biasa dulu, lalu bungkus
                    // (upload via pipeline normal, lalu wrap hasilnya)
                    // Fallback: kirim teks saja kalau gambar gagal
                    inner = { imageMessage: { caption: text || '' } }
                    // NOTE: upload media manual belum didukung di path ini
                    throw new Error('SWGC gambar belum didukung, pakai teks saja')
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
