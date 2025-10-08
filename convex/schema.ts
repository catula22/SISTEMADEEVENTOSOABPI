import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(), // ISO date string
    startTime: v.optional(v.string()), // HH:MM format - optional for backward compatibility
    endTime: v.optional(v.string()), // HH:MM format - optional for backward compatibility
    time: v.optional(v.string()), // Keep old field for backward compatibility
    sector: v.string(),
    location: v.optional(v.string()),
    userId: v.id("users"),
    notificationSent: v.optional(v.boolean()),
    originalText: v.optional(v.string()), // Store original parsed text
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_sector", ["sector"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_sector", ["userId", "sector"])
    .index("by_date_and_location", ["date", "location"]),

  sectors: defineTable({
    name: v.string(),
    color: v.string(),
    description: v.optional(v.string()),
  }),

  activityLogs: defineTable({
    action: v.string(), // "created", "updated", "deleted"
    entityType: v.string(), // "event"
    entityId: v.optional(v.id("events")), // null for deleted events
    userId: v.id("users"),
    userName: v.string(),
    userEmail: v.string(),
    details: v.object({
      eventTitle: v.string(),
      eventDate: v.string(),
      eventStartTime: v.optional(v.string()), // Optional for backward compatibility
      eventEndTime: v.optional(v.string()), // Optional for backward compatibility
      eventTime: v.optional(v.string()), // Keep old field for backward compatibility
      sector: v.string(),
      changes: v.optional(v.object({
        before: v.optional(v.any()),
        after: v.optional(v.any()),
      })),
    }),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "event_created", "event_updated", "event_deleted"
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    activityLogId: v.id("activityLogs"),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"])
    .index("by_timestamp", ["timestamp"]),
  
  pushSubscriptions: defineTable({
    userId: v.id("users"),
    subscription: v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
      }),
    }),
  }).index("by_userId", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
