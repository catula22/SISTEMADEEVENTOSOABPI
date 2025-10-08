/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activityLogs from "../activityLogs.js";
import type * as auth from "../auth.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as push from "../push.js";
import type * as reports from "../reports.js";
import type * as router from "../router.js";
import type * as sectors from "../sectors.js";
import type * as subscriptions from "../subscriptions.js";
import type * as testing from "../testing.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  auth: typeof auth;
  events: typeof events;
  http: typeof http;
  notifications: typeof notifications;
  push: typeof push;
  reports: typeof reports;
  router: typeof router;
  sectors: typeof sectors;
  subscriptions: typeof subscriptions;
  testing: typeof testing;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
