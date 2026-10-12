const config = require('../config')

module.exports = {
    name: 'menu',
    description: 'Tampilkan daftar perintah',
    async run({ client, chatJid }) {
        const text =
            `*${config.botName}* 🤖\n\n` +
            `Daftar perintah:\n` +
            `• ${config.prefix}menu — daftar perintah\n` +
            `• ${config.prefix}ping — cek kecepatan bot\n` +
            `• ${config.prefix}tagall [teks] — tag semua member grup\n` +
            `• ${config.prefix}sticker — reply gambar untuk jadi stiker\n\n` +
            `_Powered by @habibicox10/zapo-id_`
        await client.message.send(chatJid, text)
    }
}
