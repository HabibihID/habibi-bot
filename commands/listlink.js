// listlink — lihat database link grup yang tersimpan otomatis
module.exports = {
    name: 'listlink',
    description: 'Lihat link grup tersimpan',
    async run({ client, chatJid }) {
        const { getAll } = require('../lib/grouplink')
        const data = getAll()
        if (!data.length) {
            await client.message.send(chatJid, '📭 Belum ada link grup tersimpan.\nBot otomatis menyimpan tiap ada link grup yang di-share.')
            return
        }
        let msg = `🔗 *DATABASE LINK GRUP* (${data.length})\n\n`
        data.forEach((d, i) => {
            msg += `${i + 1}. ${d.subject || 'Tanpa nama'}\n   ${d.link}\n`
        })
        if (msg.length > 6000) msg = msg.slice(0, 6000) + '\n\n... (dipotong)'
        await client.message.send(chatJid, msg)
    }
}
