const { isGroup } = require('../lib/helper')

module.exports = {
    name: 'tagall',
    description: 'Tag semua member grup',
    async run({ client, chatJid, args }) {
        if (!isGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Perintah ini cuma bisa dipakai di grup.')
            return
        }
        const meta = await client.group.queryGroupMetadata(chatJid)
        const participants = meta.participants || []
        if (!participants.length) {
            await client.message.send(chatJid, '❌ Gagal ambil daftar member.')
            return
        }
        const jids = participants.map((p) => p.jid || p.id).filter(Boolean)
        const extra = args.join(' ')
        let text = `📢 *TAG ALL* (${jids.length} member)\n`
        if (extra) text += `Pesan: ${extra}\n`
        text += '\n' + jids.map((j) => `@${j.split('@')[0]}`).join(' ')
        await client.message.send(chatJid, {
            type: 'text',
            text,
            contextInfo: { mentionedJid: jids }
        })
    }
}
