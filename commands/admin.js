// Helper: ambil target dari reply atau mention
const { isGroup } = require('../lib/helper')

function getTarget(event) {
    // Dari reply
    const quoted = event.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const participant = event.message?.extendedTextMessage?.contextInfo?.participant
    if (quoted && participant) return participant
    // Dari mention
    const mentioned = event.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (mentioned?.length) return mentioned[0]
    return null
}

async function adminCommand({ client, chatJid, event }, action, actionFn, actionName) {
    if (!isGroup(chatJid)) {
        await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
        return
    }
    const target = getTarget(event)
    if (!target) {
        await client.message.send(
            chatJid,
            `❌ Reply pesan member atau mention untuk *${actionName}*.\nContoh: reply pesan lalu ketik .${action}`
        )
        return
    }
    try {
        await actionFn(chatJid, [target])
        await client.message.send(chatJid, {
            type: 'text',
            text: `✅ @${target.split('@')[0]} ${actionName}!`,
            contextInfo: { mentionedJids: [target] }
        })
    } catch (e) {
        await client.message.send(chatJid, `❌ Gagal: ${e.message}\n(Pastikan bot adalah admin)`)
    }
}

const promote = {
    name: 'promote',
    description: 'Jadikan admin grup',
    async run(ctx) {
        await adminCommand(ctx, 'promote',
            (jid, p) => ctx.client.group.promoteParticipants(jid, p), 'dijadikan admin')
    }
}

const demote = {
    name: 'demote',
    description: 'Turunkan dari admin',
    async run(ctx) {
        await adminCommand(ctx, 'demote',
            (jid, p) => ctx.client.group.demoteParticipants(jid, p), 'diturunkan dari admin')
    }
}

const kick = {
    name: 'kick',
    description: 'Keluarkan dari grup',
    async run(ctx) {
        await adminCommand(ctx, 'kick',
            (jid, p) => ctx.client.group.removeParticipants(jid, p), 'dikeluarkan dari grup')
    }
}

module.exports = { promote, demote, kick }
