import { createClient } from '@supabase/supabase-js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getDB() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) throw new Error('Supabase env vars not configured');
    return createClient(url, key);
}

const rateLimitMap = new Map();
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip, horseId) {
    const key = `${ip}:${horseId}`;
    const last = rateLimitMap.get(key) || 0;
    const now  = Date.now();
    if (now - last < RATE_WINDOW_MS) return true;
    rateLimitMap.set(key, now);
	
    if (rateLimitMap.size > 10_000) {
        for (const [k, v] of rateLimitMap) {
            if (now - v > RATE_WINDOW_MS) rateLimitMap.delete(k);
        }
    }
    return false;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'same-origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'method not allowed' });

    const { horseId, liked } = req.body || {};

    if (!UUID_RE.test(horseId))   return res.status(400).json({ error: 'invalid horseId' });
    if (typeof liked !== 'boolean') return res.status(400).json({ error: 'liked must be boolean' });

    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
        .split(',')[0].trim();

    if (isRateLimited(ip, horseId)) {
        return res.status(429).json({ error: 'too many requests — wait a minute' });
    }

    try {
        const db = getDB();

        const { data: rows, error: fetchErr } = await db
            .from('horses')
            .select('likes')
            .eq('id', horseId)
            .single();

        if (fetchErr || !rows) return res.status(404).json({ error: 'horse not found' });

        const currentLikes = Math.max(0, parseInt(rows.likes) || 0);
		
        const newLikes = liked
            ? currentLikes + 1
            : Math.max(0, currentLikes - 1);

        const { error: updateErr } = await db
            .from('horses')
            .update({ likes: newLikes })
            .eq('id', horseId);

        if (updateErr) throw updateErr;

        return res.status(200).json({ ok: true, likes: newLikes });

    } catch (e) {
        console.error('[POST /api/horses/like]', e);
        return res.status(500).json({ error: 'internal server error' });
    }
}