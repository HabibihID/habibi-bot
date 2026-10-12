// Manajemen grup — linkgc, revokelink, setname, setdesc, open, close, gcinfo, leave
const { isGroup } = require('../lib/helper')

function needGroup(chatJid) {
    return isGroup(chatJid)
}

async function needAdmin(client, chatJid) {
    // Cek apakah bot admin (simplifikasi: coba aja, error kalau bukan admin)
    return true
}

const linkgc = {
    name: 'linkgc',
    description: 'Ambil link invite grup',
    async run({ client, chatJid }) {
        if (!needGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
            return
        }
        try {
            const code = await client.group.getInviteCode(chatJid)
            await client.message.send(chatJid, `🔗 Link grup:\nhttps://chat.whatsapp.com/${code}`)
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal: ${e.message}`)
        }
    }
}

const revokelink = {
    name: 'revokelink',
    description: 'Reset link invite grup',
    async run({ client, chatJid }) {
        if (!needGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
            return
        }
        try {
            const res = await client.group.revokeInvite(chatJid)
            const code = res.code || res.inviteCode || ''
            await client.message.send(chatJid, `✅ Link lama dimatikan!\nLink baru:\nhttps://chat.whatsapp.com/${code}`)
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal (bot harus admin): ${e.message}`)
        }
    }
}

const setname = {
    name: 'setname',
    description: 'Ganti nama grup',
    async run({ client, chatJid, args }) {
        if (!needGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
            return
        }
        const name = args.join(' ').trim()
        if (!name) {
            await client.message.send(chatJid, '❌ Kasih nama baru.\nContoh: .setname Grup Baru')
            return
        }
        try {
            await client.group.setSubject(chatJid, name)
            await client.message.send(chatJid, `✅ Nama grup diganti ke: *${name}*`)
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal (bot harus admin): ${e.message}`)
        }
    }
}

const setdesc = {
    name: 'setdesc',
    description: 'Ganti deskripsi grup',
    async run({ client, chatJid, args }) {
        if (!needGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
            return
        }
        const desc = args.join(' ').trim()
        if (!desc) {
            await client.message.send(chatJid, '❌ Kasih deskripsi baru.\nContoh: .setdesc Grup jual beli')
            return
        }
        try {
            await client.group.setDescription(chatJid, desc)
            await client.message.send(chatJid, `✅ Deskripsi grup diganti!`)
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal (bot harus admin): ${e.message}`)
        }
    }
}

const open = {
    name: 'open',
    description: 'Buka grup (semua bisa chat)',
    async run({ client, chatJid }) {
        if (!needGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
            return
        }
        try {
            await client.group.setSetting(chatJid, 'announce', false)
            await client.message.send(chatJid, '✅ Grup dibuka! Semua member bisa chat.')
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal (bot harus admin): ${e.message}`)
        }
    }
}

const close = {
    name: 'close',
    description: 'Tutup grup (cuma admin bisa chat)',
    async run({ client, chatJid }) {
        if (!needGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
            return
        }
        try {
            await client.group.setSetting(chatJid, 'announce', true)
            await client.message.send(chatJid, '🔒 Grup ditutup! Cuma admin bisa chat.')
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal (bot harus admin): ${e.message}`)
        }
    }
}

const gcinfo = {
    name: 'gcinfo',
    description: 'Info detail grup',
    async run({ client, chatJid }) {
        if (!needGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
            return
        }
        try {
            const m = await client.group.queryGroupMetadata(chatJid)
            const admins = (m.participants || []).filter((p) => p.isAdmin)
            await client.message.send(
                chatJid,
                `ℹ️ *INFO GRUP*\n\n` +
                `Nama: *${m.subject}*\n` +
                `ID: \`${m.jid}\`\n` +
                `Member: *${m.participants?.length || '?'}*\n` +
                `Admin: *${admins.length}*\n` +
                `Dibuat: ${m.creation ? new Date(m.creation * 1000).toLocaleDateString('id-ID') : '?'}\n` +
                `Status: ${m.announce ? '🔒 Tertutup' : '🟢 Terbuka'}\n` +
                `Deskripsi: ${m.desc || '-'}`
            )
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal: ${e.message}`)
        }
    }
}

const leave = {
    name: 'leave',
    description: 'Bot keluar dari grup',
    async run({ client, chatJid }) {
        if (!needGroup(chatJid)) {
            await client.message.send(chatJid, '❌ Cuma bisa dipakai di grup.')
            return
        }
        try {
            await client.message.send(chatJid, '👋 Bot keluar dari grup...')
            await client.group.leaveGroup([chatJid])
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal: ${e.message}`)
        }
    }
}

module.exports = { linkgc, revokelink, setname, setdesc, open, close, gcinfo, leave }
