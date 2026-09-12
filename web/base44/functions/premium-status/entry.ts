import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ premium: false, loggedIn: false });

    if (user.plan === 'premium') {
      return Response.json({ premium: true, loggedIn: true });
    }

    // Claim path: a paid premium purchase exists for this user (by id or email)
    // but the plan field hasn't been set yet (e.g. webhook arrived before signup).
    const db = base44.asServiceRole;
    const purchases = await db.entities.Base44Purchase.filter({ productId: 'premium', status: 'paid' });
    const match = purchases.find(
      (p) => p.appUserId === user.id || (p.buyerEmail && p.buyerEmail === user.email)
    );
    if (match) {
      await db.entities.User.update(user.id, { plan: 'premium' });
      return Response.json({ premium: true, loggedIn: true });
    }

    return Response.json({ premium: false, loggedIn: true });
  } catch (error) {
    console.error('premium-status: error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}