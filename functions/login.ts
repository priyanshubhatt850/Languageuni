import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { create } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Find user
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT token
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const token = await create(
      { alg: 'HS256', typ: 'JWT' },
      { 
        userId: user.id, 
        email: user.email, 
        role: user.actual_role || user.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      key
    );

    return Response.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.actual_role || user.role,
        profile_completed: user.profile_completed
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});