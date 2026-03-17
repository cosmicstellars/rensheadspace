import { createClient } from '@supabase/supabase-js';

const HEX_RE  = /^#[0-9a-fA-F]{6}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NAME_RE = /^[a-zA-Z0-9 ]{1,15}$/;

function isValidHex(v)  { return HEX_RE.test(v); }
function isValidUUID(v) { return UUID_RE.test(v); }
function isValidName(v) { return NAME_RE.test(String(v || '').trim()); }

function getDB() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) throw new Error('Supabase env vars not configured');
    return createClient(url, key);
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'same-origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method === 'GET') {
        try {
            const db = getDB();
            const { data, error } = await db
                .from('horses')
                .select('id, name, fur, hair, nose, likes')
                .order('likes', { ascending: false });

            if (error) throw error;

            const safe = (data || []).filter(h =>
                isValidUUID(h.id) &&
                typeof h.name === 'string' &&
                isValidHex(h.fur) &&
                isValidHex(h.hair) &&
                isValidHex(h.nose)
            ).map(h => ({
                id:    h.id,
                name:  String(h.name).slice(0, 15),
                fur:   h.fur,
                hair:  h.hair,
                nose:  h.nose,
                likes: Math.max(0, parseInt(h.likes) || 0),
            }));

            return res.status(200).json(safe);

        } catch (e) {
            console.error('[GET /api/horses]', e);
            return res.status(500).json({ error: 'internal server error' });
        }
    }

    if (req.method === 'POST') {
        const { id, name, fur, hair, nose } = req.body || {};

        if (!isValidUUID(id))          return res.status(400).json({ error: 'invalid id' });
        if (!isValidName(name))        return res.status(400).json({ error: 'invalid name' });
        if (!isValidHex(fur))          return res.status(400).json({ error: 'invalid fur color' });
        if (!isValidHex(hair))         return res.status(400).json({ error: 'invalid hair color' });
        if (!isValidHex(nose))         return res.status(400).json({ error: 'invalid nose color' });

        try {
            const db = getDB();
            const { error } = await db
                .from('horses')
                .upsert([{ id, name: name.trim(), fur, hair, nose }], { onConflict: 'id' });

            if (error) throw error;

            return res.status(200).json({ ok: true });

        } catch (e) {
            console.error('[POST /api/horses]', e);
            return res.status(500).json({ error: 'internal server error' });
        }
    }

    return res.status(405).json({ error: 'method not allowed' });
}