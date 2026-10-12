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
            `• ${config.prefix}sticker — reply gambar untuk jadi stiker\n` +
            `• ${config.prefix}jpm <pesan> — broadcast ke semua grup\n` +
            `• ${config.prefix}listgc — daftar grup bot\n` +
            `• ${config.prefix}pushkontak <id> <pesan> — kirim ke grup tertentu\n` +
            `• ${config.prefix}joingc <link> — join grup via link\n\n` +
            `_Powered by @habibicox10/zapo-id_`
        await client.message.send(chatJid, text)
    }
}
