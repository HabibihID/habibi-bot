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

            // 1. Load audio DULU sebelum start call
            // (biar siap diputar saat tersambung)
            console.log(`[voip] Decode audio: ${audioPath}`)

            // 2. Start call
            const callId = await client.voip.startCall({ peerJid })
            activeCallId = callId
            console.log(`[voip] Call dimulai: ${callId} -> ${peerJid}`)

            // 3. Load audio langsung (sesuai README: langsung setelah startCall)
            try {
                await client.voip.loadAudio(callId, audioPath)
                console.log(`[voip] Audio dimuat untuk ${callId}`)
            } catch (e) {
                console.error(`[voip] Gagal load audio: ${e.message}`)
                await client.message.send(chatJid, `⚠️ Gagal load audio: ${e.message}`)
            }

            // 4. Monitor state
            const onState = (call) => {
                if (call.callId !== callId) return
                const state = call.stateData?.state
                console.log(`[voip] State ${callId}: ${state}`)
                if (['ended', 'rejected', 'failed', 'timeout'].includes(state)) {
                    activeCallId = null
                    client.off('voip_call_state', onState)
                    client.message.send(chatJid, `📞 Panggilan berakhir (${state}).`).catch(() => {})
                }
            }
            client.on('voip_call_state', onState)

            // 5. Loop audio: putar lagi setiap selesai
            const onFinished = async (call) => {
                if (call.callId !== callId) return
                if (activeCallId !== callId) {
                    client.off('voip_call_outbound_audio_finished', onFinished)
                    return
                }
                console.log(`[voip] Audio selesai, loop lagi...`)
                try {
                    await client.voip.loadAudio(callId, audioPath)
                } catch (e) {
                    console.error(`[voip] Gagal loop audio: ${e.message}`)
                }
            }
            client.on('voip_call_outbound_audio_finished', onFinished)

            await client.message.send(chatJid, `📞 Panggilan dimulai ke ${number}\nKetik .call end untuk akhiri.`)
        } catch (e) {
            activeCallId = null
            console.error(`[voip] Error: ${e.message}`)
            await client.message.send(chatJid, `❌ Gagal menelpon: ${e.message}`)
        }
    }
}
