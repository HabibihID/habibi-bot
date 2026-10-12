module.exports = {
    name: 'ping',
    description: 'Cek kecepatan respon bot',
    async run({ client, chatJid, event }) {
        const start = Date.now()
        const sent = await client.message.send(chatJid, '🏓 Ping...')
        const latency = Date.now() - start
        // Edit tidak didukung di semua versi, kirim baru saja
        await client.message.send(chatJid, `🏓 Pong!\n⚡ Latency: ${latency}ms`)
        void sent
        void event
    }
}
