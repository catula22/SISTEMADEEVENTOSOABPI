"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import webpush from "web-push";

if (
  !process.env.VAPID_PUBLIC_KEY ||
  !process.env.VAPID_PRIVATE_KEY ||
  !process.env.WEB_PUSH_EMAIL
) {
  console.warn("VAPID keys not configured, push notifications will not work.");
} else {
  webpush.setVapidDetails(
    `mailto:${process.env.WEB_PUSH_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const sendPushNotification = internalAction({
  args: {
    subscription: v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
      }),
    }),
    payload: v.any(),
  },
  handler: async (ctx, { subscription, payload }) => {
    if (!process.env.VAPID_PUBLIC_KEY) {
      console.warn("VAPID_PUBLIC_KEY not set, skipping push notification");
      return;
    }
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error: any) {
      console.error("Error sending push notification:", error);
      // Handle subscription expiration (e.g., status code 410)
      if (error.statusCode === 410) {
        // TODO: Implement logic to remove expired subscription from the database
        console.log("Subscription expired, should be removed.");
      }
    }
  },
});
