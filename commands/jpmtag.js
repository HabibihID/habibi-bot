// jpmtag — broadcast ke semua grup + tag semua member
// .jpmtag <pesan> | .jpmtag stop
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

let running = false
let stopped = false

module.exports = {
    name: 'jpmtag',
    description: 'Broadcast + tag semua member di tiap grup',
    async run({ client, chatJid, args }) {
        const sub = (args[0] || '').toLowerCase()

        if (sub === 'stop') {
            if (!running) {
                await client.message.send(chatJid, 'JPMTag tidak sedang berjalan.')
                return
            }
            stopped = true
            await client.message.send(chatJid, '🛑 Menghentikan JPMTag...')
            return
        }

        if (running) {
            await client.message.send(chatJid, '⚠️ JPMTag sudah berjalan.')
            return
        }

        const text = args.join(' ').trim()
        if (!text) {
            await client.message.send(
                chatJid,
                `*JPMTAG*\n\nCara pakai:\n.jpmtag <pesan>\n.jpmtag stop`
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

        running = true
        stopped = false
        let sukses = 0, gagal = 0
        await client.message.send(chatJid, `📢 JPMTag dimulai! Target: *${targets.length}* grup`)

        for (let i = 0; i < targets.length; i++) {
            if (stopped) break
            const g = targets[i]
            try {
                // Ambil member grup
                const meta = await client.group.queryGroupMetadata(g.jid)
                const jids = (meta.participants || []).map((p) => p.jid || p.id).filter(Boolean)
                const tagText = jids.map((j) => `@${j.split('@')[0]}`).join(' ')
                await client.message.send(g.jid, {
                    type: 'text',
                    text: `${text}\n\n${tagText}`,
                    contextInfo: { mentionedJid: jids }
                })
                sukses++
            } catch (e) {
                gagal++
            }
            if (i < targets.length - 1) await delay(4000)
        }

        running = false
        await client.message.send(
            chatJid,
            `✅ JPMTag ${stopped ? 'dihentikan' : 'selesai'}!\nBerhasil: *${sukses}*\nGagal: *${gagal}*`
        )
    }
}
