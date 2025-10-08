import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const storeUserSubscription = mutation({
  args: {
    subscription: v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if subscription already exists for this user
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("subscription.endpoint"), args.subscription.endpoint))
      .first();

    if (existing) {
      return; // Subscription already stored
    }

    await ctx.db.insert("pushSubscriptions", {
      userId,
      subscription: args.subscription,
    });
  },
});
