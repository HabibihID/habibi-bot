// cekidgc — cek ID grup dari link invite
// .cekidgc <link_grup>
module.exports = {
    name: 'cekidgc',
    description: 'Cek ID grup dari link',
    async run({ client, chatJid, args }) {
        const link = args[0]
        if (!link) {
            await client.message.send(
                chatJid,
                `*CEK ID GRUP*\n\nCara pakai:\n.cekidgc <link_grup>\n\nContoh:\n.cekidgc https://chat.whatsapp.com/AbCdEfGh`
            )
            return
        }

        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) {
            await client.message.send(chatJid, '❌ Link invite tidak valid.')
            return
        }

        try {
            const info = await client.group.queryGroupInviteInfo(match[1])
            await client.message.send(
                chatJid,
                `👥 *INFO GRUP*\n\n` +
                `Nama: *${info.subject || '-'}*\n` +
                `ID: \`${info.jid}\`\n` +
                `Member: ${info.size ?? '?'}`
            )
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal ambil info: ${e.message}`)
        }
    }
}
