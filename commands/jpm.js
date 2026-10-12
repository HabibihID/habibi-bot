// JPM — broadcast pesan ke semua grup
// .jpm <teks> | kirim gambar + caption .jpm <teks> | .jpm stop
const { downloadMediaMessage } = require('@habibicox10/zapo-id')
const { isGroup } = require('../lib/helper')

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// State global (1 sesi dalam satu waktu)
let running = false
let stopped = false

module.exports = {
    name: 'jpm',
    description: 'Broadcast pesan ke semua grup',
    async run({ client, chatJid, args, event }) {
        const sub = (args[0] || '').toLowerCase()

        // ── STOP ──
        if (sub === 'stop') {
            if (!running) {
                await client.message.send(chatJid, 'JPM tidak sedang berjalan.')
                return
            }
            stopped = true
            await client.message.send(chatJid, '🛑 Sinyal stop dikirim, menghentikan JPM...')
            return
        }

        if (running) {
            await client.message.send(chatJid, '⚠️ JPM sudah berjalan. Kirim *.jpm stop* untuk hentikan.')
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
                `*Cara pakai JPM:*\n` +
                `• *.jpm <pesan>* — kirim teks ke semua grup\n` +
                `• Kirim gambar + caption *.jpm <pesan>*\n` +
                `• *.jpm stop* — hentikan`
            )
            return
        }

        // Ambil semua grup
        let groups
        try {
            groups = await client.group.queryAllGroups()
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal ambil daftar grup: ${e.message}`)
            return
        }
        const targets = (groups || []).filter((g) => g.jid?.endsWith('@g.us'))
        if (!targets.length) {
            await client.message.send(chatJid, '❌ Tidak ada grup yang tersedia.')
            return
        }

        // Download gambar kalau ada
        let imageBuf = null
        if (imageMsg) {
            try {
                await client.message.send(chatJid, '⏳ Download gambar...')
                const stream = await downloadMediaMessage({ imageMessage: imageMsg })
                const chunks = []
                for await (const chunk of stream) chunks.push(chunk)
                imageBuf = Buffer.concat(chunks)
            } catch (e) {
                await client.message.send(chatJid, `❌ Gagal download gambar: ${e.message}`)
                return
            }
        }

        // Mulai broadcast
        running = true
        stopped = false
        let sukses = 0
        let gagal = 0
        await client.message.send(
            chatJid,
            `📢 JPM dimulai!\nTarget: *${targets.length}* grup\nJeda: 3 detik/grup`
        )

        for (let i = 0; i < targets.length; i++) {
            if (stopped) break
            const g = targets[i]
            try {
                if (imageBuf) {
                    await client.message.send(g.jid, {
                        type: 'image',
                        media: imageBuf,
                        mimetype: 'image/jpeg',
                        caption: text || ''
                    })
                } else {
                    await client.message.send(g.jid, text)
                }
                sukses++
            } catch (e) {
                gagal++
            }
            // Progress tiap 10 grup
            if ((i + 1) % 10 === 0 || i === targets.length - 1) {
                console.log(`[jpm] ${i + 1}/${targets.length} (ok:${sukses} fail:${gagal})`)
            }
            if (i < targets.length - 1) await delay(3000)
        }

        running = false
        const status = stopped ? 'dihentikan' : 'selesai'
        await client.message.send(
            chatJid,
            `✅ JPM ${status}!\nBerhasil: *${sukses}* grup\nGagal: *${gagal}* grup`
        )
    }
}
