// Ambil teks dari pesan masuk (conversation / extendedText / caption)
function getText(msg) {
    if (!msg) return ''
    if (typeof msg.conversation === 'string' && msg.conversation) return msg.conversation
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text
    if (msg.imageMessage?.caption) return msg.imageMessage.caption
    if (msg.videoMessage?.caption) return msg.videoMessage.caption
    return ''
}

// Cek apakah pesan dari grup
function isGroup(jid) {
    return jid?.endsWith('@g.us')
}

// Ambil JID pengirim
function getSender(event) {
    return event.key.participant || event.key.remoteJid
}

module.exports = { getText, isGroup, getSender }
