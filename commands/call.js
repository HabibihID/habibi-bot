// call — telepon nomor dan putar audio
// .call <nomor> — telepon dan putar pesan suara
// .call end — akhiri panggilan aktif
//
// Butuh: ffmpeg terinstall, file audio di ./media/call.mp3
const path = require('node:path')
const fs = require('node:fs')

let activeCallId = null

module.exports = {
    name: 'call',
    description: 'Telepon nomor dan putar pesan suara',
    async run({ client, chatJid, args, event }) {
        const sub = (args[0] || '').toLowerCase()

        // Akhiri panggilan
        if (sub === 'end' || sub === 'stop') {
            if (!activeCallId) {
                await client.message.send(chatJid, 'Tidak ada panggilan aktif.')
                return
            }
            try {
                await client.voip.endCall(activeCallId)
                await client.message.send(chatJid, '📞 Panggilan diakhiri.')
            } catch (e) {
                await client.message.send(chatJid, `❌ Gagal akhiri: ${e.message}`)
            }
            activeCallId = null
            return
        }

        if (activeCallId) {
            await client.message.send(chatJid, '⚠️ Sudah ada panggilan aktif. .call end untuk akhiri.')
            return
        }

        // Ambil nomor: dari argumen atau reply/mention
        let number = args[0]
        if (!number) {
            const quoted = event.message?.extendedTextMessage?.contextInfo
            if (quoted?.participant) {
                number = quoted.participant.split('@')[0]
            } else if (quoted?.mentionedJid?.length) {
                number = quoted.mentionedJid[0].split('@')[0]
            }
        }
        if (!number) {
            await client.message.send(
                chatJid,
                `*VOICE CALL*\n\nCara pakai:\n.call <nomor>\n.call end — akhiri\n\nContoh:\n.call 6281234567890\n\nAudio yang diputar: ./media/call.mp3`
            )
            return
        }

        // Normalisasi nomor
        number = number.replace(/[^0-9]/g, '')
        if (number.startsWith('0')) number = '62' + number.slice(1)
        const peerJid = `${number}@s.whatsapp.net`

        // Cek file audio
        const audioPath = path.join(__dirname, '..', 'media', 'call.mp3')
        if (!fs.existsSync(audioPath)) {
            await client.message.send(
                chatJid,
                `❌ File audio tidak ditemukan.\nTaruh file MP3 di: ./media/call.mp3`
            )
            return
        }

        try {
            await client.message.send(chatJid, `📞 Menelpon ${number}...`)
            const callId = await client.voip.startCall({ peerJid })
            activeCallId = callId

            // Putar audio saat call tersambung
            const onState = async (call) => {
                if (call.callId === callId && call.stateData.state === 'active') {
                    try {
                        await client.voip.loadAudio(callId, audioPath)
                        console.log(`[voip] Memutar audio ke ${number}`)
                    } catch (e) {
                        console.error(`[voip] Gagal putar audio: ${e.message}`)
                    }
                    client.off('voip_call_state', onState)
                }
                // Reset saat call berakhir
                if (call.callId === callId && ['ended', 'rejected', 'failed'].includes(call.stateData.state)) {
                    activeCallId = null
                    client.off('voip_call_state', onState)
                }
            }
            client.on('voip_call_state', onState)

            await client.message.send(chatJid, `📞 Panggilan dimulai ke ${number}\nKetik .call end untuk akhiri.`)
        } catch (e) {
            activeCallId = null
            await client.message.send(chatJid, `❌ Gagal menelpon: ${e.message}`)
        }
    }
}
