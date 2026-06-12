import { Hono } from 'npm:hono@4.6.14';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import * as kv from './kv_store.tsx';
import communityRoutes from './community_routes.tsx';
import { webrtcRoutes } from './webrtc_routes.tsx';
import pushRoutes from './push_routes.tsx';
import newsletterRoutes from './newsletter_routes.tsx';
import landingRoutes from './landing_routes.tsx';
import { setupAdminRoutes } from './admin_routes.tsx';
import { initializeAdminSystem } from './init_admins.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const getSupabase = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Make Supabase client available to all routes
app.use('*', async (c, next) => {
  c.set('supabase', getSupabase());
  await next();
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate invite code
function generateInviteCode(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Get user ID from access token
async function isAdminUser(userId: string): Promise<boolean> {
  // Check system:admins list (set by PrivilegeManager)
  const adminList = await kv.get('system:admins') || [];
  if (Array.isArray(adminList) && adminList.includes(userId)) {
    return true;
  }
  // Fallback: email contains 'admin'
  const profile = await kv.get(`user:${userId}`);
  return !!(profile?.email?.toLowerCase().includes('admin'));
}

async function getUserFromToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabase();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch (err) {
    console.error('Error getting user from token:', err);
    return null;
  }
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/make-server-6d579fee/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'TwoBeOne API is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// AUTHENTICATION
// ============================================

app.post('/make-server-6d579fee/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getSupabase();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we don't have email server
      user_metadata: { name }
    });

    if (authError) {
      console.error('Auth error:', authError);
      
      // Handle specific error cases with user-friendly messages
      if (authError.message.includes('already been registered') || authError.code === 'email_exists') {
        return c.json({ 
          error: 'This email is already registered. Please sign in instead or use a different email.' 
        }, 409); // 409 Conflict
      }
      
      if (authError.message.includes('Invalid email')) {
        return c.json({ error: 'Please enter a valid email address.' }, 400);
      }
      
      if (authError.message.includes('Password')) {
        return c.json({ error: 'Password must be at least 6 characters long.' }, 400);
      }
      
      return c.json({ error: authError.message }, 400);
    }

    const userId = authData.user.id;
    const inviteCode = generateInviteCode();

    // Create user profile in KV store
    const userProfile = {
      id: userId,
      email,
      name,
      inviteCode,
      partnerId: null,
      relationshipStart: null,
      bio: null,
      profilePicture: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, userProfile);
    await kv.set(`invite:${inviteCode}`, userId);

    console.log('User created:', { userId, email, name, inviteCode });

    return c.json({
      success: true,
      user: userProfile,
      inviteCode
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle unexpected errors
    if (error.message?.includes('already been registered') || error.code === 'email_exists') {
      return c.json({ 
        error: 'This email is already registered. Please sign in instead or use a different email.' 
      }, 409);
    }
    
    return c.json({ error: error.message || 'Signup failed. Please try again.' }, 500);
  }
});

// ============================================
// PROFILE
// ============================================

app.get('/make-server-6d579fee/profile', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`[GET /profile] Fetching profile for user: ${userId}`);
    const startTime = Date.now();

    // Direct KV fetch — no artificial timeout; Supabase client handles its own networking
    let profile = await kv.get(`user:${userId}`);

    console.log(`[GET /profile] Profile fetch took ${Date.now() - startTime}ms`);

    // AUTO-FIX: If profile doesn't exist but user is authenticated, create it
    if (!profile) {
      console.log(`[Profile] User ${userId} authenticated but no profile found. Creating profile...`);

      const supabase = getSupabase();
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);

      if (error || !user) {
        console.error(`[Profile] Failed to get user info from auth:`, error);
        throw new Error('Profile not found and could not be created');
      }

      const inviteCode = generateInviteCode();
      profile = {
        id: userId,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        inviteCode: inviteCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await kv.set(`user:${userId}`, profile);
      await kv.set(`invite:${inviteCode}`, userId);

      console.log(`[Profile] ✅ Created profile for user ${userId}`);
    }

    // Fetch partner if linked — failure is non-critical
    let partner = null;
    if (profile.partnerId) {
      try {
        partner = await kv.get(`user:${profile.partnerId}`);
      } catch (err) {
        console.error('[GET /profile] Failed to fetch partner, continuing without:', err);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`[GET /profile] ✅ Profile loaded successfully in ${totalTime}ms for user: ${userId}`);
    
    return c.json({ profile, partner });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    if (error.message?.includes('timeout')) {
      return c.json({ error: 'Database query timeout. Please try again.' }, 504);
    }
    return c.json({ error: error.message || 'Failed to load profile' }, 500);
  }
});

app.post('/make-server-6d579fee/profile', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const profile = await kv.get(`user:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedProfile);

    // If relationshipStart is being set and user has a partner, sync it to partner
    if (updates.relationshipStart && profile.partnerId) {
      console.log('[POST /profile] Syncing relationshipStart to partner:', profile.partnerId);
      console.log('[POST /profile] New relationshipStart value:', updates.relationshipStart);
      
      try {
        const partner = await kv.get(`user:${profile.partnerId}`);
        if (partner) {
          console.log('[POST /profile] Partner found, current relationshipStart:', partner.relationshipStart);
          
          const updatedPartner = {
            ...partner,
            relationshipStart: updates.relationshipStart,
            updatedAt: new Date().toISOString()
          };
          await kv.set(`user:${profile.partnerId}`, updatedPartner);
          console.log('[POST /profile] ✅ Partner relationshipStart synced successfully to:', updates.relationshipStart);
          
          // Create a notification for the partner
          const notificationId = `notif:${profile.partnerId}:${Date.now()}`;
          const notification = {
            id: notificationId,
            userId: profile.partnerId,
            type: 'profile_update',
            title: '💕 Relationship Date Set!',
            message: `${updatedProfile.name || 'Your partner'} set your relationship start date. Check your profile!`,
            data: { relationshipStart: updates.relationshipStart },
            read: false,
            createdAt: new Date().toISOString()
          };
          await kv.set(notificationId, notification);
          console.log('[POST /profile] ✅ Notification created for partner');
        } else {
          console.log('[POST /profile] ⚠️ Partner not found with ID:', profile.partnerId);
        }
      } catch (partnerError) {
        console.error('[POST /profile] Failed to sync relationshipStart to partner:', partnerError);
        // Don't fail the request if partner sync fails
      }
    } else {
      if (!updates.relationshipStart) {
        console.log('[POST /profile] No relationshipStart in updates');
      }
      if (!profile.partnerId) {
        console.log('[POST /profile] No partner linked to this profile');
      }
    }

    return c.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// PUT endpoint for profile updates (same as POST for compatibility)
app.put('/make-server-6d579fee/profile', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    console.log('[PUT /profile] Updating profile for user:', userId, 'with data:', updates);
    
    const profile = await kv.get(`user:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedProfile);

    // If relationshipStart is being set and user has a partner, sync it to partner
    if (updates.relationshipStart && profile.partnerId) {
      console.log('[PUT /profile] Syncing relationshipStart to partner:', profile.partnerId);
      console.log('[PUT /profile] New relationshipStart value:', updates.relationshipStart);
      
      try {
        const partner = await kv.get(`user:${profile.partnerId}`);
        if (partner) {
          console.log('[PUT /profile] Partner found, current relationshipStart:', partner.relationshipStart);
          
          const updatedPartner = {
            ...partner,
            relationshipStart: updates.relationshipStart,
            updatedAt: new Date().toISOString()
          };
          await kv.set(`user:${profile.partnerId}`, updatedPartner);
          console.log('[PUT /profile] ✅ Partner relationshipStart synced successfully to:', updates.relationshipStart);
          
          // Create a notification for the partner
          const notificationId = `notif:${profile.partnerId}:${Date.now()}`;
          const notification = {
            id: notificationId,
            userId: profile.partnerId,
            type: 'profile_update',
            title: '💕 Relationship Date Set!',
            message: `${updatedProfile.name || 'Your partner'} set your relationship start date. Check your profile!`,
            data: { relationshipStart: updates.relationshipStart },
            read: false,
            createdAt: new Date().toISOString()
          };
          await kv.set(notificationId, notification);
          console.log('[PUT /profile] ✅ Notification created for partner');
        } else {
          console.log('[PUT /profile] ⚠️ Partner not found with ID:', profile.partnerId);
        }
      } catch (partnerError) {
        console.error('[PUT /profile] Failed to sync relationshipStart to partner:', partnerError);
        // Don't fail the request if partner sync fails
      }
    } else {
      if (!updates.relationshipStart) {
        console.log('[PUT /profile] No relationshipStart in updates');
      }
      if (!profile.partnerId) {
        console.log('[PUT /profile] No partner linked to this profile');
      }
    }

    console.log('[PUT /profile] Profile updated successfully');
    return c.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-6d579fee/profile/generate-code', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Delete old invite code mapping
    if (profile.inviteCode) {
      await kv.del(`invite:${profile.inviteCode}`);
    }

    const newCode = generateInviteCode();
    profile.inviteCode = newCode;
    profile.updatedAt = new Date().toISOString();

    await kv.set(`user:${userId}`, profile);
    await kv.set(`invite:${newCode}`, userId);

    return c.json({ success: true, inviteCode: newCode });
  } catch (error: any) {
    console.error('Generate code error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-6d579fee/profile/link-by-code', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { code } = await c.req.json();
    if (!code) {
      return c.json({ error: 'Invite code required' }, 400);
    }

    // Get partner ID from invite code
    const partnerId = await kv.get(`invite:${code}`);
    if (!partnerId) {
      return c.json({ error: 'Invalid invite code' }, 404);
    }

    if (partnerId === userId) {
      return c.json({ error: 'Cannot link to yourself' }, 400);
    }

    // Get both profiles
    const userProfile = await kv.get(`user:${userId}`);
    const partnerProfile = await kv.get(`user:${partnerId}`);

    if (!userProfile || !partnerProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Create couple record first
    const coupleId = generateId();
    const couple = {
      id: coupleId,
      partner1Id: userId,
      partner2Id: partnerId,
      relationshipStartDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await kv.set(`couple:${coupleId}`, couple);

    // Link the profiles with BOTH partnerId AND coupleId
    userProfile.partnerId = partnerId;
    userProfile.coupleId = coupleId;  // ✅ ADD THIS!
    userProfile.updatedAt = new Date().toISOString();
    partnerProfile.partnerId = userId;
    partnerProfile.coupleId = coupleId;  // ✅ ADD THIS!
    partnerProfile.updatedAt = new Date().toISOString();

    await kv.set(`user:${userId}`, userProfile);
    await kv.set(`user:${partnerId}`, partnerProfile);

    console.log(`✅ Couple created! CoupleId: ${coupleId}, User1: ${userId}, User2: ${partnerId}`);

    return c.json({ success: true, partner: partnerProfile });
  } catch (error: any) {
    console.error('Link by code error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Request partner disconnect (requires mutual agreement + 30-day grace period)
app.post('/make-server-6d579fee/partner/request-disconnect', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile?.partnerId) {
      return c.json({ error: 'No partner connection found' }, 400);
    }

    const partnerId = profile.partnerId;
    const partner = await kv.get(`user:${partnerId}`);
    
    // Check if there's already a disconnect request
    let disconnectRequest = await kv.get(`disconnect:${profile.coupleId}`);
    
    if (!disconnectRequest) {
      // Create new disconnect request
      disconnectRequest = {
        id: generateId(),
        coupleId: profile.coupleId,
        requestedBy: [userId],
        requestedAt: new Date().toISOString(),
        gracePeriodEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        status: 'pending' // pending | agreed | cancelled | completed
      };
      await kv.set(`disconnect:${profile.coupleId}`, disconnectRequest);
      
      // Send notification to partner
      const notificationId = generateId();
      const notification = {
        id: notificationId,
        userId: partnerId,
        type: 'partner_disconnect_request',
        title: '💔 Partner Disconnect Request',
        message: `${profile.name} has requested to disconnect. Both partners must agree to proceed.`,
        data: {
          requestedBy: profile.name,
          requestedAt: disconnectRequest.requestedAt,
          gracePeriodEnds: disconnectRequest.gracePeriodEnds
        },
        read: false,
        createdAt: new Date().toISOString()
      };
      await kv.set(`notification:${partnerId}:${notificationId}`, notification);
      
      console.log(`[Disconnect] User ${userId} requested disconnect from ${partnerId}. Grace period: 30 days.`);
      
      // TODO: Send email notification to partner
      // For now, we'll just log it. Email integration would require email service setup.
      console.log(`[Email] TODO: Send email to ${partner?.email}: "${profile.name} has requested to disconnect. Please review in the app."`);
      
      return c.json({ 
        success: true, 
        message: 'Disconnect request created. Your partner has been notified and must also agree.',
        gracePeriodEnds: disconnectRequest.gracePeriodEnds,
        status: 'pending'
      });
    } else {
      // Check if user already requested
      if (disconnectRequest.requestedBy.includes(userId)) {
        return c.json({ 
          error: 'You have already requested to disconnect',
          status: disconnectRequest.status,
          gracePeriodEnds: disconnectRequest.gracePeriodEnds
        }, 400);
      }
      
      // Partner agrees - add user to requestedBy array
      disconnectRequest.requestedBy.push(userId);
      disconnectRequest.status = 'agreed';
      disconnectRequest.bothAgreedAt = new Date().toISOString();
      await kv.set(`disconnect:${profile.coupleId}`, disconnectRequest);
      
      // Send notification to original requester
      const notificationId = generateId();
      const notification = {
        id: notificationId,
        userId: disconnectRequest.requestedBy[0], // Original requester
        type: 'partner_disconnect_agreed',
        title: '💔 Partner Agreed to Disconnect',
        message: `${profile.name} has agreed to disconnect. You have 30 days to cancel if you change your mind.`,
        data: {
          agreedBy: profile.name,
          agreedAt: disconnectRequest.bothAgreedAt,
          gracePeriodEnds: disconnectRequest.gracePeriodEnds
        },
        read: false,
        createdAt: new Date().toISOString()
      };
      await kv.set(`notification:${disconnectRequest.requestedBy[0]}:${notificationId}`, notification);
      
      console.log(`[Disconnect] Both partners agreed. Grace period ends: ${disconnectRequest.gracePeriodEnds}`);
      
      // TODO: Send email to both partners
      console.log(`[Email] TODO: Send emails to both partners about mutual disconnect agreement. Grace period: 30 days.`);
      
      return c.json({ 
        success: true, 
        message: 'Both partners have agreed to disconnect. You have 30 days to cancel if either of you change your mind.',
        gracePeriodEnds: disconnectRequest.gracePeriodEnds,
        status: 'agreed'
      });
    }
  } catch (error: any) {
    console.error('Request disconnect error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Cancel disconnect request (either partner can cancel)
app.post('/make-server-6d579fee/partner/cancel-disconnect', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile?.partnerId || !profile?.coupleId) {
      return c.json({ error: 'No partner connection found' }, 400);
    }

    const disconnectRequest = await kv.get(`disconnect:${profile.coupleId}`);
    if (!disconnectRequest) {
      return c.json({ error: 'No active disconnect request found' }, 404);
    }

    if (disconnectRequest.status === 'completed') {
      return c.json({ error: 'Disconnect already completed' }, 400);
    }

    // Cancel the request
    await kv.del(`disconnect:${profile.coupleId}`);
    
    // Notify both partners
    const partner = await kv.get(`user:${profile.partnerId}`);
    const notificationIds = [generateId(), generateId()];
    
    const notification1 = {
      id: notificationIds[0],
      userId: profile.partnerId,
      type: 'partner_disconnect_cancelled',
      title: '💚 Disconnect Request Cancelled',
      message: `${profile.name} has cancelled the disconnect request. You remain connected!`,
      data: { cancelledBy: profile.name },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const notification2 = {
      id: notificationIds[1],
      userId: userId,
      type: 'partner_disconnect_cancelled',
      title: '💚 Disconnect Request Cancelled',
      message: `You cancelled the disconnect request. You remain connected with ${partner?.name}!`,
      data: { cancelledBy: profile.name },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`notification:${profile.partnerId}:${notificationIds[0]}`, notification1);
    await kv.set(`notification:${userId}:${notificationIds[1]}`, notification2);
    
    console.log(`[Disconnect] Request cancelled by user ${userId}`);
    
    // TODO: Send email notifications
    console.log(`[Email] TODO: Send emails to both partners about disconnect cancellation.`);
    
    return c.json({ 
      success: true, 
      message: 'Disconnect request cancelled successfully. You remain connected with your partner.' 
    });
  } catch (error: any) {
    console.error('Cancel disconnect error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get disconnect request status
app.get('/make-server-6d579fee/partner/disconnect-status', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile?.coupleId) {
      return c.json({ hasRequest: false });
    }

    const disconnectRequest = await kv.get(`disconnect:${profile.coupleId}`);
    
    if (!disconnectRequest) {
      return c.json({ hasRequest: false });
    }

    // Check if grace period has ended and both agreed
    const gracePeriodEnded = new Date(disconnectRequest.gracePeriodEnds) <= new Date();
    
    if (gracePeriodEnded && disconnectRequest.status === 'agreed') {
      // Disconnect the couple automatically
      await executeDisconnect(profile.coupleId);
      return c.json({ 
        hasRequest: false,
        disconnected: true,
        message: 'Grace period ended. Partners have been disconnected.'
      });
    }

    return c.json({
      hasRequest: true,
      status: disconnectRequest.status,
      requestedBy: disconnectRequest.requestedBy,
      requestedAt: disconnectRequest.requestedAt,
      bothAgreedAt: disconnectRequest.bothAgreedAt,
      gracePeriodEnds: disconnectRequest.gracePeriodEnds,
      daysRemaining: Math.ceil((new Date(disconnectRequest.gracePeriodEnds).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      userRequested: disconnectRequest.requestedBy.includes(userId)
    });
  } catch (error: any) {
    console.error('Get disconnect status error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Helper function to execute disconnect
async function executeDisconnect(coupleId: string) {
  try {
    const couple = await kv.get(`couple:${coupleId}`);
    if (!couple) return;

    const user1 = await kv.get(`user:${couple.partner1Id}`);
    const user2 = await kv.get(`user:${couple.partner2Id}`);

    // Remove partner connections
    if (user1) {
      user1.partnerId = null;
      user1.coupleId = null;
      user1.updatedAt = new Date().toISOString();
      await kv.set(`user:${couple.partner1Id}`, user1);
    }

    if (user2) {
      user2.partnerId = null;
      user2.coupleId = null;
      user2.updatedAt = new Date().toISOString();
      await kv.set(`user:${couple.partner2Id}`, user2);
    }

    // Archive the couple record (don't delete, for data integrity)
    couple.status = 'disconnected';
    couple.disconnectedAt = new Date().toISOString();
    await kv.set(`couple:${coupleId}`, couple);

    // Delete disconnect request
    await kv.del(`disconnect:${coupleId}`);

    // Send final notifications
    const notificationIds = [generateId(), generateId()];
    
    const notification1 = {
      id: notificationIds[0],
      userId: couple.partner1Id,
      type: 'partner_disconnected',
      title: '💔 Partnership Ended',
      message: 'Your partnership has been disconnected. Your data remains private.',
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const notification2 = {
      id: notificationIds[1],
      userId: couple.partner2Id,
      type: 'partner_disconnected',
      title: '💔 Partnership Ended',
      message: 'Your partnership has been disconnected. Your data remains private.',
      read: false,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`notification:${couple.partner1Id}:${notificationIds[0]}`, notification1);
    await kv.set(`notification:${couple.partner2Id}:${notificationIds[1]}`, notification2);

    console.log(`[Disconnect] Couple ${coupleId} disconnected successfully`);
    
    // TODO: Send final email notifications
    console.log(`[Email] TODO: Send final disconnection emails to both partners.`);
  } catch (error) {
    console.error('[Disconnect] Error executing disconnect:', error);
  }
}

// Upload profile picture
app.post('/make-server-6d579fee/profile/upload-picture', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { imageData, fileName } = await c.req.json();
    
    if (!imageData) {
      return c.json({ error: 'Image data required' }, 400);
    }

    console.log('[POST /profile/upload-picture] Uploading profile picture for user:', userId);

    // Get user profile
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Create a Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Ensure the bucket exists
    const bucketName = 'make-6d579fee-profile-pictures';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('[POST /profile/upload-picture] Creating bucket:', bucketName);
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
    }

    // Delete old profile picture if exists
    if (profile.profilePicture) {
      const oldFileName = profile.profilePicture.split('/').pop();
      if (oldFileName) {
        console.log('[POST /profile/upload-picture] Deleting old picture:', oldFileName);
        await supabase.storage.from(bucketName).remove([`${userId}/${oldFileName}`]);
      }
    }

    // Convert base64 to buffer
    const base64Data = imageData.split(',')[1] || imageData;
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Generate unique filename
    const timestamp = Date.now();
    const extension = fileName?.split('.').pop() || 'jpg';
    const newFileName = `profile-${timestamp}.${extension}`;
    const filePath = `${userId}/${newFileName}`;

    console.log('[POST /profile/upload-picture] Uploading to path:', filePath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: `image/${extension}`,
        upsert: true
      });

    if (uploadError) {
      console.error('[POST /profile/upload-picture] Upload error:', uploadError);
      return c.json({ error: uploadError.message }, 500);
    }

    console.log('[POST /profile/upload-picture] Upload successful:', uploadData);

    // Get public URL (we'll use signed URL since bucket is private)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 years

    if (!signedUrlData?.signedUrl) {
      return c.json({ error: 'Failed to generate URL' }, 500);
    }

    const imageUrl = signedUrlData.signedUrl;
    console.log('[POST /profile/upload-picture] Generated signed URL');

    // Update profile with new picture URL
    profile.profilePicture = imageUrl;
    profile.updatedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, profile);

    console.log('[POST /profile/upload-picture] ✅ Profile picture updated successfully');

    return c.json({ 
      success: true, 
      imageUrl,
      profile 
    });
  } catch (error: any) {
    console.error('[POST /profile/upload-picture] Error:', error);
    return c.json({ error: error.message || 'Failed to upload picture' }, 500);
  }
});

// Delete profile picture
app.delete('/make-server-6d579fee/profile/delete-picture', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('[DELETE /profile/delete-picture] Deleting profile picture for user:', userId);

    // Get user profile
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    if (!profile.profilePicture) {
      return c.json({ error: 'No profile picture to delete' }, 400);
    }

    // Create a Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const bucketName = 'make-6d579fee-profile-pictures';
    
    // Extract filename from URL
    const fileName = profile.profilePicture.split('/').pop()?.split('?')[0];
    if (fileName) {
      const filePath = `${userId}/${fileName}`;
      console.log('[DELETE /profile/delete-picture] Deleting file:', filePath);
      
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (deleteError) {
        console.error('[DELETE /profile/delete-picture] Delete error:', deleteError);
        // Continue anyway - we'll clear the URL from profile
      }
    }

    // Update profile to remove picture URL
    profile.profilePicture = null;
    profile.updatedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, profile);

    console.log('[DELETE /profile/delete-picture] ✅ Profile picture deleted successfully');

    return c.json({ 
      success: true,
      profile 
    });
  } catch (error: any) {
    console.error('[DELETE /profile/delete-picture] Error:', error);
    return c.json({ error: error.message || 'Failed to delete picture' }, 500);
  }
});

// Export user data
app.get('/make-server-6d579fee/profile/export-data', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('[GET /profile/export-data] Exporting data for user:', userId);

    // Get user profile
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Get journal entries
    const journalEntries = await kv.getByPrefix(`journal:${userId}:`);

    // Get prayer requests
    const prayers = await kv.getByPrefix(`prayer:${userId}:`);

    // Get milestones
    const milestones = await kv.getByPrefix(`milestone:${userId}:`);

    // Get question responses
    const responses = await kv.getByPrefix(`response:${userId}:`);

    // Get devotional progress
    const devotionalProgress = await kv.getByPrefix(`devotional-progress:${userId}:`);

    // Get mood entries
    const moodEntries = await kv.getByPrefix(`mood:${userId}:`);

    // Get notifications
    const notifications = await kv.getByPrefix(`notification:${userId}:`);

    // Prepare export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
        relationshipStart: profile.relationshipStart,
        inviteCode: profile.inviteCode,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      },
      journalEntries: journalEntries.map((entry: any) => ({
        id: entry.id,
        content: entry.content,
        title: entry.title,
        mood: entry.mood,
        isShared: entry.isShared,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      })),
      prayers: prayers.map((prayer: any) => ({
        id: prayer.id,
        title: prayer.title,
        description: prayer.description,
        status: prayer.status,
        isShared: prayer.isShared,
        category: prayer.category,
        createdAt: prayer.createdAt,
        updatedAt: prayer.updatedAt
      })),
      milestones: milestones.map((milestone: any) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        date: milestone.date,
        category: milestone.category,
        createdAt: milestone.createdAt
      })),
      responses: responses.map((response: any) => ({
        id: response.id,
        questionId: response.questionId,
        answer: response.answer,
        category: response.category,
        createdAt: response.createdAt
      })),
      devotionalProgress: devotionalProgress,
      moodEntries: moodEntries.map((mood: any) => ({
        id: mood.id,
        mood: mood.mood,
        note: mood.note,
        createdAt: mood.createdAt
      })),
      notifications: notifications.map((notif: any) => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        isRead: notif.isRead,
        createdAt: notif.createdAt
      })),
      stats: {
        totalJournalEntries: journalEntries.length,
        totalPrayers: prayers.length,
        totalMilestones: milestones.length,
        totalResponses: responses.length,
        totalMoodEntries: moodEntries.length,
        totalNotifications: notifications.length
      }
    };

    console.log('[GET /profile/export-data] ✅ Data exported successfully');

    return c.json(exportData);
  } catch (error: any) {
    console.error('[GET /profile/export-data] Error:', error);
    return c.json({ error: error.message || 'Failed to export data' }, 500);
  }
});

// Delete account
app.delete('/make-server-6d579fee/profile/delete-account', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('[DELETE /profile/delete-account] Deleting account for user:', userId);

    // Get user profile
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // ✅ CHECK: User must not be connected to a partner
    if (profile.partnerId) {
      console.log('[DELETE /profile/delete-account] ❌ Cannot delete account - user is connected to partner:', profile.partnerId);
      return c.json({ 
        error: 'Cannot delete account while connected to a partner. Please disconnect from your partner first.',
        code: 'PARTNER_CONNECTED'
      }, 400);
    }

    // Create a Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Delete user's auth account
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('[DELETE /profile/delete-account] Auth delete error:', authError);
      // Continue anyway to clean up KV data
    }

    // Delete profile picture from storage if exists
    if (profile.profilePicture) {
      const bucketName = 'make-6d579fee-profile-pictures';
      const fileName = profile.profilePicture.split('/').pop()?.split('?')[0];
      if (fileName) {
        const filePath = `${userId}/${fileName}`;
        console.log('[DELETE /profile/delete-account] Deleting profile picture:', filePath);
        await supabase.storage.from(bucketName).remove([filePath]);
      }
    }

    // Delete all user data from KV store
    console.log('[DELETE /profile/delete-account] Deleting user data from KV store...');
    
    // Delete profile
    await kv.del(`user:${userId}`);
    
    // Delete journal entries
    const journalEntries = await kv.getByPrefix(`journal:${userId}:`);
    for (const entry of journalEntries) {
      await kv.del(`journal:${userId}:${entry.id}`);
    }
    
    // Delete prayer requests
    const prayers = await kv.getByPrefix(`prayer:${userId}:`);
    for (const prayer of prayers) {
      await kv.del(`prayer:${userId}:${prayer.id}`);
    }
    
    // Delete milestones
    const milestones = await kv.getByPrefix(`milestone:${userId}:`);
    for (const milestone of milestones) {
      await kv.del(`milestone:${userId}:${milestone.id}`);
    }
    
    // Delete question responses
    const responses = await kv.getByPrefix(`response:${userId}:`);
    for (const response of responses) {
      await kv.del(`response:${userId}:${response.id}`);
    }
    
    // Delete devotional progress
    const devotionalProgress = await kv.getByPrefix(`devotional-progress:${userId}:`);
    for (const progress of devotionalProgress) {
      await kv.del(`devotional-progress:${userId}:${progress.id}`);
    }
    
    // Delete mood entries
    const moodEntries = await kv.getByPrefix(`mood:${userId}:`);
    for (const mood of moodEntries) {
      await kv.del(`mood:${userId}:${mood.id}`);
    }
    
    // Delete notifications
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    for (const notif of notifications) {
      await kv.del(`notification:${userId}:${notif.id}`);
    }
    
    // Delete push subscriptions
    const pushSubscriptions = await kv.getByPrefix(`push-subscription:${userId}:`);
    for (const sub of pushSubscriptions) {
      await kv.del(`push-subscription:${userId}:${sub.id}`);
    }

    console.log('[DELETE /profile/delete-account] ✅ Account and all data deleted successfully');

    return c.json({ 
      success: true,
      message: 'Your account and all associated data have been permanently deleted.'
    });
  } catch (error: any) {
    console.error('[DELETE /profile/delete-account] Error:', error);
    return c.json({ error: error.message || 'Failed to delete account' }, 500);
  }
});

// ============================================
// JOURNAL ENTRIES
// ============================================

app.get('/make-server-6d579fee/journal', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`[GET /journal] Loading journal for user: ${userId}`);

    // Retry helper with timeout (increased to 10s for better reliability)
    const fetchWithRetry = async (fetchFn: () => Promise<any>, context: string, timeout = 10000, retries = 2) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), timeout);
          });
          const result = await Promise.race([fetchFn(), timeoutPromise]);
          if (attempt > 1) {
            console.log(`[GET /journal] ${context} succeeded on retry ${attempt}`);
          }
          return result;
        } catch (error: any) {
          if (attempt === retries) {
            console.error(`[GET /journal] ${context} failed after ${retries} attempts:`, error.message);
            throw error;
          }
          console.log(`[GET /journal] ${context} attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    };

    // Fetch user profile with fallback
    let profile = null;
    try {
      profile = await fetchWithRetry(() => kv.get(`user:${userId}`), 'Profile', 5000, 2);
    } catch (error) {
      console.error('[GET /journal] Profile fetch failed, continuing');
    }
    
    // Fetch user entries - critical, but don't fail completely
    let userEntries: any[] = [];
    try {
      userEntries = await fetchWithRetry(() => kv.getByPrefix(`journal:${userId}:`), 'User entries', 10000, 2);
      console.log(`[GET /journal] Found ${userEntries.length} user entries`);
    } catch (error) {
      console.error('[GET /journal] User entries fetch timeout, returning empty array');
      // Return empty instead of error - allows app to continue
      userEntries = [];
    }
    
    // Partner entries - optional
    let partnerEntries: any[] = [];
    if (profile?.partnerId) {
      try {
        const allPartnerEntries = await fetchWithRetry(
          () => kv.getByPrefix(`journal:${profile.partnerId}:`), 
          'Partner entries',
          8000,
          2
        );
        partnerEntries = allPartnerEntries
          .filter((e: any) => e.isShared)
          .map((e: any) => ({ ...e, isPartner: true }));
        console.log(`[GET /journal] Found ${partnerEntries.length} partner entries`);
      } catch (error: any) {
        console.error('[GET /journal] Partner entries timeout, continuing');
      }
    }

    // Combine and limit
    const entries = [...userEntries, ...partnerEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100);

    console.log(`[GET /journal] ✅ Returning ${entries.length} entries`);
    return c.json({ entries });
  } catch (error: any) {
    console.error('[GET /journal] Error:', error);
    
    // Provide specific error messages
    if (error.message?.includes('timeout')) {
      return c.json({ 
        error: 'Request timeout: The database query took too long. Please try again.' 
      }, 504); // Gateway Timeout
    }
    
    return c.json({ 
      error: error.message || 'Failed to fetch journal entries' 
    }, 500);
  }
});

app.post('/make-server-6d579fee/journal', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, content, isShared, emoji, location, entryType, mediaFiles, createdAt } = await c.req.json();

    // Content is required for journal entries, but optional for events
    if (entryType !== 'event' && !content) {
      return c.json({ error: 'Content is required for journal entries' }, 400);
    }

    // Title is always required
    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const entryId = generateId();
    const entry = {
      id: entryId,
      userId,
      title,
      content: content || '',
      isShared: isShared || false,
      emoji: emoji || (entryType === 'event' ? '✨' : '📝'),
      location: location || null,
      entryType: entryType || 'journal',
      mediaFiles: mediaFiles || [],
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`journal:${userId}:${entryId}`, entry);

    return c.json({ success: true, entry });
  } catch (error: any) {
    console.error('Journal create error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-6d579fee/journal/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entryId = c.req.param('id');
    const updates = await c.req.json();

    console.log('=== JOURNAL UPDATE DEBUG ===');
    console.log('Entry ID:', entryId);
    console.log('Updates received:', updates);
    console.log('CreatedAt in updates:', updates.createdAt);
    console.log('===========================');

    // Try to find entry in user's entries first
    let entry = await kv.get(`journal:${userId}:${entryId}`);
    let entryKey = `journal:${userId}:${entryId}`;
    let isOwnEntry = true;
    
    // If not found, check if it's a partner's entry (for comments)
    if (!entry) {
      const profile = await kv.get(`user:${userId}`);
      const partnerId = profile?.partnerId;
      
      if (partnerId) {
        const partnerEntry = await kv.get(`journal:${partnerId}:${entryId}`);
        if (partnerEntry) {
          entry = partnerEntry;
          entryKey = `journal:${partnerId}:${entryId}`;
          isOwnEntry = false;
        }
      }
    }

    if (!entry) {
      return c.json({ error: 'Entry not found' }, 404);
    }

    // Only allow certain fields to be updated on partner entries (like comments)
    let updatedEntry;
    if (isOwnEntry) {
      // Can update everything on own entries
      updatedEntry = {
        ...entry,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      console.log('=== UPDATED ENTRY ===');
      console.log('Old createdAt:', entry.createdAt);
      console.log('New createdAt:', updatedEntry.createdAt);
      console.log('====================');
    } else {
      // Only allow updating comments on partner entries
      updatedEntry = {
        ...entry,
        comments: updates.comments || entry.comments,
        updatedAt: new Date().toISOString()
      };
    }

    await kv.set(entryKey, updatedEntry);

    return c.json({ success: true, entry: updatedEntry });
  } catch (error: any) {
    console.error('Journal update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-6d579fee/journal/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entryId = c.req.param('id');
    const entryKey = `journal:${userId}:${entryId}`;
    
    console.log('[DELETE /journal/:id] Attempting to delete:', { userId, entryId, entryKey });
    
    // Check if entry exists before deleting
    const existingEntry = await kv.get(entryKey);
    console.log('[DELETE /journal/:id] Entry exists:', !!existingEntry);
    
    if (!existingEntry) {
      console.log('[DELETE /journal/:id] Entry not found');
      return c.json({ error: 'Entry not found' }, 404);
    }
    
    await kv.del(entryKey);
    console.log('[DELETE /journal/:id] Entry deleted successfully');
    
    // Verify deletion
    const verifyDeleted = await kv.get(entryKey);
    if (verifyDeleted) {
      console.error('[DELETE /journal/:id] ⚠️ WARNING: Entry still exists after deletion!');
      return c.json({ error: 'Delete failed - entry still exists' }, 500);
    }
    
    console.log('[DELETE /journal/:id] ✅ Deletion verified');

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Journal delete error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// PRAYER REQUESTS
// ============================================

app.get('/make-server-6d579fee/prayer', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`[GET /prayer] Loading prayers for user: ${userId}`);

    // Get profile (for partner connection)
    let profile = null;
    try {
      profile = await kv.get(`user:${userId}`);
      console.log(`[GET /prayer] Profile loaded, partnerId: ${profile?.partnerId || 'none'}`);
    } catch (error: any) {
      console.error('[GET /prayer] Profile fetch failed:', error.message);
      // Continue without profile
    }
    
    // Get user prayers
    let userPrayers: any[] = [];
    try {
      userPrayers = await kv.getByPrefix(`prayer:${userId}:`);
      console.log(`[GET /prayer] User prayers count: ${userPrayers.length}`);
    } catch (error: any) {
      console.error('[GET /prayer] User prayers error:', error.message);
      userPrayers = []; // Continue with empty array
    }
    
    // Get partner prayers if connected
    let partnerPrayers: any[] = [];
    if (profile?.partnerId) {
      try {
        partnerPrayers = await kv.getByPrefix(`prayer:${profile.partnerId}:`);
        partnerPrayers = partnerPrayers.map((p: any) => ({ ...p, isPartner: true }));
        console.log(`[GET /prayer] Partner prayers count: ${partnerPrayers.length}`);
      } catch (error: any) {
        console.error('[GET /prayer] Partner prayers error:', error.message);
        // Continue without partner prayers
      }
    }

    const prayers = [...userPrayers, ...partnerPrayers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 200);

    console.log(`[GET /prayer] Returning ${prayers.length} total prayers`);
    return c.json({ prayers, hasCoupleConnection: !!profile?.partnerId });
  } catch (error: any) {
    console.error('[GET /prayer] Error:', error.message);
    return c.json({ error: error.message || 'Failed to fetch prayers' }, 500);
  }
});

app.post('/make-server-6d579fee/prayer', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, description, isShared } = await c.req.json();

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const prayerId = generateId();
    const prayer = {
      id: prayerId,
      userId,
      title,
      description: description || '',
      isShared: isShared || false,
      isAnswered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`prayer:${userId}:${prayerId}`, prayer);

    return c.json({ success: true, prayer });
  } catch (error: any) {
    console.error('Prayer create error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-6d579fee/prayer/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const prayerId = c.req.param('id');
    const updates = await c.req.json();

    const prayer = await kv.get(`prayer:${userId}:${prayerId}`);
    if (!prayer) {
      return c.json({ error: 'Prayer not found' }, 404);
    }

    const updatedPrayer = {
      ...prayer,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`prayer:${userId}:${prayerId}`, updatedPrayer);

    return c.json({ success: true, prayer: updatedPrayer });
  } catch (error: any) {
    console.error('Prayer update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-6d579fee/prayer/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const prayerId = c.req.param('id');
    await kv.del(`prayer:${userId}:${prayerId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Prayer delete error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// MOODS
// ============================================

app.post('/make-server-6d579fee/moods', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { mood, note } = await c.req.json();

    const moodId = generateId();
    const moodEntry = {
      id: moodId,
      userId,
      mood,
      note: note || '',
      createdAt: new Date().toISOString()
    };

    await kv.set(`mood:${userId}:${moodId}`, moodEntry);

    return c.json({ success: true, mood: moodEntry });
  } catch (error: any) {
    console.error('Mood save error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-6d579fee/moods', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // KV fetch with timeout and retry logic
    const queryTimeout = 8000;
    const fetchWithTimeout = async (fetchFn: () => Promise<any>, context: string, retries = 2) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), queryTimeout);
          });
          const result = await Promise.race([fetchFn(), timeoutPromise]);
          if (attempt > 1) {
            console.log(`[GET /moods] ${context} succeeded on retry ${attempt}`);
          }
          return result;
        } catch (error: any) {
          if (attempt === retries) {
            console.error(`[GET /moods] ${context} failed after ${retries} attempts:`, error.message);
            throw error;
          }
          console.log(`[GET /moods] ${context} attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        }
      }
    };

    let profile = null;
    try {
      profile = await fetchWithTimeout(() => kv.get(`user:${userId}`), 'Profile');
      console.log('[GET /moods] Profile loaded:', profile ? `userId: ${profile.id}, partnerId: ${profile.partnerId || 'none'}` : 'null');
    } catch (error: any) {
      console.error('[GET /moods] Profile fetch failed:', error.message);
      // Continue without profile - moods will still load
    }
    
    let userMoods: any[] = [];
    try {
      userMoods = await fetchWithTimeout(() => kv.getByPrefix(`mood:${userId}:`), 'User moods');
      console.log('[GET /moods] User moods loaded:', userMoods.length);
    } catch (error: any) {
      console.error('[GET /moods] User moods timeout:', error.message);
      return c.json({ moods: [], warning: 'Could not load moods. Try again.' });
    }
    
    let partnerMoods: any[] = [];
    if (profile?.partnerId) {
      try {
        partnerMoods = await fetchWithTimeout(() => kv.getByPrefix(`mood:${profile.partnerId}:`), 'Partner moods');
        console.log('[GET /moods] Partner moods loaded:', partnerMoods.length);
      } catch (error: any) {
        console.error('[GET /moods] Partner moods timeout:', error.message);
      }
    } else {
      console.log('[GET /moods] No partner, skipping partner moods');
    }

    const allMoods = [...userMoods, ...partnerMoods]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 500);

    return c.json({ moods: allMoods });
  } catch (error: any) {
    console.error('[GET /moods] Error:', error);
    if (error.message?.includes('timeout')) {
      return c.json({ error: 'Request timeout. Please try again.' }, 504);
    }
    return c.json({ error: error.message || 'Failed to fetch moods' }, 500);
  }
});

// AI Mood Analysis - Analyze mood patterns using OpenAI
app.post('/make-server-6d579fee/moods/analyze', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile?.partnerId) {
      return c.json({ error: 'Partner required for mood analysis' }, 400);
    }

    // Get moods from the last 7 days for both partners
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userMoods = await kv.getByPrefix(`mood:${userId}:`);
    const partnerMoods = await kv.getByPrefix(`mood:${profile.partnerId}:`);

    const recentUserMoods = userMoods.filter((m: any) => 
      new Date(m.createdAt) >= sevenDaysAgo
    );
    const recentPartnerMoods = partnerMoods.filter((m: any) => 
      new Date(m.createdAt) >= sevenDaysAgo
    );

    if (recentUserMoods.length === 0 && recentPartnerMoods.length === 0) {
      return c.json({ 
        error: 'Not enough mood data to analyze. Track your moods for a few days first!' 
      }, 400);
    }

    // Prepare mood data for AI analysis
    const moodSummary = {
      userName: profile.name,
      userMoods: recentUserMoods.map((m: any) => ({
        mood: m.mood,
        note: m.note,
        date: new Date(m.createdAt).toLocaleDateString()
      })),
      partnerName: (await kv.get(`user:${profile.partnerId}`))?.name || 'Partner',
      partnerMoods: recentPartnerMoods.map((m: any) => ({
        mood: m.mood,
        note: m.note,
        date: new Date(m.createdAt).toLocaleDateString()
      }))
    };

    // Call OpenAI for analysis
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return c.json({ error: 'AI analysis not available. Please configure OpenAI API key.' }, 500);
    }
    
    // Validate API key format
    if (!openaiApiKey.startsWith('sk-')) {
      console.error('OpenAI API key appears invalid - should start with sk-');
      return c.json({ error: 'Invalid OpenAI API key format. Please check your API key.' }, 500);
    }
    
    console.log('Making OpenAI API call for mood analysis...');

    const prompt = `You are a Christian relationship counselor analyzing mood patterns for a couple using the TwoBeOne app.

Mood Data (Last 7 Days):
${profile.name}'s Moods: ${JSON.stringify(moodSummary.userMoods, null, 2)}
${moodSummary.partnerName}'s Moods: ${JSON.stringify(moodSummary.partnerMoods, null, 2)}

Provide a compassionate, faith-based analysis including:
1. Overall emotional trends for each partner
2. Patterns or correlations between their moods
3. Positive observations and celebrations
4. Gentle suggestions for spiritual and emotional growth
5. Bible verse or principle that relates to their journey
6. Specific prayer points for the couple

Keep the tone warm, encouraging, and Christ-centered. Limit response to 300 words.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate Christian relationship counselor specializing in emotional wellness and spiritual growth for couples.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      
      // Try to parse the error for more details
      let errorMessage = 'Failed to generate mood analysis';
      try {
        const errorJson = JSON.parse(error);
        errorMessage = errorJson.error?.message || errorMessage;
        
        // Only log quota errors once with minimal detail
        if (errorJson.error?.code === 'insufficient_quota' || 
            errorMessage.includes('quota') || 
            errorMessage.includes('billing')) {
          console.warn('[Mood Analysis] OpenAI quota exceeded (status: ' + openaiResponse.status + ') - AI features temporarily unavailable');
          errorMessage = 'quota_exceeded';
        } else if (errorJson.error?.code === 'invalid_api_key') {
          console.error('[Mood Analysis] Invalid OpenAI API key');
          errorMessage = 'Invalid OpenAI API key. Please update your API key in the environment variables.';
        } else if (errorJson.error?.code === 'rate_limit_exceeded') {
          console.warn('[Mood Analysis] OpenAI rate limit exceeded - Temporary limit');
          errorMessage = 'rate_limit_exceeded';
        } else {
          // Log other errors with more detail
          console.error('[Mood Analysis] OpenAI API error:', errorJson);
        }
      } catch (e) {
        console.error('[Mood Analysis] OpenAI error (could not parse):', error);
      }
      
      return c.json({ error: errorMessage }, 500);
    }

    const aiData = await openaiResponse.json();
    const analysis = aiData.choices[0].message.content;

    // Calculate simple statistics
    const moodValues: Record<string, number> = { great: 4, good: 3, okay: 2, sad: 1 };
    const userAvg = recentUserMoods.length > 0 
      ? recentUserMoods.reduce((sum: number, m: any) => sum + (moodValues[m.mood] || 0), 0) / recentUserMoods.length
      : 0;
    const partnerAvg = recentPartnerMoods.length > 0
      ? recentPartnerMoods.reduce((sum: number, m: any) => sum + (moodValues[m.mood] || 0), 0) / recentPartnerMoods.length
      : 0;

    const analysisResult = {
      id: generateId(),
      userId,
      analysis,
      period: {
        start: sevenDaysAgo.toISOString(),
        end: new Date().toISOString()
      },
      statistics: {
        userMoodCount: recentUserMoods.length,
        partnerMoodCount: recentPartnerMoods.length,
        userAverageMood: userAvg.toFixed(2),
        partnerAverageMood: partnerAvg.toFixed(2),
        userMoodDistribution: {
          great: recentUserMoods.filter((m: any) => m.mood === 'great').length,
          good: recentUserMoods.filter((m: any) => m.mood === 'good').length,
          okay: recentUserMoods.filter((m: any) => m.mood === 'okay').length,
          sad: recentUserMoods.filter((m: any) => m.mood === 'sad').length
        },
        partnerMoodDistribution: {
          great: recentPartnerMoods.filter((m: any) => m.mood === 'great').length,
          good: recentPartnerMoods.filter((m: any) => m.mood === 'good').length,
          okay: recentPartnerMoods.filter((m: any) => m.mood === 'okay').length,
          sad: recentPartnerMoods.filter((m: any) => m.mood === 'sad').length
        }
      },
      createdAt: new Date().toISOString()
    };

    // Save analysis
    await kv.set(`mood-analysis:${userId}:${analysisResult.id}`, analysisResult);

    return c.json({ analysis: analysisResult });
  } catch (error: any) {
    console.error('Mood analysis error:', error);
    console.error('Error stack:', error.stack);
    const errorMessage = error.message || 'Failed to generate mood analysis';
    return c.json({ error: errorMessage }, 500);
  }
});

// Test OpenAI API key endpoint
app.get('/make-server-6d579fee/moods/test-openai', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return c.json({ 
        configured: false, 
        message: 'OpenAI API key is not configured' 
      });
    }
    
    if (!openaiApiKey.startsWith('sk-')) {
      return c.json({ 
        configured: true, 
        valid: false,
        message: 'OpenAI API key format appears invalid (should start with sk-)' 
      });
    }

    // Try a simple test call to OpenAI
    try {
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`
        }
      });

      if (testResponse.ok) {
        return c.json({ 
          configured: true, 
          valid: true,
          message: 'OpenAI API key is working correctly!' 
        });
      } else {
        const error = await testResponse.text();
        return c.json({ 
          configured: true, 
          valid: false,
          message: `OpenAI API key test failed: ${testResponse.status}`,
          details: error
        });
      }
    } catch (fetchError: any) {
      return c.json({ 
        configured: true, 
        valid: false,
        message: 'Failed to connect to OpenAI API',
        details: fetchError.message
      });
    }
  } catch (error: any) {
    console.error('OpenAI test error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get mood analysis history
app.get('/make-server-6d579fee/moods/analysis', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const analyses = await kv.getByPrefix(`mood-analysis:${userId}:`);
    const sortedAnalyses = analyses.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ analyses: sortedAnalyses });
  } catch (error: any) {
    console.error('Analysis fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate and send weekly mood report to both partners
app.post('/make-server-6d579fee/moods/weekly-report', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile?.partnerId) {
      return c.json({ error: 'Partner required for weekly reports' }, 400);
    }

    const partner = await kv.get(`user:${profile.partnerId}`);

    // Get moods from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userMoods = await kv.getByPrefix(`mood:${userId}:`);
    const partnerMoods = await kv.getByPrefix(`mood:${profile.partnerId}:`);

    const recentUserMoods = userMoods.filter((m: any) => 
      new Date(m.createdAt) >= sevenDaysAgo
    );
    const recentPartnerMoods = partnerMoods.filter((m: any) => 
      new Date(m.createdAt) >= sevenDaysAgo
    );

    if (recentUserMoods.length === 0 && recentPartnerMoods.length === 0) {
      return c.json({ 
        error: 'Not enough mood data for a weekly report. Keep tracking your moods!' 
      }, 400);
    }

    // Calculate statistics
    const moodValues: Record<string, number> = { great: 4, good: 3, okay: 2, sad: 1 };
    const userAvg = recentUserMoods.length > 0 
      ? recentUserMoods.reduce((sum: number, m: any) => sum + (moodValues[m.mood] || 0), 0) / recentUserMoods.length
      : 0;
    const partnerAvg = recentPartnerMoods.length > 0
      ? recentPartnerMoods.reduce((sum: number, m: any) => sum + (moodValues[m.mood] || 0), 0) / recentPartnerMoods.length
      : 0;

    // Generate AI analysis
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let aiAnalysis = 'AI analysis unavailable. Please track moods and check back next week!';

    if (openaiApiKey) {
      const moodSummary = {
        userName: profile.name,
        userMoods: recentUserMoods.map((m: any) => ({
          mood: m.mood,
          note: m.note,
          date: new Date(m.createdAt).toLocaleDateString()
        })),
        partnerName: partner?.name || 'Partner',
        partnerMoods: recentPartnerMoods.map((m: any) => ({
          mood: m.mood,
          note: m.note,
          date: new Date(m.createdAt).toLocaleDateString()
        }))
      };

      const prompt = `Create a brief weekly mood report for a Christian couple:

${profile.name}: ${recentUserMoods.length} mood entries, average ${userAvg.toFixed(1)}/4
${partner?.name}: ${recentPartnerMoods.length} mood entries, average ${partnerAvg.toFixed(1)}/4

Recent moods:
${profile.name}: ${moodSummary.userMoods.map(m => `${m.mood} (${m.date})`).join(', ')}
${partner?.name}: ${moodSummary.partnerMoods.map(m => `${m.mood} (${m.date})`).join(', ')}

Provide:
1. A warm, encouraging summary (2-3 sentences)
2. One specific observation about their emotional journey
3. A relevant Bible verse or spiritual encouragement
4. One actionable suggestion for the week ahead

Keep it under 150 words, loving and Christ-centered.`;

      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a compassionate Christian counselor creating encouraging weekly mood reports for couples.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 300
          })
        });

        if (openaiResponse.ok) {
          const aiData = await openaiResponse.json();
          aiAnalysis = aiData.choices[0].message.content;
        } else {
          const error = await openaiResponse.text();
          
          // Try to parse error for specific messages
          try {
            const errorJson = JSON.parse(error);
            const errorMsg = errorJson.error?.message || '';
            
            // Only log quota errors once with minimal detail
            if (errorJson.error?.code === 'insufficient_quota' || 
                errorMsg.includes('quota') || 
                errorMsg.includes('billing')) {
              console.warn('[Weekly Report] OpenAI quota exceeded (status: ' + openaiResponse.status + ') - Using fallback message');
              aiAnalysis = `📊 Weekly Mood Summary

✨ Great job tracking your moods this week! While AI analysis is temporarily unavailable, here's what the data shows:

${profile.name}: ${recentUserMoods.length} mood entries (avg: ${userAvg.toFixed(1)}/4)
${partner?.name}: ${recentPartnerMoods.length} mood entries (avg: ${partnerAvg.toFixed(1)}/4)

Keep sharing your feelings with each other - communication is key! 💝

💡 Tip: To enable AI-powered insights, add credits to your OpenAI account at platform.openai.com/account/billing`;
            } else if (errorMsg.includes('rate_limit')) {
              console.warn('[Weekly Report] OpenAI rate limit exceeded - Using fallback message');
              aiAnalysis = `📊 Weekly Mood Summary

${profile.name}: ${recentUserMoods.length} mood entries (avg: ${userAvg.toFixed(1)}/4)
${partner?.name}: ${recentPartnerMoods.length} mood entries (avg: ${partnerAvg.toFixed(1)}/4)

AI analysis is experiencing high demand. Your statistics are tracked above. Try again in a few moments for AI insights! 💝`;
            } else {
              console.error('[Weekly Report] OpenAI API error:', errorJson);
              aiAnalysis = `📊 Weekly Mood Summary

${profile.name}: ${recentUserMoods.length} mood entries (avg: ${userAvg.toFixed(1)}/4)
${partner?.name}: ${recentPartnerMoods.length} mood entries (avg: ${partnerAvg.toFixed(1)}/4)

Your mood data is tracked! AI insights will be available when the service is restored. 💝`;
            }
          } catch (e) {
            console.error('[Weekly Report] OpenAI error (could not parse):', error);
          }
        }
      } catch (error) {
        console.error('AI analysis generation failed:', error);
      }
    }

    // Create notifications for both partners
    const reportSummary = `Weekly Mood Report: ${profile.name} (${userAvg.toFixed(1)}/4) & ${partner?.name || 'Partner'} (${partnerAvg.toFixed(1)}/4)`;

    // Notification for user
    const userNotificationId = generateId();
    const userNotification = {
      id: userNotificationId,
      userId,
      type: 'mood_report',
      title: '💝 Weekly Mood Report',
      message: reportSummary,
      data: {
        analysis: aiAnalysis,
        userAverage: userAvg.toFixed(1),
        partnerAverage: partnerAvg.toFixed(1),
        period: `${sevenDaysAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`
      },
      read: false,
      createdAt: new Date().toISOString()
    };

    // Notification for partner
    const partnerNotificationId = generateId();
    const partnerNotification = {
      id: partnerNotificationId,
      userId: profile.partnerId,
      type: 'mood_report',
      title: '💝 Weekly Mood Report',
      message: reportSummary,
      data: {
        analysis: aiAnalysis,
        userAverage: partnerAvg.toFixed(1),
        partnerAverage: userAvg.toFixed(1),
        period: `${sevenDaysAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`
      },
      read: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`notification:${userId}:${userNotificationId}`, userNotification);
    await kv.set(`notification:${profile.partnerId}:${partnerNotificationId}`, partnerNotification);

    console.log(`[Weekly Report] Generated for ${profile.name} & ${partner?.name}`);

    return c.json({ 
      success: true, 
      report: {
        analysis: aiAnalysis,
        userAverage: userAvg.toFixed(1),
        partnerAverage: partnerAvg.toFixed(1),
        userMoodCount: recentUserMoods.length,
        partnerMoodCount: recentPartnerMoods.length
      }
    });
  } catch (error: any) {
    console.error('Weekly report error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// NOTIFICATIONS
// ============================================

app.get('/make-server-6d579fee/notifications', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notifications = await kv.getByPrefix(`notification:${userId}:`) || [];
    console.log('[Notifications] Raw notifications:', notifications);
    
    // Ensure notifications is an array and has valid data
    const validNotifications = Array.isArray(notifications) 
      ? notifications.filter(n => n && typeof n === 'object')
      : [];
    
    const sortedNotifications = validNotifications.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return c.json({ notifications: sortedNotifications });
  } catch (error: any) {
    console.error('Notifications fetch error:', error);
    return c.json({ error: error.message || 'Failed to fetch notifications' }, 500);
  }
});

app.post('/make-server-6d579fee/notifications', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { recipientId, type, title, message, data } = await c.req.json();

    if (!recipientId || !type || !title || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const notificationId = generateId();
    const notification = {
      id: notificationId,
      recipientId,
      senderId: userId,
      type,
      title,
      message,
      data: data || null,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`notification:${recipientId}:${notificationId}`, notification);

    return c.json({ success: true, notification });
  } catch (error: any) {
    console.error('Notification create error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Mark notification as read
app.patch('/make-server-6d579fee/notifications/:id/read', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('id');
    const notification = await kv.get(`notification:${userId}:${notificationId}`);

    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    const updatedNotification = {
      ...notification,
      isRead: true,
      readAt: new Date().toISOString()
    };

    await kv.set(`notification:${userId}:${notificationId}`, updatedNotification);

    return c.json({ success: true, notification: updatedNotification });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// Mark all notifications as read
app.post('/make-server-6d579fee/notifications/read-all', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    for (const notification of notifications) {
      if (!notification.isRead) {
        const updated = {
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        };
        await kv.set(`notification:${userId}:${notification.id}`, updated);
      }
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    return c.json({ error: 'Failed to mark all notifications as read' }, 500);
  }
});

// Delete a notification
app.delete('/make-server-6d579fee/notifications/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const notificationId = c.req.param('id');
    await kv.del(`notification:${userId}:${notificationId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return c.json({ error: 'Failed to delete notification' }, 500);
  }
});

// ============================================
// QUESTIONS & ANSWERS
// ============================================

// Get today's daily question
app.get('/make-server-6d579fee/daily-question', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}`);
    const userResponses = await kv.getByPrefix(`response:${userId}:`);
    
    let partnerResponses: any[] = [];
    if (profile?.partnerId) {
      const allPartnerResponses = await kv.getByPrefix(`response:${profile.partnerId}:`);
      partnerResponses = allPartnerResponses.filter((r: any) => !r.isPrivate);
    }

    return c.json({ userResponses, partnerResponses });
  } catch (error: any) {
    console.error('Responses fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-6d579fee/question-responses', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { question_id, response, is_private } = await c.req.json();

    const responseId = generateId();
    const responseEntry = {
      id: responseId,
      userId,
      questionId: question_id,
      response,
      isPrivate: is_private || false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`response:${userId}:${question_id}`, responseEntry);

    return c.json({ success: true, response: responseEntry });
  } catch (error: any) {
    console.error('Response save error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get question responses
app.get('/make-server-6d579fee/question-responses', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const category = c.req.query('category');

    const queryTimeout = 8000;
    const fetchWithTimeout = async (promise: Promise<any>, context: string) => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`${context} timeout`)), queryTimeout);
      });
      try {
        return await Promise.race([promise, timeoutPromise]);
      } catch (error: any) {
        console.error(`[GET /question-responses] ${context}:`, error.message);
        throw error;
      }
    };

    // Expand new-format question-response entries (key: question-response:userId:questionId)
    // into per-prompt records matching the shape the frontend attachResponses() expects:
    // { questionId, promptId, response, userId, coupleId, createdAt }
    const expandNewFormatResponses = (entries: any[]): any[] => {
      const out: any[] = [];
      for (const entry of entries) {
        if (!entry?.answers || typeof entry.answers !== 'object') continue;
        for (const [promptId, value] of Object.entries(entry.answers)) {
          out.push({
            questionId: entry.questionId,
            promptId,
            response: value,
            userId: entry.userId,
            coupleId: entry.coupleId || null,
            createdAt: entry.createdAt,
          });
        }
      }
      return out;
    };

    let userResponses: any[] = [];
    try {
      // Read both key formats in parallel: legacy (response:) and current (question-response:)
      const [legacyRaw, newFormatRaw] = await fetchWithTimeout(
        Promise.all([
          kv.getByPrefix(`response:${userId}:`),
          kv.getByPrefix(`question-response:${userId}:`),
        ]),
        'User responses'
      );

      const legacyResponses: any[] = legacyRaw || [];
      const newFormatExpanded = expandNewFormatResponses(newFormatRaw || []);

      // Merge, deduplicating by questionId+promptId (new format wins)
      const seen = new Set<string>();
      for (const r of newFormatExpanded) {
        seen.add(`${r.questionId}:${r.promptId ?? 'default'}`);
      }
      const filteredLegacy = legacyResponses.filter((r: any) => {
        const key = `${r.questionId}:${r.promptId ?? 'default'}`;
        return !seen.has(key);
      });

      userResponses = [...newFormatExpanded, ...filteredLegacy];
      // NOTE: Do NOT filter by category here. Response objects have no category field.
      // The client matches responses to questions by questionId, so the category is
      // irrelevant at the response layer — filtering here always wiped all results.
    } catch (error) {
      console.error('[GET /question-responses] User responses timeout, returning empty');
      return c.json({ userResponses: [], partnerResponses: [] });
    }

    let userProfile = null;
    try {
      userProfile = await fetchWithTimeout(kv.get(`user:${userId}`), 'Profile');
    } catch (error) {
      console.error('[GET /question-responses] Profile fetch timeout');
      return c.json({ userResponses, partnerResponses: [] });
    }

    let partnerResponses: any[] = [];
    if (userProfile?.partnerId) {
      const partnerId = userProfile.partnerId;
      try {
        const [legacyPartnerRaw, newFormatPartnerRaw] = await fetchWithTimeout(
          Promise.all([
            kv.getByPrefix(`response:${partnerId}:`),
            kv.getByPrefix(`question-response:${partnerId}:`),
          ]),
          'Partner responses'
        );

        const legacyPartner: any[] = (legacyPartnerRaw || []).filter((r: any) => !r.isPrivate);
        const newFormatPartnerExpanded = expandNewFormatResponses(newFormatPartnerRaw || []);

        const seenPartner = new Set<string>();
        for (const r of newFormatPartnerExpanded) {
          seenPartner.add(`${r.questionId}:${r.promptId ?? 'default'}`);
        }
        const filteredLegacyPartner = legacyPartner.filter((r: any) => {
          const key = `${r.questionId}:${r.promptId ?? 'default'}`;
          return !seenPartner.has(key);
        });

        partnerResponses = [...newFormatPartnerExpanded, ...filteredLegacyPartner];
        // NOTE: Same as user responses — no category filter here.
      } catch (error) {
        console.error('[GET /question-responses] Partner responses timeout, continuing with user data only');
      }
    }

    return c.json({ userResponses, partnerResponses });
  } catch (error: any) {
    console.error('[GET /question-responses] Unexpected error:', error);
    return c.json({ userResponses: [], partnerResponses: [] }, 200);
  }
});

// ============================================
// QUESTION CHAT
// ============================================

// Get question chat messages
app.get('/make-server-6d579fee/question-chat/:questionId', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const questionId = c.req.param('questionId');
    console.log('Loading messages for questionId:', questionId);
    
    // Get user profile to check for partner
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      console.error('Profile not found for userId:', userId);
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Get all messages for this question chat
    const prefix = `question_chat:${questionId}:`;
    console.log('Searching with prefix:', prefix);
    const messages = await kv.getByPrefix(prefix);
    console.log('Raw messages from KV:', messages);
    
    const filteredMessages = messages
      .filter(msg => msg && msg.userId && msg.message) // Filter out any null or invalid messages
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    console.log('Filtered and sorted messages:', filteredMessages);

    return c.json({ messages: filteredMessages });
  } catch (error: any) {
    console.error('Get question chat error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Send question chat message
app.post('/make-server-6d579fee/question-chat', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { question_id, message } = await c.req.json();
    console.log('Received question chat request:', { userId, question_id, message });
    
    if (!question_id || !message) {
      console.error('Missing fields:', { question_id, message });
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get user profile for name
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      console.error('Profile not found for userId:', userId);
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Create message object
    const messageId = generateId();
    const messageObj = {
      id: messageId,
      userId,
      userName: profile.name || 'Unknown',
      message,
      timestamp: new Date().toISOString()
    };

    // Store message
    const key = `question_chat:${question_id}:${messageId}`;
    console.log('Storing message with key:', key);
    await kv.set(key, messageObj);
    console.log('Message stored successfully:', messageObj);

    return c.json({ message: messageObj }, 201);
  } catch (error: any) {
    console.error('Send question chat message error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// DEVOTIONALS
// ============================================

// Helper: generate fresh signed audio URL from a stored fileName
const refreshAudioUrl = async (audioFileName: string): Promise<string | null> => {
  if (!audioFileName) return null;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from('make-6d579fee-devotional-audio')
      .createSignedUrl(audioFileName, 3600); // 1-hour URL, refreshed on every fetch
    if (error || !data?.signedUrl) {
      console.warn('[Audio] Could not refresh signed URL for:', audioFileName, error?.message);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.warn('[Audio] refreshAudioUrl error:', err);
    return null;
  }
};

// Get all devotionals (admin-created only)
app.get('/make-server-6d579fee/devotions', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allDevotionals = await kv.getByPrefix('devotional:');
    const publishedDevotionals = allDevotionals.filter((d: any) => d.status === 'published');

    // Refresh signed audio URLs so they are never stale
    const devotions = await Promise.all(
      publishedDevotionals.map(async (d: any) => {
        if (d.audioFileName) {
          const freshUrl = await refreshAudioUrl(d.audioFileName);
          return { ...d, audioUrl: freshUrl };
        }
        return { ...d, audioUrl: null };
      })
    );

    return c.json({ devotions });
  } catch (error: any) {
    console.error('Devotions fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-6d579fee/devotions/today', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const today = new Date().toISOString().split('T')[0];

    const allDevotionals = await kv.getByPrefix('devotional:');
    const publishedDevotionals = allDevotionals.filter((d: any) => d.status === 'published');

    const todayDevotional = publishedDevotionals.find((d: any) => d.date === today);
    const raw = todayDevotional || publishedDevotionals[publishedDevotionals.length - 1] || null;

    if (!raw) return c.json({ devotion: null });

    // Refresh signed audio URL
    const devotion = raw.audioFileName
      ? { ...raw, audioUrl: await refreshAudioUrl(raw.audioFileName) }
      : { ...raw, audioUrl: null };

    return c.json({ devotion });
  } catch (error: any) {
    console.error('Today devotion fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-6d579fee/devotional-completions', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { devotion_id, notes } = await c.req.json();
    
    const today = new Date().toISOString().split('T')[0];
    const completionId = generateId();
    const completion = {
      id: completionId,
      userId,
      devotionId: devotion_id,
      notes: notes || '',
      completedAt: new Date().toISOString()
    };

    // Store with date in key so we can have multiple completions of same devotional on different days
    await kv.set(`completion:${userId}:${today}:${devotion_id}`, completion);

    // Update or create devotional streak
    const streakKey = `streak:${userId}:devotional`;
    const existingStreak = await kv.get(streakKey);
    
    console.log('[Devotional Completion] Updating streak:', { 
      userId, 
      today, 
      existingStreak,
      streakKey 
    });

    if (!existingStreak) {
      // Create new streak
      const newStreak = {
        userId,
        streak_type: 'devotional',
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today
      };
      console.log('[Devotional Completion] Creating new streak:', newStreak);
      await kv.set(streakKey, newStreak);
    } else {
      // Update existing streak
      const lastDate = existingStreak.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = existingStreak.current_streak;
      
      console.log('[Devotional Completion] Streak calculation:', {
        lastDate,
        today,
        yesterdayStr,
        isToday: lastDate === today,
        isYesterday: lastDate === yesterdayStr,
        currentStreak: existingStreak.current_streak
      });

      if (lastDate === today) {
        // Already completed today, don't increment
        newCurrentStreak = existingStreak.current_streak;
        console.log('[Devotional Completion] Already completed today, keeping streak:', newCurrentStreak);
      } else if (lastDate === yesterdayStr) {
        // Consecutive day
        newCurrentStreak = existingStreak.current_streak + 1;
        console.log('[Devotional Completion] Consecutive day! Incrementing streak to:', newCurrentStreak);
      } else {
        // Streak broken
        newCurrentStreak = 1;
        console.log('[Devotional Completion] Streak broken, resetting to 1');
      }

      const updatedStreak = {
        ...existingStreak,
        current_streak: newCurrentStreak,
        longest_streak: Math.max(newCurrentStreak, existingStreak.longest_streak || 0),
        last_activity_date: today
      };
      console.log('[Devotional Completion] Saving updated streak:', updatedStreak);
      await kv.set(streakKey, updatedStreak);
    }

    return c.json({ success: true, completion });
  } catch (error: any) {
    console.error('Completion save error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-6d579fee/devotional-completions', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const completions = await kv.getByPrefix(`completion:${userId}:`);
    return c.json({ completions });
  } catch (error: any) {
    console.error('Completions fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// STREAKS
// ============================================

app.get('/make-server-6d579fee/streaks', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const streaks = await kv.getByPrefix(`streak:${userId}:`);
    return c.json({ streaks });
  } catch (error: any) {
    console.error('Streaks fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// MILESTONES
// ============================================

app.get('/make-server-6d579fee/milestones', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`[GET /milestones] Fetching milestones for user: ${userId}`);

    // Fetch user milestones - simplified without timeout wrapper
    let userMilestones: any[] = [];
    try {
      userMilestones = await kv.getByPrefix(`milestone:${userId}:`);
      console.log(`[GET /milestones] User milestones count: ${userMilestones.length}`);
    } catch (error: any) {
      console.error('[GET /milestones] User milestones error:', error.message);
      // Continue with empty array instead of failing
      userMilestones = [];
    }
    
    // Fetch partner milestones if partner exists
    let partnerMilestones: any[] = [];
    try {
      const profile = await kv.get(`user:${userId}`);
      if (profile?.partnerId) {
        console.log(`[GET /milestones] Fetching partner milestones for: ${profile.partnerId}`);
        partnerMilestones = await kv.getByPrefix(`milestone:${profile.partnerId}:`);
        console.log(`[GET /milestones] Partner milestones count: ${partnerMilestones.length}`);
      }
    } catch (error: any) {
      console.error('[GET /milestones] Partner milestones error:', error.message);
      // Continue without partner milestones
      partnerMilestones = [];
    }

    // Combine and sort milestones
    const milestones = [...userMilestones, ...partnerMilestones]
      .sort((a, b) => {
        const dateA = new Date(b.date || b.createdAt).getTime();
        const dateB = new Date(a.date || a.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 200);

    console.log(`[GET /milestones] Returning ${milestones.length} total milestones`);
    return c.json({ milestones });
  } catch (error: any) {
    console.error('[GET /milestones] Error:', error);
    // Return empty array instead of error to prevent app crashes
    return c.json({ milestones: [], error: error.message });
  }
});

app.post('/make-server-6d579fee/milestones', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, description, date, category } = await c.req.json();

    const milestoneId = generateId();
    const milestone = {
      id: milestoneId,
      userId,
      title,
      description: description || '',
      date: date || new Date().toISOString(),
      category: category || 'general',
      createdAt: new Date().toISOString()
    };

    await kv.set(`milestone:${userId}:${milestoneId}`, milestone);

    return c.json({ success: true, milestone });
  } catch (error: any) {
    console.error('Milestone create error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-6d579fee/milestones/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const milestoneId = c.req.param('id');
    await kv.del(`milestone:${userId}:${milestoneId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Milestone delete error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// BIBLE HIGHLIGHTS
// ============================================

// Get all Bible highlights
app.get('/make-server-6d579fee/highlights', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userHighlights = await kv.getByPrefix(`highlight:${userId}:`);
    
    return c.json({ highlights: userHighlights });
  } catch (error: any) {
    console.error('Highlights fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Save a Bible highlight
app.post('/make-server-6d579fee/highlight', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { reference, verseNumber, text, color, note } = await c.req.json();

    const highlightId = generateId();
    const highlight = {
      id: highlightId,
      userId,
      reference,
      verseNumber,
      text,
      color,
      note: note || null,
      createdAt: new Date().toISOString()
    };

    await kv.set(`highlight:${userId}:${highlightId}`, highlight);

    return c.json({ success: true, highlight });
  } catch (error: any) {
    console.error('Highlight save error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete a Bible highlight
app.delete('/make-server-6d579fee/highlight/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const highlightId = c.req.param('id');
    await kv.del(`highlight:${userId}:${highlightId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Highlight delete error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Share verse with partner
app.post('/make-server-6d579fee/share-verse', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile?.partnerId) {
      return c.json({ error: 'No partner linked' }, 400);
    }

    const { reference, verseNumber, text, note } = await c.req.json();

    // Save highlight to partner's bookmarks
    const highlightId = generateId();
    const highlight = {
      id: highlightId,
      userId: profile.partnerId, // Save under partner's ID
      reference,
      verseNumber,
      text,
      color: 'yellow', // Default color for shared verses
      note: note || `Shared by ${profile.name}`,
      sharedBy: profile.name,
      sharedById: userId,
      createdAt: new Date().toISOString()
    };

    await kv.set(`highlight:${profile.partnerId}:${highlightId}`, highlight);

    // Create a notification for partner
    const notificationId = generateId();
    const notification = {
      id: notificationId,
      userId: profile.partnerId,
      type: 'verse_shared',
      title: `${profile.name} shared a verse with you`,
      message: `${reference} - "${text.substring(0, 100)}..."`,
      data: {
        reference,
        verseNumber,
        text,
        note,
        sharedBy: profile.name,
        highlightId // Include highlight ID so we can link to it
      },
      read: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`notification:${profile.partnerId}:${notificationId}`, notification);

    // Send push notification to partner
    try {
      const partnerSubscription = await kv.get(`push_subscription:${profile.partnerId}`);
      if (partnerSubscription) {
        const webpush = await import('npm:web-push@3.6.7');
        
        webpush.setVapidDetails(
          'mailto:support@twobeone.app',
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDCoXjbK3s9gE8ZCXzp8zQJZs8qI67y_NvZy7p3kk0z0',
          'sMIyJcgzS-OKkMHmQkfO9V5rNkVGXrQvZOJGm3I2QFk'
        );

        const payload = JSON.stringify({
          title: `${profile.name} shared a verse`,
          body: `"${reference}" - Tap to read`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: { type: 'verse_shared', reference },
          tag: 'verse-shared'
        });

        await webpush.sendNotification(partnerSubscription, payload);
        console.log('[Push] Sent verse share notification to partner');
      }
    } catch (pushError: any) {
      // Log but don't fail the request if push fails
      console.warn('[Push] Failed to send push notification for verse share:', pushError.message);
      if (pushError.statusCode === 410 || pushError.statusCode === 404) {
        await kv.del(`push_subscription:${profile.partnerId}`);
      }
    }

    return c.json({ success: true, notification, highlight });
  } catch (error: any) {
    console.error('Share verse error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// PRAYER TOGETHER CHAT
// ============================================

// Get prayer chat messages for a devotional
app.get('/make-server-6d579fee/devotions/:devotionId/prayer-chat', async (c) => {
  try {
    const devotionId = c.req.param('devotionId');
    const userId = await getUserFromToken(c.req.header('Authorization'));

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user profile to check if they have a partner
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Get all messages for this devotional
    const allMessages = await kv.getByPrefix(`prayer-chat:${devotionId}:`);
    
    // Filter messages to only include those from the user and their partner
    const messages = allMessages
      .filter((msg: any) => 
        msg.userId === userId || 
        (profile.partnerId && msg.userId === profile.partnerId)
      )
      .sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    return c.json({ messages });
  } catch (error: any) {
    console.error('Get prayer chat error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Post a message to prayer chat
app.post('/make-server-6d579fee/devotions/:devotionId/prayer-chat', async (c) => {
  try {
    const devotionId = c.req.param('devotionId');
    const userId = await getUserFromToken(c.req.header('Authorization'));

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { message } = await c.req.json();

    if (!message || !message.trim()) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Get user profile
    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Create message
    const messageId = generateId();
    const prayerMessage = {
      id: messageId,
      devotionId,
      userId,
      userName: profile.name,
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    // Save message
    await kv.set(`prayer-chat:${devotionId}:${messageId}`, prayerMessage);

    // Send notification to partner if they exist
    if (profile.partnerId) {
      const notificationId = generateId();
      const notification = {
        id: notificationId,
        recipientId: profile.partnerId,
        senderId: userId,
        type: 'devotional',
        title: 'New Prayer Message',
        message: `${profile.name} shared a prayer thought`,
        data: { devotionId, messagePreview: message.substring(0, 50) },
        isRead: false,
        createdAt: new Date().toISOString()
      };

      await kv.set(`notification:${profile.partnerId}:${notificationId}`, notification);
    }

    return c.json({ message: prayerMessage });
  } catch (error: any) {
    console.error('Post prayer chat error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all users (admin only)
app.get('/make-server-6d579fee/admin/users', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Fetch all users
    const allUsers = await kv.getByPrefix('user:');
    
    // Filter out system keys and format user data
    const users = allUsers
      .filter((u: any) => u.id && u.email)
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        partnerId: u.partnerId || null,
        partnerName: u.partnerName || null,
        createdAt: u.createdAt,
        relationshipStart: u.relationshipStart
      }));

    return c.json({ users });
  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete user (admin only)
app.delete('/make-server-6d579fee/admin/users/:userId', async (c) => {
  try {
    const adminUserId = await getUserFromToken(c.req.header('Authorization'));
    if (!adminUserId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(adminUserId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const userIdToDelete = c.req.param('userId');
    console.log('[DELETE /admin/users/:userId] Deleting user:', userIdToDelete);

    // Get user data before deletion
    const userToDelete = await kv.get(`user:${userIdToDelete}`);
    if (!userToDelete) {
      return c.json({ error: 'User not found' }, 404);
    }

    console.log('[DELETE /admin/users/:userId] User found:', userToDelete);

    // Delete all user-related data
    const keysToDelete = [];

    // 1. User profile
    keysToDelete.push(`user:${userIdToDelete}`);

    // 2. Invite code
    if (userToDelete.inviteCode) {
      keysToDelete.push(`invite:${userToDelete.inviteCode}`);
    }

    // 3. Couple relationship
    if (userToDelete.coupleId) {
      keysToDelete.push(`couple:${userToDelete.coupleId}`);
      
      // Update partner's profile to remove the link
      if (userToDelete.partnerId) {
        const partner = await kv.get(`user:${userToDelete.partnerId}`);
        if (partner) {
          await kv.set(`user:${userToDelete.partnerId}`, {
            ...partner,
            partnerId: null,
            coupleId: null,
            partnerName: null
          });
        }
      }
    }

    // 4. Journal entries
    const journalEntries = await kv.getByPrefix(`journal:${userIdToDelete}:`);
    journalEntries.forEach((entry: any) => {
      if (entry.id) {
        keysToDelete.push(`journal:${userIdToDelete}:${entry.id}`);
      }
    });

    // 5. Prayer requests
    const prayers = await kv.getByPrefix(`prayer:${userIdToDelete}:`);
    prayers.forEach((prayer: any) => {
      if (prayer.id) {
        keysToDelete.push(`prayer:${userIdToDelete}:${prayer.id}`);
      }
    });

    // 6. Milestones
    const milestones = await kv.getByPrefix(`milestone:${userIdToDelete}:`);
    milestones.forEach((milestone: any) => {
      if (milestone.id) {
        keysToDelete.push(`milestone:${userIdToDelete}:${milestone.id}`);
      }
    });

    // 7. Question responses
    const responses = await kv.getByPrefix(`response:${userIdToDelete}:`);
    responses.forEach((response: any) => {
      const key = `response:${userIdToDelete}:${response.questionId}`;
      keysToDelete.push(key);
    });

    // 8. Devotional completions
    const completions = await kv.getByPrefix(`completion:${userIdToDelete}:`);
    completions.forEach((completion: any) => {
      if (completion.devotionId && completion.completedAt) {
        const date = new Date(completion.completedAt).toISOString().split('T')[0];
        keysToDelete.push(`completion:${userIdToDelete}:${date}:${completion.devotionId}`);
      }
    });

    // 9. Streaks
    const streaks = await kv.getByPrefix(`streak:${userIdToDelete}:`);
    streaks.forEach((streak: any) => {
      if (streak.streak_type) {
        keysToDelete.push(`streak:${userIdToDelete}:${streak.streak_type}`);
      }
    });

    // 10. Notifications
    const notifications = await kv.getByPrefix(`notification:${userIdToDelete}:`);
    notifications.forEach((notification: any) => {
      if (notification.id) {
        keysToDelete.push(`notification:${userIdToDelete}:${notification.id}`);
      }
    });

    // 11. Scripture memory progress
    const scriptureProgress = await kv.getByPrefix(`scripture-progress:${userIdToDelete}:`);
    scriptureProgress.forEach((progress: any) => {
      if (progress.verseId) {
        keysToDelete.push(`scripture-progress:${userIdToDelete}:${progress.verseId}`);
      }
    });

    console.log('[DELETE /admin/users/:userId] Deleting', keysToDelete.length, 'keys');

    // Delete all keys
    await kv.mdel(keysToDelete);

    // Also delete from Supabase Auth if needed
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.admin.deleteUser(userIdToDelete);
      if (error) {
        console.error('[DELETE /admin/users/:userId] Supabase Auth deletion error:', error);
        // Continue even if auth deletion fails
      } else {
        console.log('[DELETE /admin/users/:userId] Supabase Auth user deleted');
      }
    } catch (authError) {
      console.error('[DELETE /admin/users/:userId] Auth deletion failed:', authError);
      // Continue even if auth deletion fails
    }

    console.log('[DELETE /admin/users/:userId] User deletion complete');

    return c.json({ 
      success: true, 
      message: `User ${userToDelete.name} (${userToDelete.email}) deleted successfully`,
      keysDeleted: keysToDelete.length
    });
  } catch (error: any) {
    console.error('Admin delete user error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all devotionals (admin only)
app.get('/make-server-6d579fee/admin/devotionals', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Fetch all devotional completions for stats
    const completions = await kv.getByPrefix('completion:');
    
    return c.json({ 
      devotionals: [], // Devotionals are stored in frontend data/devotionals.ts
      totalCompletions: completions.length
    });
  } catch (error: any) {
    console.error('Admin devotionals fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get all questions (admin only)
app.get('/make-server-6d579fee/admin/questions', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Fetch all question responses for stats
    const responses = await kv.getByPrefix('response:');
    
    return c.json({ 
      questions: [], // Questions are stored in frontend data
      totalResponses: responses.length
    });
  } catch (error: any) {
    console.error('Admin questions fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get recent activity (admin only)
app.get('/make-server-6d579fee/admin/recent-activity', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Gather recent activities from different sources
    const activities: any[] = [];

    // Recent journal entries
    const journals = await kv.getByPrefix('journal:');
    journals.slice(0, 10).forEach((j: any) => {
      activities.push({
        action: 'Journal entry created',
        user: j.authorName || 'Unknown',
        time: formatTimeAgo(j.createdAt),
        timestamp: j.createdAt
      });
    });

    // Recent prayers
    const prayers = await kv.getByPrefix('prayer:');
    prayers.slice(0, 10).forEach((p: any) => {
      activities.push({
        action: 'Prayer request added',
        user: p.authorName || 'Unknown',
        time: formatTimeAgo(p.createdAt),
        timestamp: p.createdAt
      });
    });

    // Recent devotional completions
    const completions = await kv.getByPrefix('completion:');
    completions.slice(0, 10).forEach((c: any) => {
      activities.push({
        action: 'Devotional completed',
        user: c.userName || 'Unknown',
        time: formatTimeAgo(c.completedAt),
        timestamp: c.completedAt
      });
    });

    // Sort by timestamp and return top 20
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({ activities: activities.slice(0, 20) });
  } catch (error: any) {
    console.error('Admin activity fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Helper function to format time ago
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return then.toLocaleDateString();
}

// ============================================
// ADMIN CRUD ROUTES
// ============================================

// Devotionals Management
app.post('/make-server-6d579fee/admin/devotionals', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const devotional = await c.req.json();
    const devotionalId = devotional.id || generateId();
    
    const devotionalData = {
      ...devotional,
      id: devotionalId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`[Devotional] Creating devotional: ${devotionalId}`);
    await kv.set(`devotional:${devotionalId}`, devotionalData);
    
    // Verify it was saved
    const saved = await kv.get(`devotional:${devotionalId}`);
    console.log(`[Devotional] ✅ Verified saved devotional: ${saved ? 'exists' : 'NOT FOUND'}`);

    return c.json({ success: true, devotionalId });
  } catch (error: any) {
    console.error('Admin create devotional error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-6d579fee/admin/devotionals/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const devotionalId = c.req.param('id');
    const updates = await c.req.json();
    
    console.log(`[Devotional] Updating devotional: ${devotionalId}`);
    const existing = await kv.get(`devotional:${devotionalId}`);
    if (!existing) {
      console.error(`[Devotional] ❌ Devotional not found: ${devotionalId}`);
      return c.json({ error: 'Devotional not found' }, 404);
    }

    const updatedData = {
      ...existing,
      ...updates,
      id: devotionalId,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`devotional:${devotionalId}`, updatedData);
    console.log(`[Devotional] ✅ Devotional updated: ${devotionalId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Admin update devotional error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-6d579fee/admin/devotionals/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const devotionalId = c.req.param('id');
    await kv.del(`devotional:${devotionalId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete devotional error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-6d579fee/admin/devotionals/list', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const devotionals = await kv.getByPrefix('devotional:');
    return c.json({ devotionals });
  } catch (error: any) {
    console.error('Admin list devotionals error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Devotionals Bulk Import
app.post('/make-server-6d579fee/admin/devotionals/import', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);
    if (!(await isAdminUser(userId))) return c.json({ error: 'Forbidden - Admin access required' }, 403);

    const body = await c.req.json();
    const { devotionals: incoming, overwrite = false } = body;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return c.json({ error: 'No devotionals provided' }, 400);
    }

    const results: Array<{ id: string; title: string; action: string; error?: string }> = [];
    let created = 0, updated = 0, skipped = 0;

    for (const dev of incoming) {
      if (!dev.id || !dev.title || !dev.verse || !dev.reference || !dev.reflection) {
        results.push({ id: dev.id || 'unknown', title: dev.title || 'Untitled', action: 'skipped', error: 'Missing required fields' });
        skipped++;
        continue;
      }
      try {
        const key = `devotional:${dev.id}`;
        const existing = await kv.get(key);
        if (existing && !overwrite) {
          results.push({ id: dev.id, title: dev.title, action: 'skipped' });
          skipped++;
        } else {
          const record = {
            id: dev.id,
            date: dev.date || new Date().toISOString().split('T')[0],
            title: dev.title,
            verse: dev.verse,
            reference: dev.reference,
            reflection: dev.reflection,
            prayerPrompt: dev.prayerPrompt || '',
            tags: dev.tags || [],
            status: dev.status || 'published',
            language: dev.language || 'en',
            audioUrl: dev.audioUrl || null,
            audioFileName: dev.audioFileName || null,
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await kv.set(key, record);
          const action = existing ? 'updated' : 'created';
          results.push({ id: dev.id, title: dev.title, action });
          if (action === 'created') created++; else updated++;
        }
      } catch (err: any) {
        results.push({ id: dev.id, title: dev.title, action: 'skipped', error: err.message });
        skipped++;
      }
    }

    return c.json({ success: true, results, summary: { created, updated, skipped, total: incoming.length } });
  } catch (error: any) {
    console.error('Admin bulk import devotionals error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Questions Management
app.post('/make-server-6d579fee/admin/questions', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const question = await c.req.json();
    const questionId = question.id || generateId();
    
    const questionData = {
      ...question,
      id: questionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating question with data:', JSON.stringify(questionData, null, 2));
    
    await kv.set(`question:${questionId}`, questionData);
    
    // Verify it was saved
    const saved = await kv.get(`question:${questionId}`);
    console.log('Verified saved question:', JSON.stringify(saved, null, 2));

    return c.json({ success: true, questionId });
  } catch (error: any) {
    console.error('Admin create question error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-6d579fee/admin/questions/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const questionId = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`question:${questionId}`);
    if (!existing) {
      return c.json({ error: 'Question not found' }, 404);
    }

    await kv.set(`question:${questionId}`, {
      ...existing,
      ...updates,
      id: questionId,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Admin update question error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-6d579fee/admin/questions/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const questionId = c.req.param('id');
    await kv.del(`question:${questionId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete question error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-6d579fee/admin/questions/list', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const questions = await kv.getByPrefix('question:');
    return c.json({ questions });
  } catch (error: any) {
    console.error('Admin list questions error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Clear all questions and responses (admin only)
app.delete('/make-server-6d579fee/admin/questions/clear-all', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Get all questions and responses
    const allQuestions = await kv.getByPrefix('question:');
    const allResponses = await kv.getByPrefix('question_response:');
    
    console.log(`Clearing ${allQuestions.length} questions and ${allResponses.length} responses`);
    
    // Delete all questions
    const questionKeys = allQuestions.map((q: any) => q.id);
    if (questionKeys.length > 0) {
      await kv.mdel(questionKeys.map((id: string) => `question:${id.replace('question:', '')}`));
    }
    
    // Delete all responses
    const responseKeys = allResponses.map((r: any) => r.id || `question_response:${r.questionId}:${r.userId}`);
    if (responseKeys.length > 0) {
      await kv.mdel(responseKeys);
    }
    
    return c.json({ 
      success: true, 
      message: `Cleared ${allQuestions.length} questions and ${allResponses.length} responses`,
      questionsDeleted: allQuestions.length,
      responsesDeleted: allResponses.length
    });
  } catch (error: any) {
    console.error('Clear all questions error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Modules Management
app.post('/make-server-6d579fee/admin/modules', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const module = await c.req.json();
    const moduleId = module.id || generateId();
    
    await kv.set(`module:${moduleId}`, {
      ...module,
      id: moduleId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true, moduleId });
  } catch (error: any) {
    console.error('Admin create module error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-6d579fee/admin/modules/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const moduleId = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`module:${moduleId}`);
    if (!existing) {
      return c.json({ error: 'Module not found' }, 404);
    }

    await kv.set(`module:${moduleId}`, {
      ...existing,
      ...updates,
      id: moduleId,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Admin update module error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-6d579fee/admin/modules/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const moduleId = c.req.param('id');
    await kv.del(`module:${moduleId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete module error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Bulk import modules
app.post('/make-server-6d579fee/admin/modules/import', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);
    if (!(await isAdminUser(userId))) return c.json({ error: 'Forbidden - Admin access required' }, 403);

    const body = await c.req.json();
    const { modules: incoming, overwrite = false } = body;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return c.json({ error: 'modules must be a non-empty array' }, 400);
    }

    const results: { id: string; title: string; action: 'created' | 'updated' | 'skipped'; error?: string }[] = [];

    for (const raw of incoming) {
      try {
        if (!raw.title || !raw.lessons) {
          results.push({ id: raw.id || '?', title: raw.title || '(untitled)', action: 'skipped', error: 'Missing required fields (title, lessons)' });
          continue;
        }

        const targetId = raw.id || generateId();
        const existing = await kv.get(`module:${targetId}`);

        if (existing && !overwrite) {
          results.push({ id: targetId, title: raw.title, action: 'skipped' });
          continue;
        }

        const now = new Date().toISOString();
        await kv.set(`module:${targetId}`, {
          ...raw,
          id: targetId,
          createdAt: existing ? (existing as any).createdAt ?? now : now,
          updatedAt: now,
        });
        results.push({ id: targetId, title: raw.title, action: existing ? 'updated' : 'created' });
      } catch (err: any) {
        results.push({ id: raw.id || '?', title: raw.title || '(untitled)', action: 'skipped', error: err.message });
      }
    }

    const created = results.filter(r => r.action === 'created').length;
    const updated = results.filter(r => r.action === 'updated').length;
    const skipped = results.filter(r => r.action === 'skipped').length;

    return c.json({ success: true, results, summary: { created, updated, skipped, total: incoming.length } });
  } catch (error: any) {
    console.error('Admin bulk import modules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-6d579fee/admin/modules/list', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const modules = await kv.getByPrefix('module:');
    return c.json({ modules });
  } catch (error: any) {
    console.error('Admin list modules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User-facing: Get published modules
app.get('/make-server-6d579fee/modules', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allModules = await kv.getByPrefix('module:');
    // Filter to only published modules
    const publishedModules = allModules.filter((m: any) => m.status === 'published');
    
    return c.json({ modules: publishedModules });
  } catch (error: any) {
    console.error('Get modules error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User-facing: Get single module with lessons
app.get('/make-server-6d579fee/modules/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const moduleId = c.req.param('id');
    const module = await kv.get(`module:${moduleId}`);
    
    if (!module) {
      return c.json({ error: 'Module not found' }, 404);
    }

    // Only allow access to published modules
    if (module.status !== 'published') {
      return c.json({ error: 'Module not available' }, 403);
    }

    return c.json({ module });
  } catch (error: any) {
    console.error('Get module error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User-facing: Save lesson notes (couple-shareable)
app.post('/make-server-6d579fee/modules/:moduleId/lessons/:lessonId/notes', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await kv.get(`user:${userId}`);
    const moduleId = c.req.param('moduleId');
    const lessonId = c.req.param('lessonId');
    const { notes } = await c.req.json();

    if (!notes || typeof notes !== 'string') {
      return c.json({ error: 'Notes are required' }, 400);
    }

    // Verify module exists and is published
    const module = await kv.get(`module:${moduleId}`);
    if (!module || module.status !== 'published') {
      return c.json({ error: 'Module not found or not available' }, 404);
    }

    // If user is part of a couple, save at couple-level so both partners can see it
    // Otherwise, save at user-level
    const storageKey = user?.coupleId 
      ? `lesson-note:${user.coupleId}:${lessonId}`
      : `lesson-note:${userId}:${lessonId}`;
    
    const lessonNote = {
      coupleId: user?.coupleId || null,
      userId: user?.coupleId ? null : userId, // Only store userId if not in a couple
      moduleId,
      lessonId,
      notes,
      lastEditedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(storageKey, lessonNote);

    console.log(`Lesson note saved: ${storageKey}, module ${moduleId}, lesson ${lessonId}`);
    return c.json({ success: true, note: lessonNote });
  } catch (error: any) {
    console.error('Save lesson notes error:', error);
    return c.json({ error: error.message || 'Failed to save notes' }, 500);
  }
});

// User-facing: Get lesson notes (couple-shareable)
app.get('/make-server-6d579fee/modules/:moduleId/lessons/:lessonId/notes', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await kv.get(`user:${userId}`);
    const lessonId = c.req.param('lessonId');
    
    // Try couple-level first, then fall back to user-level
    const storageKey = user?.coupleId 
      ? `lesson-note:${user.coupleId}:${lessonId}`
      : `lesson-note:${userId}:${lessonId}`;
    
    const note = await kv.get(storageKey);

    return c.json({ note: note || null });
  } catch (error: any) {
    console.error('Get lesson notes error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User-facing: Mark lesson as complete
app.post('/make-server-6d579fee/modules/:moduleId/lessons/:lessonId/complete', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const moduleId = c.req.param('moduleId');
    const lessonId = c.req.param('lessonId');

    // Verify module exists and is published
    const module = await kv.get(`module:${moduleId}`);
    if (!module || module.status !== 'published') {
      return c.json({ error: 'Module not found or not available' }, 404);
    }

    // Save lesson completion for this user
    const completion = {
      userId,
      moduleId,
      lessonId,
      completedAt: new Date().toISOString()
    };

    await kv.set(`lesson-completion:${userId}:${lessonId}`, completion);

    console.log(`Lesson completed: user ${userId}, module ${moduleId}, lesson ${lessonId}`);
    return c.json({ success: true, completion });
  } catch (error: any) {
    console.error('Mark lesson complete error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User-facing: Get module progress
app.get('/make-server-6d579fee/modules/:moduleId/progress', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const moduleId = c.req.param('moduleId');
    const module = await kv.get(`module:${moduleId}`);
    
    if (!module || module.status !== 'published') {
      return c.json({ error: 'Module not found or not available' }, 404);
    }

    // Get all completions for this user
    const allCompletions = await kv.getByPrefix(`lesson-completion:${userId}:`);
    
    // Filter completions for this module
    const moduleCompletions = allCompletions.filter((c: any) => c.moduleId === moduleId);
    
    const totalLessons = module.lessons?.length || 0;
    const completedLessons = moduleCompletions.length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return c.json({ 
      progress,
      completedLessons,
      totalLessons,
      completions: moduleCompletions
    });
  } catch (error: any) {
    console.error('Get module progress error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User-facing: Get all active questions
app.get('/make-server-6d579fee/questions', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const category = c.req.query('category');
    console.log('\n========== FETCHING QUESTIONS ==========');
    console.log('Category filter:', category);
    
    const allQuestions = await kv.getByPrefix('question:');
    console.log('Total questions from KV:', allQuestions.length);
    console.log('All questions:', JSON.stringify(allQuestions.map((q: any) => ({
      id: q.id,
      title: q.title,
      category: q.category,
      status: q.status,
      promptsCount: q.prompts?.length || 0
    })), null, 2));
    
    // Filter active questions
    let questions = allQuestions.filter((q: any) => q.status === 'active');
    console.log('Active questions:', questions.length);
    
    // Filter by category if provided
    if (category && category !== 'all') {
      questions = questions.filter((q: any) => q.category === category);
      console.log(`Questions in category "${category}":`, questions.length);
    }
    
    console.log('Final questions to return:', questions.length);
    console.log('========================================\n');

    return c.json({ questions });
  } catch (error: any) {
    console.error('Get questions error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug: View all questions in database (admin only)
app.get('/make-server-6d579fee/debug/questions', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allQuestions = await kv.getByPrefix('question:');
    
    return c.json({ 
      count: allQuestions.length,
      questions: allQuestions 
    });
  } catch (error: any) {
    console.error('Debug questions error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User-facing: Save question responses
app.post('/make-server-6d579fee/questions/:questionId/responses', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const questionId = c.req.param('questionId');
    const { answers } = await c.req.json();

    console.log(`[Save Q&A Response] User: ${userId}, Question: ${questionId}`);
    console.log(`[Save Q&A Response] Answers received:`, JSON.stringify(answers));

    if (!answers || typeof answers !== 'object') {
      return c.json({ error: 'Answers are required' }, 400);
    }

    // Verify question exists
    const question = await kv.get(`question:${questionId}`);
    if (!question) {
      return c.json({ error: 'Question not found' }, 404);
    }

    // Get user's couple ID if they're part of a couple
    const user = await kv.get(`user:${userId}`);
    console.log(`[Save Q&A Response] User data:`, {
      userId: user?.id,
      email: user?.email,
      coupleId: user?.coupleId
    });
    
    if (!user?.coupleId) {
      console.warn(`[Save Q&A Response] WARNING: User ${userId} has NO coupleId! Partner responses won't work.`);
    }
    
    // Create the storage key
    const responseKey = `question-response:${userId}:${questionId}`;
    
    // Save the response with the key as id
    const response = {
      id: responseKey, // Include the key as id for easy reference
      userId,
      questionId,
      coupleId: user?.coupleId || null,
      answers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(responseKey, response);

    console.log(`[Save Q&A Response] ✅ Saved successfully with key: ${responseKey}, coupleId: ${user?.coupleId || 'NULL'}`);
    return c.json({ success: true, response });
  } catch (error: any) {
    console.error('Save question response error:', error);
    return c.json({ error: error.message || 'Failed to save response' }, 500);
  }
});

// User-facing: Get question response (user's and partner's)
app.get('/make-server-6d579fee/questions/:questionId/responses', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const questionId = c.req.param('questionId');
    
    console.log(`\n========== [Q&A Responses] START ==========`);
    console.log(`[Q&A Responses] Question ID: ${questionId}`);
    console.log(`[Q&A Responses] Current User ID: ${userId}`);
    
    // Get user's response
    const userResponseKey = `question-response:${userId}:${questionId}`;
    const userResponse = await kv.get(userResponseKey);
    console.log(`[Q&A Responses] User response key: ${userResponseKey}`);
    console.log(`[Q&A Responses] User response:`, userResponse ? '✅ FOUND' : '❌ NOT FOUND');
    if (userResponse) {
      console.log(`[Q&A Responses] User response coupleId:`, userResponse.coupleId);
    }
    
    // Get partner's response if user is in a couple
    const user = await kv.get(`user:${userId}`);
    console.log(`[Q&A Responses] User coupleId from profile:`, user?.coupleId || 'NULL');
    
    let partnerResponse = null;
    
    if (user?.coupleId) {
      const couple = await kv.get(`couple:${user.coupleId}`);
      console.log(`[Q&A Responses] Couple found:`, couple ? '✅ YES' : '❌ NO');
      console.log(`[Q&A Responses] Couple partner1Id:`, couple?.partner1Id);
      console.log(`[Q&A Responses] Couple partner2Id:`, couple?.partner2Id);
      
      const partnerId = couple?.partner1Id === userId ? couple?.partner2Id : couple?.partner1Id;
      console.log(`[Q&A Responses] Identified Partner ID:`, partnerId);
      
      if (partnerId) {
        const partnerResponseKey = `question-response:${partnerId}:${questionId}`;
        partnerResponse = await kv.get(partnerResponseKey);
        console.log(`[Q&A Responses] Partner response key: ${partnerResponseKey}`);
        console.log(`[Q&A Responses] Partner response:`, partnerResponse ? '✅ FOUND' : '❌ NOT FOUND');
        if (partnerResponse) {
          console.log(`[Q&A Responses] Partner response coupleId:`, partnerResponse.coupleId);
          console.log(`[Q&A Responses] Partner response answers:`, Object.keys(partnerResponse.answers || {}));
        }
      }
    } else {
      console.log(`[Q&A Responses] ⚠️ User not in a couple`);
    }

    console.log(`[Q&A Responses] Final result:`, {
      hasUserResponse: !!userResponse,
      hasPartnerResponse: !!partnerResponse
    });
    console.log(`========== [Q&A Responses] END ==========\n`);

    return c.json({ 
      userResponse: userResponse || null,
      partnerResponse: partnerResponse || null
    });
  } catch (error: any) {
    console.error('Get question responses error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// User-facing: Get all user's question responses
app.get('/make-server-6d579fee/my-question-responses', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const responses = await kv.getByPrefix(`question-response:${userId}:`);
    
    return c.json({ responses: responses || [] });
  } catch (error: any) {
    console.error('Get my question responses error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint: List all question responses
app.get('/make-server-6d579fee/debug/all-responses', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all responses
    const allResponses = await kv.getByPrefix('question-response:');
    
    console.log('[Debug] All question responses in database:', allResponses.length);
    allResponses.forEach((resp: any) => {
      console.log('[Debug] Response:', {
        id: resp.id,
        userId: resp.userId,
        questionId: resp.questionId,
        coupleId: resp.coupleId,
        answersCount: Object.keys(resp.answers || {}).length
      });
    });
    
    return c.json({ 
      count: allResponses.length,
      responses: allResponses 
    });
  } catch (error: any) {
    console.error('Debug all responses error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint: List all users
app.get('/make-server-6d579fee/debug/users', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allUsers = await kv.getByPrefix('user:');
    
    return c.json({ 
      count: allUsers.length,
      users: allUsers 
    });
  } catch (error: any) {
    console.error('Debug users error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint: List all couples
app.get('/make-server-6d579fee/debug/couples', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allCouples = await kv.getByPrefix('couple:');
    
    return c.json({ 
      count: allCouples.length,
      couples: allCouples 
    });
  } catch (error: any) {
    console.error('Debug couples error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint: Clear all question responses
app.delete('/make-server-6d579fee/debug/clear-responses', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`[Debug] Clearing all question responses...`);
    
    const supabase = getSupabase();
    
    // Query directly to get keys AND values
    const { data, error } = await supabase
      .from('kv_store_6d579fee')
      .select('key, value')
      .like('key', 'question-response:%');
    
    if (error) {
      console.error('[Debug] Error fetching responses:', error);
      throw new Error(error.message);
    }
    
    console.log(`[Debug] Found ${data?.length || 0} responses to delete`);
    
    if (data && data.length > 0) {
      // Extract all keys
      const keys = data.map((row: any) => row.key);
      console.log(`[Debug] Deleting keys:`, keys);
      
      // Delete all at once using mdel
      await kv.mdel(keys);
      
      console.log(`[Debug] ✅ Successfully deleted ${data.length} responses`);
    }
    
    return c.json({ 
      success: true,
      deletedCount: data?.length || 0
    });
  } catch (error: any) {
    console.error('Debug clear responses error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint: Fix existing couples (add coupleId to user profiles)
app.post('/make-server-6d579fee/debug/fix-couples', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`[Debug] Fixing couple relationships...`);
    
    // Get all couples
    const couples = await kv.getByPrefix('couple:');
    console.log(`[Debug] Found ${couples.length} couple records`);
    
    let fixed = 0;
    let couplesCreated = 0;
    
    // STEP 1: Fix existing couples
    for (const couple of couples) {
      const partner1Id = couple.partner1Id || couple.user1Id; // Handle old field names
      const partner2Id = couple.partner2Id || couple.user2Id;
      
      if (!partner1Id || !partner2Id) {
        console.warn(`[Debug] Skipping invalid couple:`, couple.id);
        continue;
      }
      
      console.log(`[Debug] Processing couple ${couple.id}: ${partner1Id} <-> ${partner2Id}`);
      
      // Get both user profiles
      const user1 = await kv.get(`user:${partner1Id}`);
      const user2 = await kv.get(`user:${partner2Id}`);
      
      if (!user1 || !user2) {
        console.warn(`[Debug] Skipping couple ${couple.id} - user not found`);
        continue;
      }
      
      // Update user profiles with coupleId if missing
      if (!user1.coupleId) {
        user1.coupleId = couple.id;
        user1.updatedAt = new Date().toISOString();
        await kv.set(`user:${partner1Id}`, user1);
        console.log(`[Debug] ✅ Added coupleId to user ${partner1Id}`);
        fixed++;
      }
      
      if (!user2.coupleId) {
        user2.coupleId = couple.id;
        user2.updatedAt = new Date().toISOString();
        await kv.set(`user:${partner2Id}`, user2);
        console.log(`[Debug] ✅ Added coupleId to user ${partner2Id}`);
        fixed++;
      }
      
      // Update couple record to use consistent field names
      if (couple.user1Id || couple.user2Id) {
        const updatedCouple = {
          id: couple.id,
          partner1Id: partner1Id,
          partner2Id: partner2Id,
          relationshipStartDate: couple.relationshipStartDate,
          createdAt: couple.createdAt,
          updatedAt: new Date().toISOString()
        };
        await kv.set(`couple:${couple.id}`, updatedCouple);
        console.log(`[Debug] ✅ Updated couple record field names`);
      }
    }
    
    // STEP 2: Find users with partnerId but no coupleId and create couple records
    console.log(`[Debug] Looking for orphaned partnerships...`);
    const allUsers = await kv.getByPrefix('user:');
    const processedPairs = new Set<string>();
    
    for (const user of allUsers) {
      // Skip if user doesn't have a partner or already has a coupleId
      if (!user.partnerId || user.coupleId) continue;
      
      // Create unique pair identifier to avoid duplicates
      const pairId = [user.id, user.partnerId].sort().join('|');
      if (processedPairs.has(pairId)) continue;
      processedPairs.add(pairId);
      
      // Get partner
      const partner = await kv.get(`user:${user.partnerId}`);
      if (!partner) {
        console.warn(`[Debug] Partner ${user.partnerId} not found for user ${user.id}`);
        continue;
      }
      
      // Verify bidirectional link
      if (partner.partnerId !== user.id) {
        console.warn(`[Debug] Partner link mismatch: ${user.id} <-> ${user.partnerId}`);
        continue;
      }
      
      // Create couple record
      const newCoupleId = generateId();
      const newCouple = {
        id: newCoupleId,
        partner1Id: user.id,
        partner2Id: user.partnerId,
        relationshipStartDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await kv.set(`couple:${newCoupleId}`, newCouple);
      console.log(`[Debug] ✅ Created couple record ${newCoupleId} for ${user.id} <-> ${user.partnerId}`);
      couplesCreated++;
      
      // Update both user profiles
      user.coupleId = newCoupleId;
      user.updatedAt = new Date().toISOString();
      await kv.set(`user:${user.id}`, user);
      
      partner.coupleId = newCoupleId;
      partner.updatedAt = new Date().toISOString();
      await kv.set(`user:${user.partnerId}`, partner);
      
      console.log(`[Debug] ✅ Added coupleId to users ${user.id} and ${user.partnerId}`);
      fixed += 2;
    }
    
    console.log(`[Debug] ✅ Created ${couplesCreated} new couples, fixed ${fixed} user profiles`);
    
    return c.json({ 
      success: true,
      couplesProcessed: couples.length,
      couplesCreated: couplesCreated,
      usersFixed: fixed
    });
  } catch (error: any) {
    console.error('Debug fix couples error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Groups Management
app.post('/make-server-6d579fee/admin/groups', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const group = await c.req.json();
    const groupId = group.id || generateId();
    
    await kv.set(`group:${groupId}`, {
      ...group,
      id: groupId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true, groupId });
  } catch (error: any) {
    console.error('Admin create group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-6d579fee/admin/groups/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const groupId = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`group:${groupId}`);
    if (!existing) {
      return c.json({ error: 'Group not found' }, 404);
    }

    await kv.set(`group:${groupId}`, {
      ...existing,
      ...updates,
      id: groupId,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Admin update group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-6d579fee/admin/groups/:id', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const groupId = c.req.param('id');
    await kv.del(`group:${groupId}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete group error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-6d579fee/admin/groups/list', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const groups = await kv.getByPrefix('group:');
    return c.json({ groups });
  } catch (error: any) {
    console.error('Admin list groups error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get admin statistics
app.get('/make-server-6d579fee/admin/stats', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Gather statistics
    const users = await kv.getByPrefix('user:');
    const devotionals = await kv.getByPrefix('devotional:');
    const questions = await kv.getByPrefix('question:');
    const modules = await kv.getByPrefix('module:');
    const journals = await kv.getByPrefix('journal:');
    const prayers = await kv.getByPrefix('prayer:');
    const completions = await kv.getByPrefix('completion:');

    const totalUsers = users.filter((u: any) => u.id && u.email).length;
    const activeCouples = users.filter((u: any) => u.partnerId).length / 2;
    
    // Calculate completion rate
    const totalPossibleCompletions = totalUsers * 30; // Assume 30 days of content
    const completionRate = totalPossibleCompletions > 0 
      ? Math.round((completions.length / totalPossibleCompletions) * 100)
      : 0;

    return c.json({ 
      stats: {
        totalUsers,
        activeCouples: Math.floor(activeCouples),
        totalDevotionals: devotionals.length,
        totalQuestions: questions.length,
        totalModules: modules.length,
        totalJournalEntries: journals.length,
        totalPrayers: prayers.length,
        completionRate
      }
    });
  } catch (error: any) {
    console.error('Admin stats fetch error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// SCRIPTURE MEMORY ROUTES
// ============================================

// Get user's verse progress
app.get('/make-server-6d579fee/memory/progress', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    // Get all user verse progress
    const progressKeys = await kv.getByPrefix(`user-verse:${userId}:`);
    const progress = progressKeys.map((key: string) => {
      const value = kv.get(key);
      return value;
    });

    return c.json({ progress });
  } catch (error: any) {
    console.error('Get memory progress error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get memory stats
app.get('/make-server-6d579fee/memory/stats', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    // Get all user verse progress
    const progressKeys = await kv.getByPrefix(`user-verse:${userId}:`);
    const allProgress = progressKeys.map((key: string) => kv.get(key));

    const masteredVerses = allProgress.filter((p: any) => p?.status === 'mastered').length;
    const learningVerses = allProgress.filter((p: any) => p?.status === 'learning').length;

    // Get streak data
    const streakKey = `memory-streak:${userId}`;
    const streakData = await kv.get(streakKey) || {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null
    };

    const stats = {
      totalVerses: allProgress.length,
      masteredVerses,
      learningVerses,
      currentStreak: streakData.currentStreak || 0,
      longestStreak: streakData.longestStreak || 0,
      lastPracticeDate: streakData.lastPracticeDate || null
    };

    return c.json({ stats });
  } catch (error: any) {
    console.error('Get memory stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Record practice session
app.post('/make-server-6d579fee/memory/practice', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const { verseId, action, correct } = await c.req.json();
    
    if (!verseId) {
      return c.json({ error: 'verseId is required' }, 400);
    }

    const progressKey = `user-verse:${userId}:${verseId}`;
    let progress = await kv.get(progressKey) || {
      verseId,
      masteryLevel: 0,
      lastPracticed: new Date().toISOString(),
      timesReviewed: 0,
      consecutiveCorrect: 0,
      status: 'new'
    };

    const today = new Date().toISOString().split('T')[0];

    if (action === 'start') {
      // Just starting to learn - increment review count
      progress.timesReviewed++;
      progress.lastPracticed = new Date().toISOString();
      
      if (progress.status === 'new') {
        progress.status = 'learning';
      }
    } else if (action === 'answer') {
      // User answered in quiz mode
      progress.timesReviewed++;
      progress.lastPracticed = new Date().toISOString();

      if (correct) {
        progress.consecutiveCorrect++;
        // Increase mastery by 10-20 points
        progress.masteryLevel = Math.min(100, progress.masteryLevel + 15);
      } else {
        progress.consecutiveCorrect = 0;
        // Decrease mastery slightly
        progress.masteryLevel = Math.max(0, progress.masteryLevel - 5);
      }

      // Update status based on mastery level
      if (progress.masteryLevel >= 80 && progress.consecutiveCorrect >= 3) {
        progress.status = 'mastered';
      } else if (progress.masteryLevel > 0) {
        progress.status = 'learning';
      }
    }

    // Save progress
    await kv.set(progressKey, progress);

    // Update streak
    const streakKey = `memory-streak:${userId}`;
    let streakData = await kv.get(streakKey) || {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null
    };

    const lastDate = streakData.lastPracticeDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!lastDate || lastDate === yesterday || lastDate === yesterdayStr) {
      // Continue or start streak
      if (lastDate !== today) {
        streakData.currentStreak++;
        if (streakData.currentStreak > streakData.longestStreak) {
          streakData.longestStreak = streakData.currentStreak;
        }
      }
    } else if (lastDate !== today) {
      // Streak broken
      streakData.currentStreak = 1;
    }

    streakData.lastPracticeDate = today;
    await kv.set(streakKey, streakData);

    // Recalculate stats
    const progressKeys = await kv.getByPrefix(`user-verse:${userId}:`);
    const allProgress = progressKeys.map((key: string) => kv.get(key));
    const masteredVerses = allProgress.filter((p: any) => p?.status === 'mastered').length;
    const learningVerses = allProgress.filter((p: any) => p?.status === 'learning').length;

    const stats = {
      totalVerses: allProgress.length,
      masteredVerses,
      learningVerses,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastPracticeDate: streakData.lastPracticeDate
    };

    return c.json({ progress, stats });
  } catch (error: any) {
    console.error('Record practice error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// AUDIO MANAGEMENT FOR DEVOTIONALS
// ============================================

// Initialize audio storage bucket
const initAudioBucket = async () => {
  const supabase = getSupabase();
  const bucketName = 'make-6d579fee-devotional-audio';
  
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('[Audio] Creating devotional audio bucket...');
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
      });
      
      if (error) {
        // If bucket already exists (race condition), that's fine
        if (error.message?.includes('already exists')) {
          console.log('[Audio] ✅ Devotional audio bucket already exists (race condition handled)');
        } else {
          console.error('[Audio] Failed to create bucket:', error);
        }
      } else {
        console.log('[Audio] ✅ Devotional audio bucket created successfully');
      }
    } else {
      console.log('[Audio] ✅ Devotional audio bucket already exists');
    }
  } catch (error: any) {
    // Ignore "already exists" errors
    if (error?.message?.includes('already exists')) {
      console.log('[Audio] ✅ Devotional audio bucket already exists (caught in exception)');
    } else {
      console.error('[Audio] Error initializing bucket:', error);
    }
  }
};

// Upload audio file for devotional
app.post('/make-server-6d579fee/admin/devotionals/:id/audio', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const devotionalId = c.req.param('id');
    console.log('[Audio] Upload request for devotional:', devotionalId);
    
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.error('[Audio] No audio file in FormData');
      return c.json({ error: 'No audio file provided' }, 400);
    }

    console.log('[Audio] File received:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Validate file type
    const allowedTypes = [
      'audio/mpeg',      // MP3
      'audio/mp3',       // Some browsers use this
      'audio/wav',       // WAV
      'audio/wave',      // Alternative WAV
      'audio/x-wav',     // Alternative WAV
      'audio/ogg',       // OGG
      'audio/mp4',       // M4A
      'audio/x-m4a',     // M4A alternative
      'audio/aac',       // AAC
      'audio/webm',      // WebM audio
      'audio/flac'       // FLAC
    ];
    if (!allowedTypes.includes(audioFile.type) && !audioFile.type.startsWith('audio/')) {
      return c.json({ error: `Invalid file type: ${audioFile.type}. Only audio files are allowed` }, 400);
    }

    // Validate file size (50MB max)
    if (audioFile.size > 50 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 50MB' }, 400);
    }

    const supabase = getSupabase();
    const bucketName = 'make-6d579fee-devotional-audio';
    
    // Create unique filename
    const fileExt = audioFile.name.split('.').pop();
    const fileName = `${devotionalId}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const arrayBuffer = await audioFile.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: audioFile.type,
        upsert: true
      });

    if (uploadError) {
      console.error('[Audio] Upload error:', uploadError);
      return c.json({ 
        error: 'Failed to upload audio file', 
        details: uploadError.message 
      }, 500);
    }

    console.log('[Audio] File uploaded to storage:', uploadData?.path);

    // Create signed URL (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year

    if (urlError) {
      console.error('[Audio] Signed URL error:', urlError);
      return c.json({ 
        error: 'Failed to create audio URL', 
        details: urlError.message 
      }, 500);
    }

    console.log('[Audio] Signed URL created successfully');

    // Update devotional with audio URL
    console.log(`[Audio] Looking up devotional in KV store: devotional:${devotionalId}`);
    const devotional = await kv.get(`devotional:${devotionalId}`);
    if (!devotional) {
      console.error(`[Audio] ⚠️ Devotional not found in KV store: devotional:${devotionalId}`);
      console.error(`[Audio] ⚠️ This devotional may not have been created yet. Please create the devotional first in the Admin Panel.`);
      // Still return success since the file was uploaded successfully
      // The frontend will need to refresh to see the audio
      return c.json({ 
        success: true, 
        audioUrl: urlData.signedUrl,
        fileName: fileName,
        warning: 'Devotional not found in database. Audio uploaded to storage but not linked to devotional.'
      });
    }
    
    devotional.audioUrl = urlData.signedUrl;
    devotional.audioFileName = fileName;
    devotional.updatedAt = new Date().toISOString();
    await kv.set(`devotional:${devotionalId}`, devotional);

    console.log('[Audio] ✅ Audio uploaded successfully:', fileName);
    console.log('[Audio] ✅ Devotional updated with audio URL');
    console.log(`[Audio] ✅ Devotional "${devotional.title}" (ID: ${devotionalId}) now has audio`);

    return c.json({ 
      success: true, 
      audioUrl: urlData.signedUrl,
      fileName: fileName 
    });
  } catch (error: any) {
    console.error('[Audio] Upload error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete audio file for devotional
app.delete('/make-server-6d579fee/admin/devotionals/:id/audio', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!(await isAdminUser(userId))) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const devotionalId = c.req.param('id');
    const devotional = await kv.get(`devotional:${devotionalId}`);

    if (!devotional || !devotional.audioFileName) {
      return c.json({ error: 'No audio file found for this devotional' }, 404);
    }

    const supabase = getSupabase();
    const bucketName = 'make-6d579fee-devotional-audio';

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([devotional.audioFileName]);

    if (deleteError) {
      console.error('[Audio] Delete error:', deleteError);
      return c.json({ error: 'Failed to delete audio file' }, 500);
    }

    // Update devotional
    delete devotional.audioUrl;
    delete devotional.audioFileName;
    devotional.updatedAt = new Date().toISOString();
    await kv.set(`devotional:${devotionalId}`, devotional);

    console.log('[Audio] ✅ Audio deleted successfully:', devotional.audioFileName);

    return c.json({ success: true });
  } catch (error: any) {
    console.error('[Audio] Delete error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get audio info for devotional
app.get('/make-server-6d579fee/admin/devotionals/:id/audio', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const devotionalId = c.req.param('id');
    const devotional = await kv.get(`devotional:${devotionalId}`);

    if (!devotional) {
      return c.json({ error: 'Devotional not found' }, 404);
    }

    return c.json({ 
      hasAudio: !!devotional.audioUrl,
      audioUrl: devotional.audioUrl || null,
      fileName: devotional.audioFileName || null
    });
  } catch (error: any) {
    console.error('[Audio] Get audio info error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Fresh signed audio URL for any authenticated user (avoids stale cached URLs)
app.get('/make-server-6d579fee/devotions/:id/audio-url', async (c) => {
  try {
    const userId = await getUserFromToken(c.req.header('Authorization'));
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    const devotionalId = c.req.param('id');
    const devotional = await kv.get(`devotional:${devotionalId}`);

    if (!devotional) return c.json({ error: 'Devotional not found' }, 404);
    if (!devotional.audioFileName) return c.json({ error: 'No audio file for this devotional' }, 404);

    const freshUrl = await refreshAudioUrl(devotional.audioFileName);
    if (!freshUrl) {
      console.error(`[Audio] Could not generate signed URL for devotional ${devotionalId}, file: ${devotional.audioFileName}`);
      return c.json({ error: 'Audio file not accessible in storage' }, 404);
    }

    return c.json({ audioUrl: freshUrl });
  } catch (error: any) {
    console.error('[Audio] Fresh URL error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// COMMUNITY ROUTES
// ============================================
app.route('/make-server-6d579fee', communityRoutes);

// ============================================
// WEBRTC ROUTES
// ============================================
app.route('/make-server-6d579fee', webrtcRoutes);

// ============================================
// PUSH NOTIFICATION ROUTES
// ============================================
app.route('/make-server-6d579fee', pushRoutes);

// ============================================
// NEWSLETTER ROUTES
// ============================================
app.route('/make-server-6d579fee/newsletter', newsletterRoutes);

// ============================================
// LANDING PAGE ROUTES
// ============================================
app.route('/make-server-6d579fee/landing', landingRoutes);

// ============================================
// ADMIN PRIVILEGE MANAGEMENT ROUTES
// ============================================
setupAdminRoutes(app, getSupabase());

// ============================================
// START SERVER
// ============================================

// Defer all heavy init/seed work so the server starts accepting requests immediately
setTimeout(() => {
  initAudioBucket();
  initializeAdminSystem().catch(err => {
    console.error('[Server] Failed to initialize admin system:', err);
  });
}, 3000);

// ============================================
// LOCATION TRACKING
// ============================================

// Update user location
app.post('/make-server-6d579fee/update-location', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = c.get('supabase');
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { location, locationType } = await c.req.json();

    if (!location || !location.latitude || !location.longitude) {
      return c.json({ error: 'Invalid location data' }, 400);
    }

    if (!locationType || !['live', 'manual'].includes(locationType)) {
      return c.json({ error: 'Invalid location type' }, 400);
    }

    // Store location in KV store
    const locationData = {
      userId: user.id,
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city || null,
      country: location.country || null,
      locationType: locationType,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`location:${user.id}`, locationData);

    console.log('[Location] Location updated for user:', user.id, locationData);

    return c.json({ success: true, location: locationData });
  } catch (error) {
    console.error('[Location] Update location error:', error);
    return c.json({ error: 'Failed to update location' }, 500);
  }
});

// Get couple locations (user + partner)
app.get('/make-server-6d579fee/couple-locations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = c.get('supabase');
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user profile to find partner ID
    const userProfile = await kv.get(`user:${user.id}`);
    const partnerId = userProfile?.partnerId || null;

    console.log('[Location] Getting locations for user:', user.id, 'partner:', partnerId);

    // Get user location from KV store
    const userLocationData = await kv.get(`location:${user.id}`);

    // Get partner location if partner exists
    let partnerLocationData = null;
    if (partnerId) {
      partnerLocationData = await kv.get(`location:${partnerId}`);
    }

    console.log('[Location] User location:', userLocationData);
    console.log('[Location] Partner location:', partnerLocationData);

    // Format response
    const userLocation = userLocationData ? {
      userId: user.id,
      location: {
        latitude: userLocationData.latitude,
        longitude: userLocationData.longitude,
        city: userLocationData.city,
        country: userLocationData.country
      },
      locationType: userLocationData.locationType,
      updatedAt: userLocationData.updatedAt
    } : null;

    const partnerLocation = partnerLocationData ? {
      userId: partnerId,
      location: {
        latitude: partnerLocationData.latitude,
        longitude: partnerLocationData.longitude,
        city: partnerLocationData.city,
        country: partnerLocationData.country
      },
      locationType: partnerLocationData.locationType,
      updatedAt: partnerLocationData.updatedAt
    } : null;

    return c.json({
      userLocation,
      partnerLocation
    });
  } catch (error) {
    console.error('[Location] Get couple locations error:', error);
    return c.json({ error: 'Failed to get locations' }, 500);
  }
});

// Remove user location
app.delete('/make-server-6d579fee/update-location', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = c.get('supabase');
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Delete location from KV store
    await kv.del(`location:${user.id}`);

    console.log('[Location] Location removed for user:', user.id);

    return c.json({ success: true });
  } catch (error) {
    console.error('[Location] Remove location error:', error);
    return c.json({ error: 'Failed to remove location' }, 500);
  }
});

// Seed initial devotionals if none exist
async function seedInitialDevotionals() {
  try {
    const existingDevotionals = await kv.getByPrefix('devotional:');
    
    if (existingDevotionals.length === 0) {
      console.log('📖 Seeding initial devotionals...');
      
      const today = new Date();
      const sampleDevotionals = [
        {
          title: "Love is Patient",
          verse: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
          reference: "1 Corinthians 13:4",
          reflection: "In our relationships, patience is not passive waiting - it's active love. When we practice patience with our partner, we mirror God's patience with us. Today, choose to respond with patience rather than react with frustration.",
          prayerPrompt: "Pray together for patience in your relationship",
          tags: ['Love', 'Patience', 'Growth'],
          status: 'published',
          language: 'en'
        },
        {
          title: "Praying Together",
          verse: "Again, truly I tell you that if two of you on earth agree about anything they ask for, it will be done for them by my Father in heaven.",
          reference: "Matthew 18:19",
          reflection: "Prayer is the foundation of a Christ-centered relationship. When we pray together, we invite God into our relationship and align our hearts with His will. Make prayer a daily habit in your relationship.",
          prayerPrompt: "Thank God for your partner and pray for their needs today",
          tags: ['Prayer', 'Faith', 'Unity'],
          status: 'published',
          language: 'en'
        },
        {
          title: "Serving One Another",
          verse: "For you were called to freedom, brothers. Only do not use your freedom as an opportunity for the flesh, but through love serve one another.",
          reference: "Galatians 5:13",
          reflection: "True love is shown through service. When we serve our partner selflessly, we demonstrate Christ's love. Look for opportunities today to serve your partner without expecting anything in return.",
          prayerPrompt: "Ask God to show you how to better serve your partner",
          tags: ['Service', 'Love', 'Sacrifice'],
          status: 'published',
          language: 'en'
        }
      ];
      
      for (let i = 0; i < sampleDevotionals.length; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const devotionalId = `${date.toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 9)}`;
        
        await kv.set(`devotional:${devotionalId}`, {
          id: devotionalId,
          date: date.toISOString().split('T')[0],
          ...sampleDevotionals[i],
          createdAt: new Date().toISOString()
        });
      }
      
      console.log('✅ Seeded 3 initial devotionals');
    } else {
      console.log(`📖 Found ${existingDevotionals.length} existing devotionals`);
    }
  } catch (error) {
    console.error('Failed to seed devotionals:', error);
  }
}

// Seed devotionals after server is ready
setTimeout(() => seedInitialDevotionals(), 5000);

// ============================================================
// SEED: Travel & Adventure sample Q&A questions
// ============================================================
async function seedTravelAdventureQuestions() {
  try {
    if (await kv.get("seeded:travel")) return;

    const travelQuestions = [
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Our Dream Destination Together",
        verse: "By faith Abraham obeyed when he was called to go out to a place that he was to receive as an inheritance. And he went out, not knowing where he was going.",
        verseReference: "Hebrews 11:8",
        prompts: [
          { id: "t1p1", text: "If you could visit any place in the world together, where would it be and why?", type: "text" },
          { id: "t1p2", text: "How do you feel about traveling to unfamiliar places with your partner?", type: "scale", scaleMax: 5 },
          { id: "t1p3", text: "What kind of travel excites you most?", type: "multiple_choice", options: ["Cultural cities", "Nature & wilderness", "Beach & ocean", "Mountains & hiking", "Historical sites"] },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Faith on the Road",
        verse: "Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, This is the way; walk in it.",
        verseReference: "Isaiah 30:21",
        prompts: [
          { id: "t2p1", text: "How do you stay connected to your faith while traveling away from home?", type: "text" },
          { id: "t2p2", text: "Have you ever felt God's nearness in a special way during a trip? Share the story.", type: "text" },
          { id: "t2p3", text: "Would you be open to going on a mission trip or faith-based retreat together?", type: "yes_no" },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Budgeting for Adventures",
        verse: "For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?",
        verseReference: "Luke 14:28",
        prompts: [
          { id: "t3p1", text: "How much of your annual budget do you think should go toward travel and experiences?", type: "multiple_choice", options: ["Less than 5%", "5-10%", "10-20%", "More than 20%"] },
          { id: "t3p2", text: "Do you prefer saving up for one big trip or taking several smaller ones each year?", type: "multiple_choice", options: ["One big trip", "Several smaller trips", "A mix of both"] },
          { id: "t3p3", text: "How do you approach financial planning for travel together?", type: "text" },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Sabbath Rest & Vacation",
        verse: "And on the seventh day God finished his work that he had done, and he rested on the seventh day from all his work.",
        verseReference: "Genesis 2:2",
        prompts: [
          { id: "t4p1", text: "What does true rest and vacation look like for you?", type: "text" },
          { id: "t4p2", text: "Do you find it easy to disconnect from work and responsibilities when traveling?", type: "scale", scaleMax: 5 },
          { id: "t4p3", text: "What activities help you feel most refreshed and renewed on a trip?", type: "multiple_select", options: ["Sleeping in", "Exploring new places", "Reading & quiet time", "Prayer & devotionals", "Adventure activities", "Good food & restaurants"] },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Handling Conflict While Traveling",
        verse: "Be completely humble and gentle; be patient, bearing with one another in love.",
        verseReference: "Ephesians 4:2",
        prompts: [
          { id: "t5p1", text: "Describe a time travel plans went wrong. How did you handle it as a couple?", type: "text" },
          { id: "t5p2", text: "When something goes wrong on a trip, your natural reaction is:", type: "multiple_choice", options: ["Stay calm and problem-solve", "Feel frustrated but recover quickly", "Get stressed and need time to reset", "Look for humor in the situation"] },
          { id: "t5p3", text: "How can we better support each other when travel stress happens?", type: "text" },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Serving Others as We Travel",
        verse: "For I was hungry and you gave me food, I was thirsty and you gave me drink, I was a stranger and you welcomed me.",
        verseReference: "Matthew 25:35",
        prompts: [
          { id: "t6p1", text: "Have you ever served or volunteered in a community different from your own? What was that like?", type: "text" },
          { id: "t6p2", text: "How important is it to you that travel includes giving back to local communities?", type: "scale", scaleMax: 5 },
          { id: "t6p3", text: "Would you consider going on a humanitarian or volunteer trip together?", type: "yes_no" },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Stepping Out of Comfort Zones",
        verse: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
        verseReference: "Joshua 1:9",
        prompts: [
          { id: "t7p1", text: "What is something adventurous you have always wanted to try but felt too afraid to do?", type: "text" },
          { id: "t7p2", text: "How does your faith give you courage to try new experiences?", type: "text" },
          { id: "t7p3", text: "On a scale of 1-5, how adventurous are you as a traveler?", type: "scale", scaleMax: 5 },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Creating Memories & Gratitude",
        verse: "Give thanks in all circumstances; for this is the will of God in Christ Jesus for you.",
        verseReference: "1 Thessalonians 5:18",
        prompts: [
          { id: "t8p1", text: "What is your favorite travel memory together, and what made it so special?", type: "text" },
          { id: "t8p2", text: "How do you keep travel memories alive?", type: "multiple_select", options: ["Photo albums", "Travel journal", "Collecting souvenirs", "Videos & reels", "Retelling stories", "Prayer of thanks"] },
          { id: "t8p3", text: "How can gratitude transform an ordinary trip into an extraordinary experience?", type: "text" },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "Travel Roles & Partnership",
        verse: "Two are better than one, because they have a good reward for their toil. For if they fall, one will lift up his fellow.",
        verseReference: "Ecclesiastes 4:9-10",
        prompts: [
          { id: "t9p1", text: "When planning a trip, which role do you naturally take?", type: "multiple_choice", options: ["The planner & researcher", "The spontaneous one", "The budget tracker", "The activity suggester", "I follow my partner's lead"] },
          { id: "t9p2", text: "What does teamwork look like for you when traveling together?", type: "text" },
          { id: "t9p3", text: "Do you think your travel styles complement each other well?", type: "yes_no" },
        ],
      },
      {
        category: "travel",
        language: "en",
        status: "active",
        title: "A Spiritual Pilgrimage Together",
        verse: "Blessed are those whose strength is in you, whose hearts are set on pilgrimage.",
        verseReference: "Psalm 84:5",
        prompts: [
          { id: "t10p1", text: "Is there a spiritually meaningful place you would love to visit together, such as Israel or a retreat center?", type: "text" },
          { id: "t10p2", text: "How could a pilgrimage or faith-focused trip strengthen your relationship with God and each other?", type: "text" },
          { id: "t10p3", text: "What spiritual disciplines would you want to practice together while on a faith trip?", type: "multiple_select", options: ["Daily prayer", "Scripture reading", "Worship & singing", "Fasting", "Journaling", "Service & giving"] },
        ],
      },
    ];

    for (const q of travelQuestions) {
      const id = "travel-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
      await kv.set("question:" + id, { ...q, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      await new Promise((r) => setTimeout(r, 10));
    }
    await kv.set("seeded:travel", true);
    console.log("Seeded 10 Travel & Adventure Q&A questions");
  } catch (error) {
    console.error("Failed to seed travel questions:", error);
  }
}

setTimeout(() => seedTravelAdventureQuestions(), 8000);

// ============================================================
// SEED: All remaining Q&A categories
// ============================================================

// One-time migration: scan existing questions and set any missing seeder flags
async function migrateSeederFlags() {
  try {
    if (await kv.get("system:seeder-flags-v1")) return;
    const allQuestions = await kv.getByPrefix("question:");
    const seededCategories = new Set<string>();
    for (const q of allQuestions) {
      if (q.category) seededCategories.add(q.category);
    }
    for (const cat of seededCategories) {
      const flagKey = cat === "travel" ? "seeded:travel" : "seeded:" + cat;
      if (!(await kv.get(flagKey))) {
        await kv.set(flagKey, true);
        console.log("[SeederMigration] Set flag for existing category:", cat);
      }
    }
    await kv.set("system:seeder-flags-v1", true);
    console.log("[SeederMigration] Done. Categories with questions:", [...seededCategories].join(", "));
  } catch (err) {
    console.error("[SeederMigration] Failed:", err);
  }
}

async function seedAllCategoryQuestions() {
  try {
    await migrateSeederFlags();

    async function seedCategory(categoryId: string, questions: any[]) {
      if (await kv.get("seeded:" + categoryId)) return;
      for (const q of questions) {
        const id = categoryId + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
        await kv.set("question:" + id, { ...q, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        await new Promise((r) => setTimeout(r, 10));
      }
      await kv.set("seeded:" + categoryId, true);
      console.log("Seeded 10 " + categoryId + " Q&A questions");
    }

    // ─── Daily Life & Habits ───────────────────────────────────────────────
    await seedCategory("daily-life", [
      {
        category: "daily-life", language: "en", status: "active",
        title: "Morning Rhythms Together",
        verse: "This is the day the LORD has made; let us rejoice and be glad in it.",
        verseReference: "Psalm 118:24",
        prompts: [
          { id: "dl1p1", text: "Describe your ideal morning routine as a couple.", type: "text" },
          { id: "dl1p2", text: "How important is starting the day with prayer or devotion together?", type: "scale", scaleMax: 5 },
          { id: "dl1p3", text: "Which morning habit would you most want to build together?", type: "multiple_choice", options: ["Prayer & devotion", "Exercise", "Cooking breakfast", "Bible reading", "Quiet time"] },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Chores & Shared Responsibility",
        verse: "Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace.",
        verseReference: "1 Peter 4:10",
        prompts: [
          { id: "dl2p1", text: "How do you think household responsibilities should be divided between partners?", type: "text" },
          { id: "dl2p2", text: "Which chore do you strongly dislike and would want your partner to handle?", type: "text" },
          { id: "dl2p3", text: "How would you approach it if you felt the division of home duties was unfair?", type: "text" },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Screen Time & Digital Habits",
        verse: "Be careful then how you live - not as unwise but as wise, making the most of every opportunity.",
        verseReference: "Ephesians 5:15-16",
        prompts: [
          { id: "dl3p1", text: "How much daily screen time do you think is healthy in a relationship?", type: "multiple_choice", options: ["Under 1 hour", "1-2 hours", "2-4 hours", "No limit"] },
          { id: "dl3p2", text: "Are there times when phones should be put away completely (meals, bedtime, etc.)?", type: "yes_no" },
          { id: "dl3p3", text: "What boundaries around social media would help your relationship thrive?", type: "text" },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Eating & Food Culture",
        verse: "So whether you eat or drink or whatever you do, do it all for the glory of God.",
        verseReference: "1 Corinthians 10:31",
        prompts: [
          { id: "dl4p1", text: "How important is cooking and sharing meals together to you?", type: "scale", scaleMax: 5 },
          { id: "dl4p2", text: "What food traditions from your family do you want to carry into your relationship?", type: "text" },
          { id: "dl4p3", text: "How do you handle it when you have different dietary preferences or habits?", type: "text" },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Rest & Sleep Habits",
        verse: "He grants sleep to those he loves.",
        verseReference: "Psalm 127:2",
        prompts: [
          { id: "dl5p1", text: "Are you a morning person or a night owl, and how do you think that affects your relationship?", type: "multiple_choice", options: ["Early bird", "Night owl", "Flexible / depends"] },
          { id: "dl5p2", text: "What helps you wind down at the end of the day?", type: "text" },
          { id: "dl5p3", text: "How do you want to handle bedtime routines together as a couple?", type: "text" },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Friendships & Social Life",
        verse: "As iron sharpens iron, so one person sharpens another.",
        verseReference: "Proverbs 27:17",
        prompts: [
          { id: "dl6p1", text: "How much time do you each need with friends outside the relationship?", type: "text" },
          { id: "dl6p2", text: "How do you feel about your partner having close friendships with people of the opposite sex?", type: "text" },
          { id: "dl6p3", text: "How should couple friendships (other couples) be prioritized in your social life?", type: "text" },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Health & Fitness Together",
        verse: "Do you not know that your bodies are temples of the Holy Spirit?",
        verseReference: "1 Corinthians 6:19",
        prompts: [
          { id: "dl7p1", text: "What role does physical fitness play in your daily life right now?", type: "text" },
          { id: "dl7p2", text: "Would you enjoy working out or exercising together?", type: "yes_no" },
          { id: "dl7p3", text: "How can you support each other in building healthy habits?", type: "text" },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Personal Space & Alone Time",
        verse: "But Jesus often withdrew to lonely places and prayed.",
        verseReference: "Luke 5:16",
        prompts: [
          { id: "dl8p1", text: "How much alone time do you need each day to feel recharged?", type: "multiple_choice", options: ["Very little  -  I prefer togetherness", "30 min to 1 hour", "1-2 hours", "Several hours"] },
          { id: "dl8p2", text: "How do you communicate your need for space without hurting your partner?", type: "text" },
          { id: "dl8p3", text: "What does healthy solitude look like in a marriage relationship?", type: "text" },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Work-Life Balance",
        verse: "Unless the LORD builds the house, the builders labor in vain.",
        verseReference: "Psalm 127:1",
        prompts: [
          { id: "dl9p1", text: "How do you currently balance career ambitions with your personal and relationship life?", type: "text" },
          { id: "dl9p2", text: "What would you do if work demands regularly took time away from the relationship?", type: "text" },
          { id: "dl9p3", text: "How important is it to you that both partners prioritize family over career?", type: "scale", scaleMax: 5 },
        ],
      },
      {
        category: "daily-life", language: "en", status: "active",
        title: "Hobbies & Personal Growth",
        verse: "Whatever you do, work at it with all your heart, as working for the Lord.",
        verseReference: "Colossians 3:23",
        prompts: [
          { id: "dl10p1", text: "What hobbies or interests are most important for you to keep as an individual?", type: "text" },
          { id: "dl10p2", text: "Is there a new hobby or skill you would love to learn together?", type: "text" },
          { id: "dl10p3", text: "How do you support each other in personal goals outside the relationship?", type: "text" },
        ],
      },
    ]);

    // ─── Intimacy & Lifestyle ──────────────────────────────────────────────
    await seedCategory("intimacy", [
      {
        category: "intimacy", language: "en", status: "active",
        title: "Understanding Emotional Intimacy",
        verse: "Above all else, guard your heart, for everything you do flows from it.",
        verseReference: "Proverbs 4:23",
        prompts: [
          { id: "in1p1", text: "How do you best feel emotionally close and connected to your partner?", type: "text" },
          { id: "in1p2", text: "How comfortable are you sharing your deepest fears and insecurities?", type: "scale", scaleMax: 5 },
          { id: "in1p3", text: "What helps you feel emotionally safe enough to be fully vulnerable?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Love Languages in Practice",
        verse: "Dear children, let us not love with words or speech but with actions and in truth.",
        verseReference: "1 John 3:18",
        prompts: [
          { id: "in2p1", text: "What is your primary love language and how does it show up in your daily life?", type: "multiple_choice", options: ["Words of affirmation", "Acts of service", "Receiving gifts", "Quality time", "Physical touch"] },
          { id: "in2p2", text: "What does your partner do that makes you feel most loved?", type: "text" },
          { id: "in2p3", text: "When do you feel your love language is being neglected?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Physical Affection",
        verse: "Let him kiss me with the kisses of his mouth, for your love is more delightful than wine.",
        verseReference: "Song of Solomon 1:2",
        prompts: [
          { id: "in3p1", text: "How important is physical affection (hugs, holding hands, etc.) in your daily relationship?", type: "scale", scaleMax: 5 },
          { id: "in3p2", text: "Are there ways you enjoy being touched or shown affection that your partner may not know about?", type: "text" },
          { id: "in3p3", text: "How do you handle differences in your desires for physical closeness?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Spiritual Intimacy",
        verse: "Though one may be overpowered, two can defend themselves. A cord of three strands is not quickly broken.",
        verseReference: "Ecclesiastes 4:12",
        prompts: [
          { id: "in4p1", text: "What spiritual practices help you feel most connected to God and to each other?", type: "multiple_select", options: ["Praying together", "Bible study", "Worship music", "Church attendance", "Serving together", "Devotionals"] },
          { id: "in4p2", text: "How often do you want to pray together as a couple?", type: "multiple_choice", options: ["Daily", "A few times a week", "Weekly", "As needed"] },
          { id: "in4p3", text: "What does keeping God at the center of your relationship look like practically?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Guarding Sexual Purity",
        verse: "Flee from sexual immorality. Every other sin a person commits is outside the body, but the sexually immoral person sins against his own body.",
        verseReference: "1 Corinthians 6:18",
        prompts: [
          { id: "in5p1", text: "How do you think couples should set boundaries to guard sexual purity before marriage?", type: "text" },
          { id: "in5p2", text: "What accountability structures help you stay committed to purity?", type: "text" },
          { id: "in5p3", text: "How do you want to handle past mistakes or struggles in this area as a couple?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Quality Time & Presence",
        verse: "Where you go I will go, and where you stay I will stay.",
        verseReference: "Ruth 1:16",
        prompts: [
          { id: "in6p1", text: "What does quality time mean to you  -  what activities make you feel most connected?", type: "text" },
          { id: "in6p2", text: "How often do you need intentional one-on-one time to feel secure in the relationship?", type: "multiple_choice", options: ["Every day", "Several times a week", "Weekly", "As schedules allow"] },
          { id: "in6p3", text: "What gets in the way of quality time most often and how can you address it?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Deep Conversations & Vulnerability",
        verse: "Carry each other burdens, and in this way you will fulfill the law of Christ.",
        verseReference: "Galatians 6:2",
        prompts: [
          { id: "in7p1", text: "What topic do you find hardest to discuss openly with your partner?", type: "text" },
          { id: "in7p2", text: "How do you respond when your partner shares something deeply personal or painful?", type: "text" },
          { id: "in7p3", text: "What would help you feel safer opening up about difficult things?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Celebration & Joy",
        verse: "Rejoice with those who rejoice; mourn with those who mourn.",
        verseReference: "Romans 12:15",
        prompts: [
          { id: "in8p1", text: "How do you like to celebrate wins and milestones together?", type: "text" },
          { id: "in8p2", text: "Do you feel your partner celebrates your achievements in the way that means most to you?", type: "yes_no" },
          { id: "in8p3", text: "What is one area of your partner's life you want to celebrate more intentionally?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Listening & Being Heard",
        verse: "Everyone should be quick to listen, slow to speak and slow to become angry.",
        verseReference: "James 1:19",
        prompts: [
          { id: "in9p1", text: "Do you feel truly heard and understood by your partner in most conversations?", type: "scale", scaleMax: 5 },
          { id: "in9p2", text: "What does active listening look like to you?", type: "text" },
          { id: "in9p3", text: "What is one listening habit you could improve to make your partner feel more valued?", type: "text" },
        ],
      },
      {
        category: "intimacy", language: "en", status: "active",
        title: "Growth Through Seasons",
        verse: "There is a time for everything, and a season for every activity under the heavens.",
        verseReference: "Ecclesiastes 3:1",
        prompts: [
          { id: "in10p1", text: "How has your understanding of intimacy and love grown over the past year?", type: "text" },
          { id: "in10p2", text: "In which season of life do you expect intimacy to be hardest to maintain (newlywed, parenting, career peaks)?", type: "text" },
          { id: "in10p3", text: "What commitment can you make now to nurture intimacy through every season?", type: "text" },
        ],
      },
    ]);

    // ─── Love & Balance ────────────────────────────────────────────────────
    await seedCategory("love-balance", [
      {
        category: "love-balance", language: "en", status: "active",
        title: "Unconditional Love",
        verse: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
        verseReference: "1 Corinthians 13:4",
        prompts: [
          { id: "lb1p1", text: "What does loving your partner unconditionally look like on a hard day?", type: "text" },
          { id: "lb1p2", text: "Is there a condition you sometimes (even unconsciously) place on your love?", type: "text" },
          { id: "lb1p3", text: "How does God's unconditional love shape how you love your partner?", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Selflessness & Sacrifice",
        verse: "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves.",
        verseReference: "Philippians 2:3",
        prompts: [
          { id: "lb2p1", text: "In what area of your relationship do you find it hardest to be selfless?", type: "text" },
          { id: "lb2p2", text: "Share a time when your partner made a meaningful sacrifice for you.", type: "text" },
          { id: "lb2p3", text: "How do you make sure that selflessness does not lead to feeling unseen or taken for granted?", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Giving & Receiving",
        verse: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over.",
        verseReference: "Luke 6:38",
        prompts: [
          { id: "lb3p1", text: "Are you more naturally a giver or a receiver in the relationship?", type: "multiple_choice", options: ["Mostly a giver", "Mostly a receiver", "Pretty balanced"] },
          { id: "lb3p2", text: "Do you find it easy to receive love and care from your partner graciously?", type: "yes_no" },
          { id: "lb3p3", text: "What is one way your partner gives to you that you deeply appreciate?", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Balancing Independence & Togetherness",
        verse: "For this reason a man will leave his father and mother and be united to his wife, and the two will become one flesh.",
        verseReference: "Matthew 19:5",
        prompts: [
          { id: "lb4p1", text: "How do you maintain your individual identity while building a life together?", type: "text" },
          { id: "lb4p2", text: "Do you feel the current balance between independence and togetherness is right?", type: "scale", scaleMax: 5 },
          { id: "lb4p3", text: "What does healthy unity look like without losing who you each are?", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Managing Expectations",
        verse: "A longing fulfilled is sweet to the soul.",
        verseReference: "Proverbs 13:19",
        prompts: [
          { id: "lb5p1", text: "What unspoken expectations do you have of your partner that you have never fully communicated?", type: "text" },
          { id: "lb5p2", text: "How do you respond when your expectations go unmet?", type: "text" },
          { id: "lb5p3", text: "How can you communicate needs and expectations more openly?", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Forgiveness in Love",
        verse: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.",
        verseReference: "Ephesians 4:32",
        prompts: [
          { id: "lb6p1", text: "How quickly do you typically forgive your partner after a conflict?", type: "multiple_choice", options: ["Right away", "Within a day", "It takes a few days", "It takes longer"] },
          { id: "lb6p2", text: "Is there anything you have been holding onto that you need to forgive?", type: "text" },
          { id: "lb6p3", text: "What does genuine forgiveness look like versus just moving on?", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Acts of Service & Appreciation",
        verse: "For even the Son of Man did not come to be served, but to serve.",
        verseReference: "Mark 10:45",
        prompts: [
          { id: "lb7p1", text: "What acts of service from your partner make you feel most loved and appreciated?", type: "text" },
          { id: "lb7p2", text: "How often do you express gratitude for the small things your partner does?", type: "scale", scaleMax: 5 },
          { id: "lb7p3", text: "What is one act of service you could commit to doing for your partner this week?", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Handling Jealousy & Insecurity",
        verse: "Perfect love drives out fear.",
        verseReference: "1 John 4:18",
        prompts: [
          { id: "lb8p1", text: "What situations tend to trigger insecurity or jealousy for you?", type: "text" },
          { id: "lb8p2", text: "How can your partner help you feel more secure without enabling unhealthy behavior?", type: "text" },
          { id: "lb8p3", text: "How does faith help you overcome fear and insecurity in love?", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Encouragement & Affirmation",
        verse: "Therefore encourage one another and build each other up.",
        verseReference: "1 Thessalonians 5:11",
        prompts: [
          { id: "lb9p1", text: "What words of affirmation from your partner mean the most to you?", type: "text" },
          { id: "lb9p2", text: "How often do you intentionally encourage your partner in their faith and calling?", type: "scale", scaleMax: 5 },
          { id: "lb9p3", text: "Write one specific thing you genuinely admire and appreciate about your partner.", type: "text" },
        ],
      },
      {
        category: "love-balance", language: "en", status: "active",
        title: "Growing Love Over Time",
        verse: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up.",
        verseReference: "Galatians 6:9",
        prompts: [
          { id: "lb10p1", text: "How do you intentionally keep love growing and not just maintaining the status quo?", type: "text" },
          { id: "lb10p2", text: "What habits or rituals help your love deepen over time?", type: "text" },
          { id: "lb10p3", text: "What does a thriving marriage relationship look like 10 years from now?", type: "text" },
        ],
      },
    ]);

    // ─── Dream Wedding / Dream Home ────────────────────────────────────────
    await seedCategory("dream-wedding", [
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Our Wedding Vision",
        verse: "How beautiful you are, my darling! Oh, how beautiful!",
        verseReference: "Song of Solomon 1:15",
        prompts: [
          { id: "dw1p1", text: "Describe your dream wedding  -  big celebration or intimate gathering?", type: "multiple_choice", options: ["Grand celebration (100+ guests)", "Medium gathering (50-100)", "Intimate ceremony (under 50)", "Elopement / just us"] },
          { id: "dw1p2", text: "What three elements matter most to you on your wedding day?", type: "text" },
          { id: "dw1p3", text: "How important is it that the wedding reflects your faith and values?", type: "scale", scaleMax: 5 },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Wedding Budget & Priorities",
        verse: "Suppose one of you wants to build a tower. Will he not first sit down and estimate the cost?",
        verseReference: "Luke 14:28",
        prompts: [
          { id: "dw2p1", text: "How much do you think a couple should spend on a wedding?", type: "multiple_choice", options: ["Under $5,000", "$5,000-$15,000", "$15,000-$30,000", "$30,000+", "Whatever it takes"] },
          { id: "dw2p2", text: "Which wedding expense would you not be willing to cut back on?", type: "text" },
          { id: "dw2p3", text: "How should family financial contributions affect wedding decisions?", type: "text" },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Ceremony & Vows",
        verse: "What God has joined together, let no one separate.",
        verseReference: "Matthew 19:6",
        prompts: [
          { id: "dw3p1", text: "Do you want to write your own vows or use traditional vows?", type: "multiple_choice", options: ["Write our own", "Traditional vows", "A mix of both"] },
          { id: "dw3p2", text: "What Scripture passages are most meaningful to you for a wedding ceremony?", type: "text" },
          { id: "dw3p3", text: "What role do you want prayer and faith to play in your ceremony?", type: "text" },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Our Dream Home",
        verse: "By wisdom a house is built, and through understanding it is established.",
        verseReference: "Proverbs 24:3",
        prompts: [
          { id: "dw4p1", text: "Describe your dream home  -  where and what type?", type: "text" },
          { id: "dw4p2", text: "City or suburbs, house or apartment  -  what is your ideal living situation?", type: "multiple_choice", options: ["City apartment", "Suburban house", "Rural / countryside", "Townhouse", "Open to anything"] },
          { id: "dw4p3", text: "How soon after marriage do you hope to own a home?", type: "text" },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Creating a Home Environment",
        verse: "As for me and my household, we will serve the LORD.",
        verseReference: "Joshua 24:15",
        prompts: [
          { id: "dw5p1", text: "What values or atmosphere do you want your home to carry?", type: "multiple_select", options: ["Peaceful & calm", "Welcoming & hospitable", "Faith-centered", "Fun & lively", "Creative & artistic", "Orderly & structured"] },
          { id: "dw5p2", text: "How important is hospitality  -  opening your home to others  -  to you?", type: "scale", scaleMax: 5 },
          { id: "dw5p3", text: "What spiritual practices do you want to be part of your home culture (prayer, Bible reading, worship)?", type: "text" },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Honeymoon Dreams",
        verse: "He has taken me to the banquet hall, and his banner over me is love.",
        verseReference: "Song of Solomon 2:4",
        prompts: [
          { id: "dw6p1", text: "Where would your dream honeymoon destination be?", type: "text" },
          { id: "dw6p2", text: "What kind of honeymoon experience do you want  -  adventure, relaxation, or exploring culture?", type: "multiple_choice", options: ["Relaxing on a beach", "Exploring a new city", "Adventure & nature", "A mix of all three"] },
          { id: "dw6p3", text: "How important is it to start your marriage with a special getaway together?", type: "scale", scaleMax: 5 },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Family Involvement in Wedding Planning",
        verse: "Honor your father and your mother.",
        verseReference: "Exodus 20:12",
        prompts: [
          { id: "dw7p1", text: "How much input should each partner's family have in wedding decisions?", type: "multiple_choice", options: ["Full involvement", "Consulted but not deciding", "Minimal involvement", "We decide, they attend"] },
          { id: "dw7p2", text: "Which family traditions are important to incorporate into your wedding?", type: "text" },
          { id: "dw7p3", text: "How will you handle disagreements between your families over wedding choices?", type: "text" },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Decorating & Nesting Together",
        verse: "She gets up while it is still night; she provides food for her family.",
        verseReference: "Proverbs 31:15",
        prompts: [
          { id: "dw8p1", text: "How would you describe your ideal home decor style?", type: "multiple_choice", options: ["Modern & minimalist", "Cozy & warm", "Rustic & natural", "Bold & eclectic", "Classic & traditional"] },
          { id: "dw8p2", text: "How will you make joint decisions about furnishing and decorating your shared space?", type: "text" },
          { id: "dw8p3", text: "What is one item or element that is non-negotiable in your future home?", type: "text" },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "Marriage Preparation",
        verse: "Plans fail for lack of counsel, but with many advisers they succeed.",
        verseReference: "Proverbs 15:22",
        prompts: [
          { id: "dw9p1", text: "Have you or would you do premarital counseling together?", type: "yes_no" },
          { id: "dw9p2", text: "What topics do you most want to discuss with a pastor or counselor before marriage?", type: "text" },
          { id: "dw9p3", text: "What books or resources about marriage have shaped your expectations?", type: "text" },
        ],
      },
      {
        category: "dream-wedding", language: "en", status: "active",
        title: "The First Year of Marriage",
        verse: "If a man has recently married, he must not be sent to war or have any other duty laid on him. For one year he is to be free to stay at home and bring happiness to the wife he has married.",
        verseReference: "Deuteronomy 24:5",
        prompts: [
          { id: "dw10p1", text: "What are your biggest hopes for your first year of marriage?", type: "text" },
          { id: "dw10p2", text: "What challenges do you anticipate in the adjustment to married life?", type: "text" },
          { id: "dw10p3", text: "What rhythms or habits do you want to establish in the very first month of marriage?", type: "text" },
        ],
      },
    ]);

    // ─── Relationship Boundaries ───────────────────────────────────────────
    await seedCategory("boundaries", [
      {
        category: "boundaries", language: "en", status: "active",
        title: "What Are Healthy Boundaries?",
        verse: "Above all else, guard your heart, for everything you do flows from it.",
        verseReference: "Proverbs 4:23",
        prompts: [
          { id: "bo1p1", text: "In your own words, what does a healthy relationship boundary mean to you?", type: "text" },
          { id: "bo1p2", text: "Do you feel comfortable setting and communicating personal boundaries?", type: "scale", scaleMax: 5 },
          { id: "bo1p3", text: "What area of your life needs the clearest boundaries right now?", type: "multiple_choice", options: ["Friendships", "Work & career", "Family", "Social media", "Personal time", "Finances"] },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Boundaries With Exes",
        verse: "Flee the evil desires of youth and pursue righteousness, faith, love and peace.",
        verseReference: "2 Timothy 2:22",
        prompts: [
          { id: "bo2p1", text: "Do you think it is appropriate to maintain friendships with ex-partners while in a committed relationship?", type: "text" },
          { id: "bo2p2", text: "What level of contact with a former partner would you consider a boundary violation?", type: "text" },
          { id: "bo2p3", text: "How do you want to handle social media connections with past relationships?", type: "text" },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Emotional Boundaries",
        verse: "Each one should carry their own load.",
        verseReference: "Galatians 6:5",
        prompts: [
          { id: "bo3p1", text: "Is there a pattern of over-relying on your partner emotionally that could become unhealthy?", type: "text" },
          { id: "bo3p2", text: "How do you distinguish between healthy support and emotional dependency?", type: "text" },
          { id: "bo3p3", text: "What outside support systems (friends, counselor, faith community) help you carry your emotional load?", type: "text" },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Digital Privacy",
        verse: "Whatever is true, whatever is noble... think about such things.",
        verseReference: "Philippians 4:8",
        prompts: [
          { id: "bo4p1", text: "Do you believe couples should share phone passwords and have full access to each other's devices?", type: "multiple_choice", options: ["Yes, full transparency", "Optional but available", "No, privacy is important", "It depends on the situation"] },
          { id: "bo4p2", text: "How do you handle private conversations with friends that your partner is not part of?", type: "text" },
          { id: "bo4p3", text: "What boundaries around digital communication would make you both feel secure and respected?", type: "text" },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Physical Boundaries Before Marriage",
        verse: "It is God's will that you should be sanctified: that you should avoid sexual immorality.",
        verseReference: "1 Thessalonians 4:3",
        prompts: [
          { id: "bo5p1", text: "What specific physical boundaries are you committing to honor before marriage?", type: "text" },
          { id: "bo5p2", text: "How will you hold each other accountable to those commitments?", type: "text" },
          { id: "bo5p3", text: "What situations or environments do you need to avoid to protect your boundaries?", type: "text" },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Boundaries With Family",
        verse: "For this reason a man will leave his father and mother and be united to his wife.",
        verseReference: "Genesis 2:24",
        prompts: [
          { id: "bo6p1", text: "In what ways could family members overstep into your relationship, and how would you handle it?", type: "text" },
          { id: "bo6p2", text: "How do you balance honoring parents while building your own independent relationship?", type: "text" },
          { id: "bo6p3", text: "Are there family patterns or dynamics you want to intentionally leave behind?", type: "text" },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Work Boundaries",
        verse: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.",
        verseReference: "Romans 12:2",
        prompts: [
          { id: "bo7p1", text: "How do you prevent work stress and demands from spilling into your relationship?", type: "text" },
          { id: "bo7p2", text: "What is an acceptable work schedule that still protects your relationship?", type: "text" },
          { id: "bo7p3", text: "Should a career opportunity that requires significant sacrifice from your partner require their agreement?", type: "yes_no" },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Social Media Boundaries",
        verse: "I will not look with approval on anything that is vile.",
        verseReference: "Psalm 101:3",
        prompts: [
          { id: "bo8p1", text: "Are there types of content or accounts that you think couples should avoid following online?", type: "text" },
          { id: "bo8p2", text: "How much of your relationship should you share publicly on social media?", type: "multiple_choice", options: ["Everything  -  we are open books", "Highlights only", "Very little", "Nothing"] },
          { id: "bo8p3", text: "How would you address it if your partner posted something online that made you uncomfortable?", type: "text" },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Alone Time With Opposite Sex",
        verse: "Abstain from all appearance of evil.",
        verseReference: "1 Thessalonians 5:22",
        prompts: [
          { id: "bo9p1", text: "Do you think it is appropriate to meet alone with a close friend of the opposite sex?", type: "multiple_choice", options: ["Yes, trust matters more", "Only in public places", "No, it creates unnecessary risk", "Depends on the friendship"] },
          { id: "bo9p2", text: "What boundaries would help you both feel secure around opposite-sex friendships?", type: "text" },
          { id: "bo9p3", text: "How do you guard your heart in workplace relationships with the opposite sex?", type: "text" },
        ],
      },
      {
        category: "boundaries", language: "en", status: "active",
        title: "Respecting Each Other's Boundaries",
        verse: "Do to others as you would have them do to you.",
        verseReference: "Luke 6:31",
        prompts: [
          { id: "bo10p1", text: "How do you respond when your partner sets a boundary that feels restrictive to you?", type: "text" },
          { id: "bo10p2", text: "Have you ever pushed past a boundary your partner set? How did you handle it?", type: "text" },
          { id: "bo10p3", text: "What does it look like to honor your partner's boundaries as an act of love?", type: "text" },
        ],
      },
    ]);

    // ─── Trust & Truth ─────────────────────────────────────────────────────
    await seedCategory("trust", [
      {
        category: "trust", language: "en", status: "active",
        title: "Building Trust From Day One",
        verse: "Love... rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.",
        verseReference: "1 Corinthians 13:6-7",
        prompts: [
          { id: "tr1p1", text: "What actions build trust with you most quickly?", type: "multiple_select", options: ["Keeping promises", "Being consistent", "Full honesty", "Following through on plans", "Being on time", "Sharing emotions"] },
          { id: "tr1p2", text: "How long does it take you to fully trust someone in a relationship?", type: "text" },
          { id: "tr1p3", text: "What has your past experience taught you about trusting people?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "Honesty Even When It Hurts",
        verse: "Instead, speaking the truth in love, we will grow to become in every respect the mature body of him who is the head, that is, Christ.",
        verseReference: "Ephesians 4:15",
        prompts: [
          { id: "tr2p1", text: "Do you believe total honesty is always the right approach in a relationship?", type: "yes_no" },
          { id: "tr2p2", text: "Describe a situation where you chose honesty even though it was difficult.", type: "text" },
          { id: "tr2p3", text: "How do you want your partner to deliver hard truths to you?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "Transparency & Openness",
        verse: "Nothing in all creation is hidden from God's sight. Everything is uncovered and laid bare before the eyes of him to whom we must give account.",
        verseReference: "Hebrews 4:13",
        prompts: [
          { id: "tr3p1", text: "How transparent do you feel you currently are with your partner?", type: "scale", scaleMax: 5 },
          { id: "tr3p2", text: "Is there anything you have been hesitant to share with your partner that you know you should?", type: "text" },
          { id: "tr3p3", text: "What does radical transparency look like in a healthy relationship?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "When Trust Is Broken",
        verse: "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.",
        verseReference: "Colossians 3:13",
        prompts: [
          { id: "tr4p1", text: "Have you ever had your trust broken in a significant relationship? How did it affect you?", type: "text" },
          { id: "tr4p2", text: "What would it take for you to trust your partner again after a betrayal?", type: "text" },
          { id: "tr4p3", text: "What specific actions would demonstrate that trust has been genuinely rebuilt?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "Secrets & Hidden Things",
        verse: "For there is nothing hidden that will not be disclosed, and nothing concealed that will not be known or brought out into the open.",
        verseReference: "Luke 8:17",
        prompts: [
          { id: "tr5p1", text: "Do you believe that keeping secrets from your partner (even small ones) is harmful?", type: "text" },
          { id: "tr5p2", text: "Is there a past secret or hidden struggle you believe your partner should know about?", type: "text" },
          { id: "tr5p3", text: "How do you create an environment where both of you feel safe enough to confess hard things?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "Jealousy & Suspicion",
        verse: "Love... keeps no record of wrongs.",
        verseReference: "1 Corinthians 13:5",
        prompts: [
          { id: "tr6p1", text: "What triggers feelings of jealousy or suspicion for you in a relationship?", type: "text" },
          { id: "tr6p2", text: "How do you communicate jealousy without it becoming controlling or accusatory?", type: "text" },
          { id: "tr6p3", text: "What would help you feel more secure and less prone to suspicion?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "Keeping Your Word",
        verse: "All you need to say is simply yes or no; anything beyond this comes from the evil one.",
        verseReference: "Matthew 5:37",
        prompts: [
          { id: "tr7p1", text: "How seriously do you take promises made to your partner?", type: "scale", scaleMax: 5 },
          { id: "tr7p2", text: "What happens in your relationship when a commitment is not kept?", type: "text" },
          { id: "tr7p3", text: "What is one promise you want to make to your partner today?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "Financial Honesty",
        verse: "Whoever can be trusted with very little can also be trusted with much.",
        verseReference: "Luke 16:10",
        prompts: [
          { id: "tr8p1", text: "Are you fully honest with your partner about your financial situation, including debt?", type: "yes_no" },
          { id: "tr8p2", text: "Have you ever hidden a purchase or financial decision from your partner? What happened?", type: "text" },
          { id: "tr8p3", text: "What financial information do you think couples should share fully and openly?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "Accountability Together",
        verse: "Confess your sins to each other and pray for each other so that you may be healed.",
        verseReference: "James 5:16",
        prompts: [
          { id: "tr9p1", text: "Do you have an accountability partner outside your relationship for areas of personal struggle?", type: "yes_no" },
          { id: "tr9p2", text: "How comfortable are you with your partner holding you accountable in areas of weakness?", type: "scale", scaleMax: 5 },
          { id: "tr9p3", text: "What does loving accountability look like without tipping into control or judgment?", type: "text" },
        ],
      },
      {
        category: "trust", language: "en", status: "active",
        title: "Trusting God Together",
        verse: "Trust in the LORD with all your heart and lean not on your own understanding.",
        verseReference: "Proverbs 3:5",
        prompts: [
          { id: "tr10p1", text: "How has trusting God shaped the way you trust others?", type: "text" },
          { id: "tr10p2", text: "In what area of your relationship do you need to practice trusting God more?", type: "text" },
          { id: "tr10p3", text: "How can you pray together specifically about trust in your relationship?", type: "text" },
        ],
      },
    ]);

    // ─── Finance & Goals ───────────────────────────────────────────────────
    await seedCategory("finance", [
      {
        category: "finance", language: "en", status: "active",
        title: "Money Mindsets",
        verse: "For the love of money is a root of all kinds of evil.",
        verseReference: "1 Timothy 6:10",
        prompts: [
          { id: "fi1p1", text: "How did your family handle money when you were growing up, and how has that shaped you?", type: "text" },
          { id: "fi1p2", text: "Do you consider yourself a spender or a saver?", type: "multiple_choice", options: ["Natural spender", "Natural saver", "Balanced", "It depends"] },
          { id: "fi1p3", text: "What is your biggest financial fear and where do you think it comes from?", type: "text" },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Budgeting as a Team",
        verse: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
        verseReference: "Proverbs 21:5",
        prompts: [
          { id: "fi2p1", text: "Do you currently use a budget? How do you feel about budgeting?", type: "text" },
          { id: "fi2p2", text: "How should a couple manage money  -  joint account, separate, or both?", type: "multiple_choice", options: ["Fully joint", "Fully separate", "Joint for shared expenses, separate for personal", "Flexible"] },
          { id: "fi2p3", text: "What is a purchase amount that you think requires mutual agreement before spending?", type: "text" },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Giving & Generosity",
        verse: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
        verseReference: "2 Corinthians 9:7",
        prompts: [
          { id: "fi3p1", text: "Do you tithe or give regularly to your church or charity?", type: "yes_no" },
          { id: "fi3p2", text: "How much of your income do you believe a couple should give away?", type: "multiple_choice", options: ["10% (tithe)", "More than 10%", "Less than 10%", "Whatever feels right"] },
          { id: "fi3p3", text: "How should a couple decide where and how much to give?", type: "text" },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Debt & Financial Baggage",
        verse: "The rich rule over the poor, and the borrower is slave to the lender.",
        verseReference: "Proverbs 22:7",
        prompts: [
          { id: "fi4p1", text: "What debt are you currently carrying and how are you addressing it?", type: "text" },
          { id: "fi4p2", text: "How do you feel about entering marriage with student loans, credit card debt, or other liabilities?", type: "text" },
          { id: "fi4p3", text: "What is your plan to become debt-free, and how does your partner fit into that?", type: "text" },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Saving & Emergency Funds",
        verse: "Go to the ant, you sluggard; consider its ways and be wise! It stores its provisions in summer and gathers its food at harvest.",
        verseReference: "Proverbs 6:6-8",
        prompts: [
          { id: "fi5p1", text: "Do you have an emergency fund, and how many months of expenses does it cover?", type: "multiple_choice", options: ["No emergency fund yet", "1 month", "3 months", "6+ months"] },
          { id: "fi5p2", text: "How much of your income do you think should go to savings each month?", type: "text" },
          { id: "fi5p3", text: "What are you currently saving toward as a couple?", type: "text" },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Career & Income Goals",
        verse: "Commit to the LORD whatever you do, and he will establish your plans.",
        verseReference: "Proverbs 16:3",
        prompts: [
          { id: "fi6p1", text: "What are your income goals for the next 5 years?", type: "text" },
          { id: "fi6p2", text: "How should dual-income situations be managed  -  equal contribution or proportional?", type: "multiple_choice", options: ["Equal split always", "Proportional to income", "Whoever earns more covers more", "Discussed case by case"] },
          { id: "fi6p3", text: "What would you do if one partner needed to stop working for a season (illness, children, calling)?", type: "text" },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Contentment & Lifestyle",
        verse: "Godliness with contentment is great gain.",
        verseReference: "1 Timothy 6:6",
        prompts: [
          { id: "fi7p1", text: "Are you content with your current financial situation, or are you striving for more?", type: "text" },
          { id: "fi7p2", text: "How do you guard against lifestyle inflation as your income grows?", type: "text" },
          { id: "fi7p3", text: "What does a financially content and faith-filled life look like for you?", type: "text" },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Investing in the Future",
        verse: "A good person leaves an inheritance for their children's children.",
        verseReference: "Proverbs 13:22",
        prompts: [
          { id: "fi8p1", text: "Are you currently investing for retirement or long-term financial goals?", type: "yes_no" },
          { id: "fi8p2", text: "What legacy do you want to leave financially for your children or community?", type: "text" },
          { id: "fi8p3", text: "How can you start building wealth in a way that honors God and serves others?", type: "text" },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Financial Goals as a Couple",
        verse: "Where there is no vision, the people perish.",
        verseReference: "Proverbs 29:18",
        prompts: [
          { id: "fi9p1", text: "What are your top three shared financial goals as a couple?", type: "text" },
          { id: "fi9p2", text: "By when do you hope to achieve your most important financial milestone?", type: "text" },
          { id: "fi9p3", text: "How often should you review your financial goals and progress together?", type: "multiple_choice", options: ["Monthly", "Quarterly", "Twice a year", "Annually"] },
        ],
      },
      {
        category: "finance", language: "en", status: "active",
        title: "Kingdom Economics",
        verse: "Seek first his kingdom and his righteousness, and all these things will be given to you as well.",
        verseReference: "Matthew 6:33",
        prompts: [
          { id: "fi10p1", text: "How does putting God first practically change how you manage money?", type: "text" },
          { id: "fi10p2", text: "Have you ever experienced God's provision in an unexpected way? Share the story.", type: "text" },
          { id: "fi10p3", text: "What would it look like to run your household finances as if God were your CFO?", type: "text" },
        ],
      },
    ]);

    // ─── Bible Convictions ─────────────────────────────────────────────────
    await seedCategory("bible", [
      {
        category: "bible", language: "en", status: "active",
        title: "The Word as Your Foundation",
        verse: "Your word is a lamp for my feet, a light on my path.",
        verseReference: "Psalm 119:105",
        prompts: [
          { id: "bi1p1", text: "How regularly do you read the Bible, and what does that look like in your daily life?", type: "multiple_choice", options: ["Daily", "Several times a week", "Weekly", "Occasionally"] },
          { id: "bi1p2", text: "What book of the Bible has shaped your life most and why?", type: "text" },
          { id: "bi1p3", text: "How do you want the Bible to influence your relationship and future home?", type: "text" },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Studying Scripture Together",
        verse: "Let the word of Christ dwell in you richly as you teach and admonish one another with all wisdom.",
        verseReference: "Colossians 3:16",
        prompts: [
          { id: "bi2p1", text: "Have you ever studied the Bible together? What was that experience like?", type: "text" },
          { id: "bi2p2", text: "What format of Bible study works best for you as a couple?", type: "multiple_choice", options: ["Devotional book together", "Same chapter daily", "Bible app plan", "Church-based study", "We have not tried yet"] },
          { id: "bi2p3", text: "What topic would you most want to study from Scripture together right now?", type: "text" },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Convictions on Marriage",
        verse: "Husbands, love your wives, just as Christ loved the church and gave himself up for her.",
        verseReference: "Ephesians 5:25",
        prompts: [
          { id: "bi3p1", text: "What does Scripture teach about the roles of husband and wife, and how do you interpret it?", type: "text" },
          { id: "bi3p2", text: "How do you understand the concept of mutual submission in Ephesians 5?", type: "text" },
          { id: "bi3p3", text: "Which aspect of the biblical vision of marriage most excites and challenges you?", type: "text" },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Prayer Life & Spiritual Discipline",
        verse: "Pray continually.",
        verseReference: "1 Thessalonians 5:17",
        prompts: [
          { id: "bi4p1", text: "What does your personal prayer life look like right now?", type: "text" },
          { id: "bi4p2", text: "How comfortable are you praying out loud with your partner?", type: "scale", scaleMax: 5 },
          { id: "bi4p3", text: "What spiritual disciplines (fasting, journaling, silence, Scripture memory) do you practice?", type: "text" },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Church Commitment",
        verse: "Let us not give up meeting together, as some are in the habit of doing, but let us encourage one another.",
        verseReference: "Hebrews 10:25",
        prompts: [
          { id: "bi5p1", text: "How important is regular church attendance and community to you?", type: "scale", scaleMax: 5 },
          { id: "bi5p2", text: "What would your ideal local church look like?", type: "text" },
          { id: "bi5p3", text: "How will you handle it if you and your partner prefer different churches or worship styles?", type: "text" },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Faith & Doubt",
        verse: "I do believe; help me overcome my unbelief!",
        verseReference: "Mark 9:24",
        prompts: [
          { id: "bi6p1", text: "Have you ever experienced a season of serious doubt? How did you get through it?", type: "text" },
          { id: "bi6p2", text: "How do you want your partner to support you through spiritual valleys or doubts?", type: "text" },
          { id: "bi6p3", text: "What strengthens your faith most during hard seasons?", type: "multiple_select", options: ["Prayer", "Scripture", "Community", "Worship music", "Nature", "Testimony of others"] },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Serving & Calling",
        verse: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
        verseReference: "Ephesians 2:10",
        prompts: [
          { id: "bi7p1", text: "What do you believe God has uniquely called you to do with your life?", type: "text" },
          { id: "bi7p2", text: "How can your relationship multiply your impact for God's kingdom?", type: "text" },
          { id: "bi7p3", text: "What ministry or serving opportunity do you feel drawn to as a couple?", type: "text" },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Convictions on Moral Issues",
        verse: "Do not be conformed to this world, but be transformed by the renewal of your mind.",
        verseReference: "Romans 12:2",
        prompts: [
          { id: "bi8p1", text: "What are your strongest biblical convictions on a cultural or social issue, and how do you hold that conviction with grace?", type: "text" },
          { id: "bi8p2", text: "How do you approach engaging with people who hold different moral views?", type: "text" },
          { id: "bi8p3", text: "In what area do you feel your convictions have grown or changed in recent years?", type: "text" },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Passing Faith to the Next Generation",
        verse: "Train up a child in the way he should go; even when he is old he will not depart from it.",
        verseReference: "Proverbs 22:6",
        prompts: [
          { id: "bi9p1", text: "How do you plan to raise children in the faith?", type: "text" },
          { id: "bi9p2", text: "What faith traditions or practices from your upbringing do you want to continue?", type: "text" },
          { id: "bi9p3", text: "What would you do if your child grows up and walks away from faith?", type: "text" },
        ],
      },
      {
        category: "bible", language: "en", status: "active",
        title: "Living by Faith, Not Fear",
        verse: "For God has not given us a spirit of fear, but of power, love, and a sound mind.",
        verseReference: "2 Timothy 1:7",
        prompts: [
          { id: "bi10p1", text: "In what area of your life are you currently operating out of fear rather than faith?", type: "text" },
          { id: "bi10p2", text: "How can you and your partner encourage each other to take bold steps of faith?", type: "text" },
          { id: "bi10p3", text: "What is one step of faith God is calling your relationship to take right now?", type: "text" },
        ],
      },
    ]);

    // ─── Kids & Future ─────────────────────────────────────────────────────
    await seedCategory("kids-future", [
      {
        category: "kids-future", language: "en", status: "active",
        title: "Do We Want Children?",
        verse: "Children are a heritage from the LORD, offspring a reward from him.",
        verseReference: "Psalm 127:3",
        prompts: [
          { id: "kf1p1", text: "Do you want to have children, and if so, how many?", type: "multiple_choice", options: ["1 child", "2-3 children", "4+ children", "Not sure yet", "No children"] },
          { id: "kf1p2", text: "When in your relationship do you hope to have your first child?", type: "text" },
          { id: "kf1p3", text: "How do you feel about adoption or fostering as part of your family plan?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Parenting Philosophy",
        verse: "Fathers, do not exasperate your children; instead, bring them up in the training and instruction of the Lord.",
        verseReference: "Ephesians 6:4",
        prompts: [
          { id: "kf2p1", text: "How would you describe your parenting philosophy?", type: "multiple_choice", options: ["Authoritative (warm & structured)", "Gentle & permissive", "Faith-first", "Grace-based", "Still figuring it out"] },
          { id: "kf2p2", text: "How was discipline handled in your childhood home, and how will yours differ or be similar?", type: "text" },
          { id: "kf2p3", text: "What is the most important thing you want to teach your children?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Work & Family Balance With Kids",
        verse: "Whatever you do, work heartily, as for the Lord and not for men.",
        verseReference: "Colossians 3:23",
        prompts: [
          { id: "kf3p1", text: "After having children, do you expect both partners to continue working full-time?", type: "multiple_choice", options: ["Yes, both full-time", "One stays home", "Flexible, TBD", "Work from home solution"] },
          { id: "kf3p2", text: "How will childcare be handled  -  family, daycare, one parent at home?", type: "text" },
          { id: "kf3p3", text: "How will you protect your marriage relationship after children arrive?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Raising Children in Faith",
        verse: "Start children off on the way they should go, and even when they are old they will not turn from it.",
        verseReference: "Proverbs 22:6",
        prompts: [
          { id: "kf4p1", text: "What does raising children in Christian faith look like practically in your home?", type: "text" },
          { id: "kf4p2", text: "Will you have family devotions, bedtime prayers, or other faith practices?", type: "text" },
          { id: "kf4p3", text: "How will you allow your children to develop their own personal faith rather than just inheriting yours?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Education Choices",
        verse: "The heart of the discerning acquires knowledge, for the ears of the wise seek it out.",
        verseReference: "Proverbs 18:15",
        prompts: [
          { id: "kf5p1", text: "What type of education do you envision for your children?", type: "multiple_choice", options: ["Public school", "Private / Christian school", "Homeschooling", "A mix depending on the child", "Open to all options"] },
          { id: "kf5p2", text: "How important is a faith-based school environment to you?", type: "scale", scaleMax: 5 },
          { id: "kf5p3", text: "How will you be involved in your children's education beyond the classroom?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Long-Term Vision as a Family",
        verse: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
        verseReference: "Jeremiah 29:11",
        prompts: [
          { id: "kf6p1", text: "Describe your family life 15 years from now  -  what does it look like?", type: "text" },
          { id: "kf6p2", text: "What legacy do you want to leave for your children and grandchildren?", type: "text" },
          { id: "kf6p3", text: "What family traditions do you want to establish that your children will carry forward?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Health & Wellbeing of Children",
        verse: "Dear friend, I pray that you may enjoy good health and that all may go well with you.",
        verseReference: "3 John 1:2",
        prompts: [
          { id: "kf7p1", text: "What does holistic health (physical, emotional, spiritual) look like for children in your home?", type: "text" },
          { id: "kf7p2", text: "How will you address mental health and emotional wellbeing with your children?", type: "text" },
          { id: "kf7p3", text: "How will you navigate it if your child faces serious health challenges?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Cultural & Ethnic Identity",
        verse: "From one man he made all the nations, that they should inhabit the whole earth.",
        verseReference: "Acts 17:26",
        prompts: [
          { id: "kf8p1", text: "How important is it to pass your cultural heritage and language to your children?", type: "scale", scaleMax: 5 },
          { id: "kf8p2", text: "If you are from different cultural backgrounds, how will you honor both in your home?", type: "text" },
          { id: "kf8p3", text: "What specific cultural traditions or values do you want your children to know and keep?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Handling Infertility or Unexpected Outcomes",
        verse: "But those who hope in the LORD will renew their strength.",
        verseReference: "Isaiah 40:31",
        prompts: [
          { id: "kf9p1", text: "How would you emotionally and spiritually cope if having biological children was not possible?", type: "text" },
          { id: "kf9p2", text: "How do you feel about fertility treatments, surrogacy, or adoption as alternatives?", type: "text" },
          { id: "kf9p3", text: "How can your faith sustain you both through unexpected outcomes in family planning?", type: "text" },
        ],
      },
      {
        category: "kids-future", language: "en", status: "active",
        title: "Setting Goals for Your Future",
        verse: "The heart of man plans his way, but the LORD establishes his steps.",
        verseReference: "Proverbs 16:9",
        prompts: [
          { id: "kf10p1", text: "What are your biggest personal goals for the next 5 years?", type: "text" },
          { id: "kf10p2", text: "What shared goal as a couple excites you most right now?", type: "text" },
          { id: "kf10p3", text: "How do you keep God at the center of your future plans rather than just planning and asking for His blessing?", type: "text" },
        ],
      },
    ]);

    // ─── Family Relations ──────────────────────────────────────────────────
    await seedCategory("family", [
      {
        category: "family", language: "en", status: "active",
        title: "Leaving & Cleaving",
        verse: "That is why a man leaves his father and mother and is united to his wife, and they become one flesh.",
        verseReference: "Genesis 2:24",
        prompts: [
          { id: "fa1p1", text: "What does leaving your family of origin to build your own look like practically?", type: "text" },
          { id: "fa1p2", text: "Do you feel emotionally and relationally independent from your parents?", type: "scale", scaleMax: 5 },
          { id: "fa1p3", text: "Are there ways your family of origin currently has more influence on your decisions than your partner?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "In-Law Relationships",
        verse: "Honor your father and your mother, so that you may live long in the land.",
        verseReference: "Exodus 20:12",
        prompts: [
          { id: "fa2p1", text: "How do you currently relate to your partner's family, and what dynamics do you notice?", type: "text" },
          { id: "fa2p2", text: "How much involvement do you want from each family in your married life?", type: "multiple_choice", options: ["Very involved  -  extended family is everything", "Close but with clear boundaries", "Mostly independent", "Minimal involvement"] },
          { id: "fa2p3", text: "How will you handle it when your partner and your family members do not get along?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "Holidays & Family Traditions",
        verse: "In the fear of the LORD one has strong confidence, and his children will have a refuge.",
        verseReference: "Proverbs 14:26",
        prompts: [
          { id: "fa3p1", text: "How will you divide holidays between your families once you are married?", type: "multiple_choice", options: ["Alternate each year", "Split the day", "Create our own traditions", "Visit both"] },
          { id: "fa3p2", text: "Which family tradition from your childhood is most meaningful and non-negotiable to you?", type: "text" },
          { id: "fa3p3", text: "What new traditions do you want to start together as your own family?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "Conflict With Extended Family",
        verse: "If it is possible, as far as it depends on you, live at peace with everyone.",
        verseReference: "Romans 12:18",
        prompts: [
          { id: "fa4p1", text: "How do you handle conflict with family members, and what is your default approach?", type: "text" },
          { id: "fa4p2", text: "How will you protect your relationship when extended family creates tension or drama?", type: "text" },
          { id: "fa4p3", text: "What does peacekeeping without people-pleasing look like in family relationships?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "Caring for Aging Parents",
        verse: "But if a widow has children or grandchildren, these should learn first of all to put their religion into practice by caring for their own family.",
        verseReference: "1 Timothy 5:4",
        prompts: [
          { id: "fa5p1", text: "What are your expectations around caring for elderly parents as they age?", type: "text" },
          { id: "fa5p2", text: "Would you be open to a parent moving in with you if needed?", type: "yes_no" },
          { id: "fa5p3", text: "How will you balance your marriage and your responsibilities to aging parents?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "Siblings & Family Dynamics",
        verse: "How good and pleasant it is when God's people live together in unity!",
        verseReference: "Psalm 133:1",
        prompts: [
          { id: "fa6p1", text: "What role do your siblings play in your life, and how do you see that continuing?", type: "text" },
          { id: "fa6p2", text: "Are there family members whose influence on you has been unhealthy, and how are you navigating that?", type: "text" },
          { id: "fa6p3", text: "How do you want your partner to relate to your siblings and vice versa?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "Family Financial Requests",
        verse: "No one can serve two masters. Either you will hate the one and love the other.",
        verseReference: "Matthew 6:24",
        prompts: [
          { id: "fa7p1", text: "How do you handle financial requests or expectations from family members?", type: "text" },
          { id: "fa7p2", text: "Should financial gifts to family members be joint decisions?", type: "yes_no" },
          { id: "fa7p3", text: "What boundaries do you need to set around giving or lending money to family?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "Blended Family Considerations",
        verse: "I can do all this through him who gives me strength.",
        verseReference: "Philippians 4:13",
        prompts: [
          { id: "fa8p1", text: "If either partner has children from a previous relationship, what challenges do you anticipate?", type: "text" },
          { id: "fa8p2", text: "How will roles and authority work in a blended family situation?", type: "text" },
          { id: "fa8p3", text: "What does God's redemptive grace mean for blended families?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "Your Family's Spiritual Legacy",
        verse: "We will tell the next generation the praiseworthy deeds of the LORD, his power, and the wonders he has done.",
        verseReference: "Psalm 78:4",
        prompts: [
          { id: "fa9p1", text: "What is the spiritual legacy your family of origin passed on to you?", type: "text" },
          { id: "fa9p2", text: "What generational patterns of faith do you want to continue and strengthen?", type: "text" },
          { id: "fa9p3", text: "What generational wounds or broken patterns do you want God to heal and stop with your generation?", type: "text" },
        ],
      },
      {
        category: "family", language: "en", status: "active",
        title: "Building Your Own Identity as a Couple",
        verse: "So they are no longer two, but one flesh.",
        verseReference: "Matthew 19:6",
        prompts: [
          { id: "fa10p1", text: "What does it look like to function as a united couple when facing family pressure?", type: "text" },
          { id: "fa10p2", text: "How do you build loyalty to each other without dishonoring your families?", type: "text" },
          { id: "fa10p3", text: "What is one specific way you can show your family that your partner is your first human priority?", type: "text" },
        ],
      },
    ]);

    console.log("All Q&A categories seeded successfully.");
  } catch (error) {
    console.error("Failed to seed category questions:", error);
  }
}

setTimeout(() => seedAllCategoryQuestions(), 12000);

console.log('🚀 TwoBeOne API Server starting...');
console.log('📍 Base URL: /make-server-6d579fee');
console.log('🔑 Using KV Store for data persistence');
console.log('✅ All routes configured');
console.log('👥 Community features enabled');
console.log('🌍 Location tracking enabled');

Deno.serve(app.fetch);