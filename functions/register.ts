import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { create } from 'https://deno.land/x/djwt@v3.0.1/mod.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, password, full_name, role } = await req.json();

    if (!email || !password || !full_name || !role) {
      return Response.json({ error: 'All fields required' }, { status: 400 });
    }

    // Check if user exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (existingUsers.length > 0) {
      return Response.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password);

    // Create user
    const user = await base44.asServiceRole.entities.User.create({
      email,
      full_name,
      role: role === 'admin' ? 'admin' : 'user',
      password_hash: hashedPassword,
      profile_completed: role === 'admin' ? true : false,
      actual_role: role // student, instructor, or admin
    });

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
        role: user.actual_role,
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
        role: user.actual_role,
        profile_completed: user.profile_completed
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});