// privacy — cek & ubah privacy settings akun bot
// .privacy — lihat semua
// .privacy <kategori> <nilai>
// Kategori: lastseen, profilepic, about, readreceipt, groups
// Nilai: all, contacts, contact_blacklist, none
const CATEGORIES = {
    lastseen: 'lastSeen',
    online: 'online',
    profilepic: 'profilePicture',
    about: 'about',
    readreceipt: 'readReceipts',
    groups: 'groupAdd',
    calladd: 'callAdd'
}
const VALUES = ['all', 'contacts', 'contact_blacklist', 'none']

module.exports = {
    name: 'privacy',
    description: 'Cek/ubah privacy settings',
    async run({ client, chatJid, args }) {
        // Lihat semua
        if (!args.length) {
            try {
                const s = await client.privacy.getPrivacySettings()
                let msg = `🔒 *PRIVACY SETTINGS*\n\n`
                for (const [k, v] of Object.entries(s.settings || s)) {
                    msg += `• ${k}: *${typeof v === 'object' ? JSON.stringify(v) : v}*\n`
                }
                msg += `\nUbah: .privacy <kategori> <nilai>\nKategori: ${Object.keys(CATEGORIES).join(', ')}\nNilai: ${VALUES.join(', ')}`
                await client.message.send(chatJid, msg)
            } catch (e) {
                await client.message.send(chatJid, `❌ Gagal ambil settings: ${e.message}`)
            }
            return
        }

        const cat = (args[0] || '').toLowerCase()
        const val = (args[1] || '').toLowerCase()
        const setting = CATEGORIES[cat]

        if (!setting || !VALUES.includes(val)) {
            await client.message.send(
                chatJid,
                `❌ Format salah.\n\n.privacy <kategori> <nilai>\nKategori: ${Object.keys(CATEGORIES).join(', ')}\nNilai: ${VALUES.join(', ')}`
            )
            return
        }

        try {
            await client.privacy.setPrivacySetting(setting, val)
            await client.message.send(chatJid, `✅ Privacy *${cat}* diubah ke *${val}*`)
        } catch (e) {
            await client.message.send(chatJid, `❌ Gagal ubah: ${e.message}`)
        }
    }
}
