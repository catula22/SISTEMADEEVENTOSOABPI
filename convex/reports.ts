import { query } from "./_generated/server";
import { v } from "convex/values";

export const generateSectorReport = query({
  args: {
    month: v.optional(v.string()), // YYYY-MM format
  },
  handler: async (ctx, args) => {
    const allEvents = await ctx.db.query("events").collect();

    const events = args.month
      ? allEvents.filter(event => event.date.startsWith(args.month!))
      : allEvents;

    const report = events.reduce((acc, event) => {
      const sector = event.sector;
      if (!acc[sector]) {
        acc[sector] = 0;
      }
      acc[sector]++;
      return acc;
    }, {} as Record<string, number>);

    const formattedReport = Object.entries(report).map(([sectorName, eventCount]) => ({
      sectorName,
      eventCount,
    }));

    formattedReport.sort((a, b) => b.eventCount - a.eventCount);

    return formattedReport;
  },
});
