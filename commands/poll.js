// poll — bikin polling di grup
// .poll Pertanyaan? | Opsi1 | Opsi2 | Opsi3
module.exports = {
    name: 'poll',
    description: 'Bikin polling',
    async run({ client, chatJid, args }) {
        const input = args.join(' ').trim()
        const parts = input.split('|').map((s) => s.trim()).filter(Boolean)

        if (parts.length < 3) {
            await client.message.send(
                chatJid,
                `*POLLING*\n\nCara pakai:\n.poll <pertanyaan> | <opsi1> | <opsi2> | ...\n\nContoh:\n.poll Mabar jam berapa? | Jam 7 | Jam 8 | Besok aja`
            )
            return
        }

        const [question, ...options] = parts
        if (options.length > 12) {
            await client.message.send(chatJid, '❌ Maksimal 12 opsi.')
            return
        }

        try {
            await client.message.send(chatJid, {
                type: 'poll',
                name: question,
                options
            })
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal bikin poll: ${e.message}`)
        }
    }
}
