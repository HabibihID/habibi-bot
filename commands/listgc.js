// listgc — daftar semua grup yang diikuti bot
module.exports = {
    name: 'listgc',
    description: 'Lihat daftar grup bot',
    async run({ client, chatJid }) {
        let groups
        try {
            groups = await client.group.queryAllGroups()
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal ambil daftar grup: ${e.message}`)
            return
        }
        const list = (groups || []).filter((g) => g.jid?.endsWith('@g.us'))
        if (!list.length) {
            await client.message.send(chatJid, '❌ Bot belum ikut grup manapun.')
            return
        }

        const terbuka = list.filter((g) => !g.announce).length
        const tertutup = list.filter((g) => g.announce).length
        const sorted = [...list].sort((a, b) => (b.size || 0) - (a.size || 0))

        let msg = `╭───❰ *GROUP LIST* ❱\n`
        msg += `│ Total : *${list.length}* grup\n`
        msg += `│ Terbuka : *${terbuka}* grup\n`
        msg += `│ Tertutup : *${tertutup}* grup\n`
        msg += `╰───────────❱\n\n*Detail:*\n`

        sorted.forEach((g, i) => {
            const status = g.announce ? '🔒 TERTUTUP' : '🟢 TERBUKA'
            msg += `\n◆ *${i + 1}. ${g.subject || 'Tanpa Nama'}*\n`
            msg += `┇ ID: ${g.jid}\n`
            msg += `┇ Anggota: ${g.size || '?'} | ${status}\n`
        })

        // Potong kalau kepanjangan (limit WA ~65k char, aman di 6000)
        if (msg.length > 6000) msg = msg.slice(0, 6000) + '\n\n... (dipotong)'

        await client.message.send(chatJid, msg)
    }
}
