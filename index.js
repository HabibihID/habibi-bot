// HABIBI BOT — powered by @habibicox10/zapo-id
const fs = require('node:fs')
const path = require('node:path')
const { WaClient, createStore } = require('@habibicox10/zapo-id')
const { createSqliteStore } = require('@zapo-js/store-sqlite')
const config = require('./config')
const { getText, getSender } = require('./lib/helper')

// Load commands (support 1 atau banyak command per file)
const commands = new Map()
for (const file of fs.readdirSync(path.join(__dirname, 'commands'))) {
    if (!file.endsWith('.js')) continue
    const mod = require(path.join(__dirname, 'commands', file))
    // Kalau export object berisi banyak command (tanpa .name langsung)
    if (mod && !mod.name && typeof mod === 'object') {
        for (const cmd of Object.values(mod)) {
            if (cmd?.name) commands.set(cmd.name, cmd)
        }
    } else if (mod?.name) {
        commands.set(mod.name, mod)
    }
}
console.log(`[bot] ${commands.size} command dimuat:`, [...commands.keys()].join(', '))

async function main() {
    // SQLite store — session tersimpan permanen, nggak perlu pairing tiap restart
    const authPath = path.join(__dirname, '.auth', 'state.sqlite')
    fs.mkdirSync(path.dirname(authPath), { recursive: true })
    const store = createStore({
        backends: {
            sqlite: createSqliteStore({ path: authPath, driver: 'auto' })
        },
        providers: {
            auth: 'sqlite',
            signal: 'sqlite',
            preKey: 'sqlite',
            session: 'sqlite',
            identity: 'sqlite',
            senderKey: 'sqlite',
            appState: 'sqlite',
            privacyToken: 'sqlite',
            messages: 'sqlite',
            threads: 'sqlite',
            contacts: 'sqlite'
        }
    })
    const client = new WaClient(
        {
            store,
            sessionId: config.sessionId,
            pairingCode: config.pairingCode, // HABBYFAM
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

    let alreadyPaired = false
    client.on('auth_paired', ({ credentials }) => {
        alreadyPaired = true
        console.log(`[paired] login sebagai ${credentials.meJid ?? 'unknown'}`)
    })

    client.on('message', async (event) => {
        try {
            const chatJid = event.key.remoteJid
            if (!chatJid) return

            // Izinkan self-chat (tes ke diri sendiri), tapi skip pesan bot di chat lain
            // biar nggak loop. Self-chat: fromMe=true + bukan grup.
            const isSelfChat =
                event.key.fromMe === true &&
                !event.key.participant &&
                chatJid.endsWith('@s.whatsapp.net')
            if (event.key.fromMe && !isSelfChat) return

            const text = getText(event.message).trim()

            // Auto-save link grup WA yang di-share (database/grouplinks.json)
            const linkMatch = text.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
            if (linkMatch && !event.key.fromMe) {
                try {
                    const { addLink } = require('./lib/grouplink')
                    const saved = addLink(linkMatch[1], {
                        from: getSender(event),
                        fromGroup: chatJid.endsWith('@g.us') ? chatJid : null
                    })
                    if (saved) console.log(`[grouplink] Tersimpan: ${linkMatch[1]}`)
                } catch {}
            }

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

    // Pairing flow: minta kode secara proaktif setelah connect
    const phone = process.env.BOT_PHONE
    if (phone) {
        // Jalanin connect di background
        const connectPromise = client.connect().catch((e) => {
            console.error('[connect] error:', e.message)
        })
        // Tunggu koneksi siap, lalu minta pairing code (cuma kalau belum paired)
        setTimeout(async () => {
            if (alreadyPaired) {
                console.log('[auth] Session tersimpan, langsung connect tanpa pairing.')
                return
            }
            try {
                const code = await client.auth.requestPairingCode(phone, true, config.pairingCode)
                console.log(`\n🔑 Pairing code untuk ${phone}: ${code}`)
                console.log('Buka WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon')
                console.log('Masukin kode di atas di HP kamu.\n')
            } catch (e) {
                console.error('[pairing] gagal:', e.message)
            }
        }, 5000)
        await connectPromise
    } else {
        console.log('[auth] Set BOT_PHONE=628xxx untuk pairing code, atau scan QR.')
        await client.connect()
    }

    process.on('SIGINT', () => client.disconnect().then(() => process.exit(0)))
    process.on('SIGTERM', () => client.disconnect().then(() => process.exit(0)))
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
