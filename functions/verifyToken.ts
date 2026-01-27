import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { verify } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this';

Deno.serve(async (req) => {
  try {
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'Token required' }, { status: 400 });
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const payload = await verify(token, key);
    
    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.filter({ id: payload.userId });
    
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    return Response.json({ 
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.actual_role || user.role,
        profile_completed: user.profile_completed,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
});