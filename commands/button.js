// button — kirim pesan dengan tombol (EKSPERIMENTAL)
// .button <teks> | <tombol1> | <tombol2> | ...
//
// Pakai protobuf buttonsMessage mentah via client.message.send()
module.exports = {
    name: 'button',
    description: 'Kirim pesan dengan tombol (eksperimental)',
    async run({ client, chatJid, args }) {
        const input = args.join(' ').trim()
        const parts = input.split('|').map((s) => s.trim()).filter(Boolean)

        if (parts.length < 3) {
            await client.message.send(
                chatJid,
                `*BUTTON (eksperimental)*\n\nCara pakai:\n.button <teks> | <tombol1> | <tombol2>\n\nContoh:\n.button Pilih menu: | Menu 1 | Menu 2`
            )
            return
        }

        const [text, ...labels] = parts
        if (labels.length > 3) {
            await client.message.send(chatJid, '❌ Maksimal 3 tombol.')
            return
        }

        try {
            const buttons = labels.map((label, i) => ({
                buttonId: `btn_${i + 1}`,
                buttonText: { displayText: label },
                type: 1 // RESPONSE
            }))

            const rawMsg = {
                buttonsMessage: {
                    contentText: text,
                    footerText: 'Habibi Bot',
                    buttons,
                    headerType: 1 // EMPTY
                }
            }

            await client.message.send(chatJid, rawMsg)
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal kirim button: ${e.message}`)
        }
    }
}
