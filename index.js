// HABIBI BOT — 5 fitur, powered by @habibicox10/zapo-id
const fs = require('node:fs')
const path = require('node:path')
const { WaClient, createStore } = require('@habibicox10/zapo-id')
const config = require('./config')
const { getText, getSender } = require('./lib/helper')

// Load commands
const commands = new Map()
for (const file of fs.readdirSync(path.join(__dirname, 'commands'))) {
    if (!file.endsWith('.js')) continue
    const cmd = require(path.join(__dirname, 'commands', file))
    commands.set(cmd.name, cmd)
}
console.log(`[bot] ${commands.size} command dimuat:`, [...commands.keys()].join(', '))

async function main() {
    const store = createStore() // memory store (default)
    const client = new WaClient(
        {
            store,
            sessionId: config.sessionId,
            pairingCode: config.pairingCode // HABIOFFC
        },
        undefined // default logger
    )

    client.on('connection', (ev) => {
        console.log(`[connection] status=${ev.status}`)
        if (ev.status === 'open') {
            console.log('[bot] Bot online! Auto-follow channel jalan otomatis.')
        }
    })

    client.on('auth_pairing_code', ({ code }) => {
        console.log(`\n🔑 Pairing code: ${code}`)
        console.log('Masukin kode ini di WhatsApp > Perangkat Tertaut > Tautkan perangkat\n')
    })

    client.on('auth_paired', ({ credentials }) => {
        console.log(`[paired] login sebagai ${credentials.meJid ?? 'unknown'}`)
    })

    client.on('message', async (event) => {
        try {
            if (event.key.fromMe) return
            const chatJid = event.key.remoteJid
            if (!chatJid) return

            const text = getText(event.message).trim()
            if (!text.startsWith(config.prefix)) return

            const [rawCmd, ...args] = text.slice(config.prefix.length).split(/\s+/)
            const cmd = commands.get(rawCmd.toLowerCase())
            if (!cmd) return

            console.log(`[cmd] ${rawCmd} dari ${getSender(event)} di ${chatJid}`)
            await cmd.run({ client, chatJid, args, event, sender: getSender(event) })
        } catch (err) {
            console.error('[cmd] error:', err.message)
        }
    })

    // Pairing flow: kalau belum login, minta pairing code
    client.on('auth_pairing_required', async () => {
        const phone = process.env.BOT_PHONE
        if (!phone) {
            console.log('[auth] Belum login. Set BOT_PHONE=628xxx lalu restart,')
            console.log('       atau scan QR kalau muncul.')
            return
        }
        const code = await client.auth.requestPairingCode(phone)
        console.log(`\n🔑 Pairing code untuk ${phone}: ${code}\n`)
    })

    await client.connect()

    process.on('SIGINT', () => client.disconnect().then(() => process.exit(0)))
    process.on('SIGTERM', () => client.disconnect().then(() => process.exit(0)))
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
