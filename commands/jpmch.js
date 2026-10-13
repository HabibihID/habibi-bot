// jpmch — kirim pesan ke channel (newsletter)
// .jpmch <id@newsletter> <pesan>
module.exports = {
    name: 'jpmch',
    description: 'Kirim pesan ke channel',
    async run({ client, chatJid, args }) {
        if (args.length < 2) {
            await client.message.send(
                chatJid,
                `*JPMCH*\n\nCara pakai:\n.jpmch <id@newsletter> <pesan>\n\nContoh:\n.jpmch 120363xxxx@newsletter Halo semua!`
            )
            return
        }

        let target = args[0]
        if (!target.endsWith('@newsletter')) {
            await client.message.send(chatJid, '❌ ID channel harus berakhiran @newsletter')
            return
        }
        const text = args.slice(1).join(' ')

        try {
            await client.newsletter.send(target, text)
            await client.message.send(chatJid, `✅ Pesan terkirim ke channel ${target}`)
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal kirim: ${e.message}\n(Pastikan bot admin channel)`)
        }
    }
}
