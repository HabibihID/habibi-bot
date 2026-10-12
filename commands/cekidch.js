// cekidch — cek ID channel dari link
// .cekidch <link_channel> atau .cekidch <id@newsletter>
module.exports = {
    name: 'cekidch',
    description: 'Cek ID channel WhatsApp',
    async run({ client, chatJid, args }) {
        const input = args[0]
        if (!input) {
            await client.message.send(
                chatJid,
                `*CEK ID CHANNEL*\n\nCara pakai:\n.cekidch <link_channel>\n.cekidch <id@newsletter>\n\nContoh:\n.cekidch https://whatsapp.com/channel/AbCdEf`
            )
            return
        }

        try {
            let meta
            if (input.includes('whatsapp.com/channel/')) {
                const code = input.split('whatsapp.com/channel/')[1].trim().split(/\s+/)[0]
                meta = await client.newsletter.fetchByInvite(code)
            } else if (input.endsWith('@newsletter')) {
                meta = await client.newsletter.fetchMetadata(input)
            } else {
                await client.message.send(chatJid, '❌ Link atau ID tidak valid.')
                return
            }

            await client.message.send(
                chatJid,
                `📢 *INFO CHANNEL*\n\n` +
                `Nama: *${meta.name || '-'}*\n` +
                `ID: \`${meta.jid}\`\n` +
                `Followers: ${meta.subscribersCount ?? '?'}\n` +
                `Verified: ${meta.verification === 'VERIFIED' ? '✅' : '❌'}`
            )
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal ambil info channel: ${e.message}`)
        }
    }
}
