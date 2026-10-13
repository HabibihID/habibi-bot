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
        const code = match[1]
        try {
            // Cek dulu info grup — kalau butuh approval admin, kasih tau
            try {
                const info = await client.group.queryGroupInviteInfo(code)
                if (info.membershipApprovalEnabled) {
                    await client.message.send(
                        chatJid,
                        `⚠️ Grup *${info.subject || ''}* membutuhkan persetujuan admin.\n` +
                        `Bot tidak bisa join otomatis — minta admin invite manual.`
                    )
                    return
                }
            } catch {}
            const meta = await client.group.joinGroupViaInvite(code)
            await client.message.send(
                chatJid,
                `✅ Berhasil join grup: *${meta.subject || meta.jid}*`
            )
        } catch (e) {
            // Error "expected <group>" biasanya = grup butuh approval / link bermasalah
            let msg = e.message
            if (msg.includes('expected <group>')) {
                msg = 'Grup tidak bisa di-join otomatis (kemungkinan butuh persetujuan admin atau link tidak valid).'
            }
            await client.message.send(chatJid, `❌ Gagal join: ${msg}`)
        }
    }
}
