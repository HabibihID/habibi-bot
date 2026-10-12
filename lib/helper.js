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

// Validasi media bisa didownload (directPath + mediaKey Uint8Array)
function hasMedia(m) {
    return !!(m && m.directPath && m.mediaKey instanceof Uint8Array)
}

// Cari imageMessage yang valid: langsung atau dari quoted
function findImage(msg) {
    if (hasMedia(msg?.imageMessage)) return msg.imageMessage
    const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage
    if (hasMedia(quoted?.imageMessage)) return quoted.imageMessage
    return null
}

// Cari videoMessage yang valid: langsung atau dari quoted
function findVideo(msg) {
    if (hasMedia(msg?.videoMessage)) return msg.videoMessage
    const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage
    if (hasMedia(quoted?.videoMessage)) return quoted.videoMessage
    return null
}

// Readable stream -> Buffer
async function streamToBuffer(stream) {
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)
    return Buffer.concat(chunks)
}

module.exports = { getText, isGroup, getSender, hasMedia, findImage, findVideo, streamToBuffer }
