// joingc — join grup via link invite
// .joingc <link_grup>
module.exports = {
    name: 'joingc',
    description: 'Join grup via link',
    async run({ client, chatJid, args }) {
        const link = args[0]
        if (!link) {
            await client.message.send(
                chatJid,
                `*JOIN GRUP*\n\nCara pakai:\n.joingc <link_grup>\n\nContoh:\n.joingc https://chat.whatsapp.com/AbCdEfGh`
            )
            return
        }
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) {
            await client.message.send(chatJid, '❌ Link invite tidak valid.')
            return
        }
        try {
            const meta = await client.group.joinGroupViaInvite(match[1])
            await client.message.send(
                chatJid,
                `✅ Berhasil join grup: *${meta.subject || meta.jid}*`
            )
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal join: ${e.message}`)
        }
    }
}
