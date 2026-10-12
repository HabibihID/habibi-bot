// pushkontak — kirim pesan ke grup tertentu via ID
// .pushkontak <id_grup> <pesan>
module.exports = {
    name: 'pushkontak',
    description: 'Kirim pesan ke grup tertentu',
    async run({ client, chatJid, args }) {
        if (args.length < 2) {
            await client.message.send(
                chatJid,
                `*PUSH KONTAK*\n\nCara pakai:\n.pushkontak <id_grup> <pesan>\n\nContoh:\n.pushkontak 123456@g.us Halo semua!`
            )
            return
        }
        let target = args[0]
        if (!target.includes('@')) target += '@g.us'
        const text = args.slice(1).join(' ')

        try {
            await client.message.send(target, text)
            await client.message.send(chatJid, `✅ Pesan terkirim ke ${target}`)
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal kirim: ${e.message}`)
        }
    }
}
