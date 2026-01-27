import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { sessionId, action, rejectionReason } = await req.json();

    if (!sessionId || !['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Get the teaching session
    const session = await base44.entities.TeachingSession.get(sessionId);
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'pending') {
      return Response.json({ error: 'Session is not pending' }, { status: 400 });
    }

    if (action === 'approve') {
      // Get or create instructor wallet
      const wallets = await base44.entities.InstructorWallet.filter({ 
        instructor_id: session.instructor_id 
      });
      let wallet = wallets[0];
      
      if (!wallet) {
        wallet = await base44.entities.InstructorWallet.create({
          instructor_id: session.instructor_id,
          balance: 0,
          total_earned: 0,
          total_withdrawn: 0,
          pending_approval_amount: 0
        });
      }

      const balanceBefore = wallet.balance;
      const newBalance = balanceBefore + session.amount_earned;

      // Update teaching session
      await base44.entities.TeachingSession.update(sessionId, {
        status: 'approved',
        approved_by: user.id,
        approved_date: new Date().toISOString()
      });

      // Create wallet transaction
      await base44.entities.InstructorWalletTransaction.create({
        instructor_id: session.instructor_id,
        amount: session.amount_earned,
        type: 'credit',
        source: 'teaching_session',
        related_entity_id: sessionId,
        description: `Payment for teaching session on ${new Date(session.session_date).toLocaleDateString()}`,
        balance_before: balanceBefore,
        balance_after: newBalance
      });

      // Update wallet balance
      await base44.entities.InstructorWallet.update(wallet.id, {
        balance: newBalance,
        total_earned: wallet.total_earned + session.amount_earned,
        pending_approval_amount: Math.max(0, wallet.pending_approval_amount - session.amount_earned)
      });

      return Response.json({ 
        success: true, 
        message: 'Session approved and payment credited to wallet',
        newBalance: newBalance
      });
    } else {
      // Reject session
      await base44.entities.TeachingSession.update(sessionId, {
        status: 'rejected',
        approved_by: user.id,
        approved_date: new Date().toISOString(),
        rejection_reason: rejectionReason || 'Rejected by admin'
      });

      // Update wallet pending amount
      const wallets = await base44.entities.InstructorWallet.filter({ 
        instructor_id: session.instructor_id 
      });
      if (wallets[0]) {
        await base44.entities.InstructorWallet.update(wallets[0].id, {
          pending_approval_amount: Math.max(0, wallets[0].pending_approval_amount - session.amount_earned)
        });
      }

      return Response.json({ success: true, message: 'Session rejected' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});