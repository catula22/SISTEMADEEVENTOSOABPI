import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";

// Get activity logs with pagination
export const getActivityLogs = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
        return {
            page: [],
            isDone: true,
            continueCursor: "",
        };
    }

    const result = await ctx.db
      .query("activityLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .paginate(args.paginationOpts);
    
    return result;
  },
});

// Get public activity logs with pagination
export const getPublicActivityLogs = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("activityLogs")
            .withIndex("by_timestamp")
            .order("desc")
            .paginate(args.paginationOpts);
    },
});


// Get activity logs for a specific event
export const getEventActivityLogs = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("activityLogs")
      .withIndex("by_entity", (q) => 
        q.eq("entityType", "event").eq("entityId", args.eventId)
      )
      .order("desc")
      .collect();
  },
});

// Internal function to create activity log
export const createActivityLog = internalMutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.id("events")),
    userId: v.id("users"),
    userName: v.string(),
    userEmail: v.string(),
    details: v.object({
      eventTitle: v.string(),
      eventDate: v.string(),
      eventStartTime: v.optional(v.string()),
      eventEndTime: v.optional(v.string()),
      eventTime: v.optional(v.string()), // Keep old field for backward compatibility
      sector: v.string(),
      changes: v.optional(v.object({
        before: v.optional(v.any()),
        after: v.optional(v.any()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    
    const logId = await ctx.db.insert("activityLogs", {
      ...args,
      timestamp,
    });

    // Create notifications for all users (except the one who made the change)
    const allUsers = await ctx.db.query("users").collect();
    
    for (const user of allUsers) {
      if (user._id !== args.userId) {
        const notificationTitle = getNotificationTitle(args.action, args.details.eventTitle);
        const notificationMessage = getNotificationMessage(
          args.action, 
          args.userName, 
          args.details.eventTitle,
          args.details.eventDate,
          args.details.eventStartTime,
          args.details.eventEndTime
        );

        await ctx.db.insert("notifications", {
          userId: user._id,
          type: `event_${args.action}`,
          title: notificationTitle,
          message: notificationMessage,
          read: false,
          activityLogId: logId,
          timestamp,
        });

        // Send push notification
        const subscriptions = await ctx.db
          .query("pushSubscriptions")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect();

        const payload = {
          title: notificationTitle,
          body: notificationMessage,
          icon: "/og-preview.png",
          sound: "/sounds/bell.mp3",
        };

        for (const sub of subscriptions) {
          await ctx.scheduler.runAfter(0, internal.push.sendPushNotification, {
            subscription: sub.subscription,
            payload,
          });
        }
      }
    }

    return logId;
  },
});

function getNotificationTitle(action: string, eventTitle: string): string {
  switch (action) {
    case "created":
      return "Novo evento criado";
    case "updated":
      return "Evento atualizado";
    case "deleted":
      return "Evento excluído";
    default:
      return "Atividade no evento";
  }
}

function getNotificationMessage(
  action: string, 
  userName: string, 
  eventTitle: string,
  eventDate: string,
  eventStartTime?: string,
  eventEndTime?: string
): string {
  const formattedDate = new Date(eventDate + 'T00:00:00').toLocaleDateString('pt-BR');
  
  const timeInfo = eventStartTime && eventEndTime 
    ? `das ${eventStartTime} às ${eventEndTime}`
    : eventStartTime 
    ? `às ${eventStartTime}`
    : '';
  
  switch (action) {
    case "created":
      return `${userName} criou o evento "${eventTitle}" para ${formattedDate} ${timeInfo}`.trim();
    case "updated":
      return `${userName} atualizou o evento "${eventTitle}" (${formattedDate} ${timeInfo})`.trim();
    case "deleted":
      return `${userName} excluiu o evento "${eventTitle}" que estava marcado para ${formattedDate} ${timeInfo}`.trim();
    default:
      return `${userName} fez alterações no evento "${eventTitle}"`;
  }
}
