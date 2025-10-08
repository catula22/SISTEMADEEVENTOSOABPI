import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user notifications
export const getUserNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 50;
    
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.unreadOnly) {
      query = query.filter(q => q.eq(q.field("read"), false));
    }

    return await query
      .order("desc")
      .take(limit);
  },
});

// Get unread notification count
export const getUnreadNotificationCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => 
        q.eq("userId", userId).eq("read", false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notificação não encontrada");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

// Mark all notifications as read
export const markAllNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => 
        q.eq("userId", userId).eq("read", false)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { read: true });
    }
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notificação não encontrada");
    }

    await ctx.db.delete(args.notificationId);
  },
});
