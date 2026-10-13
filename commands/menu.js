const config = require('../config')

module.exports = {
    name: 'menu',
    description: 'Tampilkan daftar perintah',
    async run({ client, chatJid }) {
        const text =
            `*${config.botName}* 🤖\n\n` +
            `Daftar perintah:\n` +
            `• ${config.prefix}jpm <pesan> — broadcast ke semua grup\n` +
            `• ${config.prefix}jpmtag <pesan> — broadcast + hidden tag semua\n` +
            `• ${config.prefix}jpmch <id@newsletter> <pesan> — kirim ke channel\n` +
            `• ${config.prefix}swgc <pesan> — status ke semua grup\n` +
            `• ${config.prefix}pushkontak <id> <pesan> — kirim ke grup tertentu\n` +
            `• ${config.prefix}cekidgc <link> — cek ID grup dari link\n` +
            `• ${config.prefix}listgc — daftar grup bot\n` +
            `• ${config.prefix}tagall [teks] — tag semua member grup\n` +
            `• ${config.prefix}privacy — cek/ubah privacy akun\n` +
            `• ${config.prefix}joingc <link> — join grup via link\n\n` +
            `👤 Developer: ${config.developer}\n` +
            `🌐 ${config.website}\n\n` +
            `_Powered by @habibicox10/zapo-id_`
        await client.message.send(chatJid, text)
    }
}
