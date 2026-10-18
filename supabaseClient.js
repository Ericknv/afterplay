// ============================================================================
// AFTERPLAY — CLIENTE DE BANCO & AUTENTICAÇÃO REAL (supabaseClient.js)
// Release 4.0
// ============================================================================

const SUPABASE_URL = "https://xxixdmzexaejxpfjtiyx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PABER2fGo_z4ech0Pf9ICQ_YfBK3hHq";

// Disponibilizado globalmente em window.dbAuth
window.dbAuth = {
    async signUp(email, password, name) {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return await client.auth.signUp({
                email,
                password,
                options: { data: { name: name || email.split('@')[0] } }
            });
        }
        const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email,
                password,
                data: { name: name || email.split('@')[0] }
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || data.error_description || "Erro no cadastro.");
        return { data: { user: data.user || data, session: data }, error: null };
    },

    async signInWithPassword(email, password) {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return await client.auth.signInWithPassword({ email, password });
        }
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || data.error_description || "E-mail ou senha inválidos.");
        return { 
            data: { 
                user: data.user, 
                session: { access_token: data.access_token, user: data.user } 
            }, 
            error: null 
        };
    },

    getSession() {
        const saved = localStorage.getItem('afterplay_sb_session');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return null; }
        }
        return null;
    },

    setSession(session) {
        if (session) {
            localStorage.setItem('afterplay_sb_session', JSON.stringify(session));
        } else {
            localStorage.removeItem('afterplay_sb_session');
        }
    },

    async signOut() {
        this.setSession(null);
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                await client.auth.signOut();
            } catch (e) {}
        }
    },

    async resetPasswordForEmail(email) {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            const { data, error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });
            if (error) throw error;
            return { data, error: null };
        }

        const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || data.error_description || "Falha ao enviar recuperação.");
        return { data, error: null };
    },

    async updateUserPassword(newPassword) {
        const session = this.getSession();
        const token = session ? session.access_token : null;
        if (!token) throw new Error("Sessão não autorizada para alteração de senha.");

        if (window.supabase && typeof window.supabase.createClient === 'function') {
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            const { data, error } = await client.auth.updateUser({ password: newPassword });
            if (error) throw error;
            return { data, error: null };
        }

        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || data.error_description || "Falha ao atualizar senha.");
        return { data, error: null };
    }
};

// Disponibilizado globalmente em window.executeSupabaseQuery
window.executeSupabaseQuery = async function(table, action, payload = null, filter = null) {
    const session = window.dbAuth.getSession();
    const token = session ? session.access_token : SUPABASE_ANON_KEY;

    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
    };

    const url = `${SUPABASE_URL}/rest/v1/${table}`;

    try {
        if (action === 'SELECT') {
            const queryParam = filter ? `?${filter}` : '?select=*';
            const res = await fetch(`${url}${queryParam}`, { method: 'GET', headers });
            return await res.json();
        }

        if (action === 'INSERT') {
            const res = await fetch(url, {
                method: 'POST',
                headers: { ...headers, 'Prefer': 'return=representation' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        }

        if (action === 'UPSERT') {
            const res = await fetch(url, {
                method: 'POST',
                headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        }

        if (action === 'UPDATE') {
            const res = await fetch(`${url}?${filter}`, {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=representation' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        }

        if (action === 'DELETE') {
            const res = await fetch(`${url}?${filter}`, { method: 'DELETE', headers });
            return true;
        }
    } catch (err) {
        console.error(`Erro na tabela ${table} (${action}):`, err);
        return null;
    }
};