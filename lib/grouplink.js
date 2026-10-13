const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'database', 'grouplinks.json')

function load() {
    try {
        if (fs.existsSync(DB_PATH)) {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
        }
    } catch {}
    return []
}

function save(data) {
    try {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
        return true
    } catch (e) {
        console.error('[grouplink] Gagal simpan:', e.message)
        return false
    }
}

// Simpan link grup, return true kalau baru
function addLink(code, info = {}) {
    const data = load()
    if (data.some((d) => d.code === code)) return false // udah ada
    data.push({
        code,
        link: `https://chat.whatsapp.com/${code}`,
        subject: info.subject || null,
        from: info.from || null,
        fromGroup: info.fromGroup || null,
        savedAt: new Date().toISOString()
    })
    save(data)
    return true
}

function getAll() {
    return load()
}

module.exports = { addLink, getAll }
