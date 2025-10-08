import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

function timeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB;
}

const locationsWithConflictCheck = ["Auditório ESA", "Auditório OAB"];

// Get all events (public view)
export const getAllEvents = query({
  args: {
    month: v.optional(v.string()), // YYYY-MM format
    sector: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let events;
    if (args.sector && args.sector !== "TODOS") {
      events = await ctx.db
        .query("events")
        .withIndex("by_sector", (q) => q.eq("sector", args.sector!))
        .collect();
    } else {
      events = await ctx.db.query("events").collect();
    }

    // Filter by month if provided
    let filteredEvents = events;
    if (args.month) {
      filteredEvents = events.filter(event => 
        event.date.startsWith(args.month!)
      );
    }

    return filteredEvents;
  },
});

// Get current user's events (for editing)
export const getUserEvents = query({
  args: {
    month: v.optional(v.string()), // YYYY-MM format
    sector: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let events;
    if (args.sector && args.sector !== "TODOS") {
      events = await ctx.db
        .query("events")
        .withIndex("by_user_and_sector", (q) =>
          q.eq("userId", userId).eq("sector", args.sector!)
        )
        .collect();
    } else {
      events = await ctx.db
        .query("events")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    }

    // Filter by month if provided
    let filteredEvents = events;
    if (args.month) {
      filteredEvents = events.filter((event) =>
        event.date.startsWith(args.month!)
      );
    }

    return filteredEvents;
  },
});

// Create new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    sector: v.string(),
    location: v.optional(v.string()),
    originalText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuário não encontrado");

    // Check for duplicate events in specific locations
    if (args.location && locationsWithConflictCheck.includes(args.location)) {
      const existingEvents = await ctx.db
        .query("events")
        .withIndex("by_date_and_location", (q) =>
          q.eq("date", args.date).eq("location", args.location)
        )
        .collect();

      for (const existingEvent of existingEvents) {
        if (
          existingEvent.startTime &&
          existingEvent.endTime &&
          timeOverlap(
            args.startTime,
            args.endTime,
            existingEvent.startTime,
            existingEvent.endTime
          )
        ) {
          throw new Error(
            `ERRO POSSÍVEL CHOQUE DE AGENDA VERIFIQUE O DIA E HORÁRIO DO EVENTO`
          );
        }
      }
    }

    const eventId = await ctx.db.insert("events", {
      ...args,
      time: args.startTime, // Keep old field for backward compatibility
      userId,
      notificationSent: false,
    });

    // Create activity log
    await ctx.scheduler.runAfter(0, internal.activityLogs.createActivityLog, {
      action: "created",
      entityType: "event",
      entityId: eventId,
      userId,
      userName: user.name || user.email || "Usuário",
      userEmail: user.email || "",
      details: {
        eventTitle: args.title,
        eventDate: args.date,
        eventStartTime: args.startTime,
        eventEndTime: args.endTime,
        sector: args.sector,
      },
    });

    return eventId;
  },
});

// Update event
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    sector: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const { id, ...updates } = args;
    const event = await ctx.db.get(id);
    
    if (!event || event.userId !== userId) {
      throw new Error("Evento não encontrado ou sem permissão");
    }

    const newValues = { ...event, ...updates };

    // Check for duplicate events in specific locations
    if (newValues.location && locationsWithConflictCheck.includes(newValues.location) && newValues.startTime && newValues.endTime) {
      const existingEvents = await ctx.db
        .query("events")
        .withIndex("by_date_and_location", q => q.eq("date", newValues.date).eq("location", newValues.location))
        .collect();

      for (const existingEvent of existingEvents) {
        if (
          existingEvent._id !== id &&
          existingEvent.startTime &&
          existingEvent.endTime &&
          timeOverlap(
            newValues.startTime,
            newValues.endTime,
            existingEvent.startTime,
            existingEvent.endTime
          )
        ) {
          throw new Error(
            `ERRO POSSÍVEL CHOQUE DE AGENDA VERIFIQUE O DIA E HORÁRIO DO EVENTO`
          );
        }
      }
    }

    // Store original values for change tracking
    const originalEvent = { ...event };
    
    // Update both new and old time fields for backward compatibility
    const patchData: any = { ...updates };
    if (updates.startTime) {
      patchData.time = updates.startTime;
    }
    
    await ctx.db.patch(id, patchData);

    // Get updated event
    const updatedEvent = await ctx.db.get(id);
    if (!updatedEvent) throw new Error("Erro ao atualizar evento");

    // Create activity log with changes
    const changes = {
      before: {
        title: originalEvent.title,
        description: originalEvent.description,
        date: originalEvent.date,
        startTime: originalEvent.startTime || originalEvent.time,
        endTime: originalEvent.endTime,
        sector: originalEvent.sector,
        location: originalEvent.location,
      },
      after: {
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: updatedEvent.date,
        startTime: updatedEvent.startTime || updatedEvent.time,
        endTime: updatedEvent.endTime,
        sector: updatedEvent.sector,
        location: updatedEvent.location,
      },
    };

    await ctx.scheduler.runAfter(0, internal.activityLogs.createActivityLog, {
      action: "updated",
      entityType: "event",
      entityId: id,
      userId,
      userName: user.name || user.email || "Usuário",
      userEmail: user.email || "",
      details: {
        eventTitle: updatedEvent.title,
        eventDate: updatedEvent.date,
        eventStartTime: updatedEvent.startTime || updatedEvent.time,
        eventEndTime: updatedEvent.endTime,
        eventTime: updatedEvent.time, // Keep old field for backward compatibility
        sector: updatedEvent.sector,
        changes,
      },
    });

    return id;
  },
});

// Delete event
export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) {
      throw new Error("Evento não encontrado ou sem permissão");
    }

    // Store event details before deletion
    const eventDetails = {
      eventTitle: event.title,
      eventDate: event.date,
      eventStartTime: event.startTime || event.time,
      eventEndTime: event.endTime,
      eventTime: event.time, // Keep old field for backward compatibility
      sector: event.sector,
    };

    await ctx.db.delete(args.id);

    // Create activity log
    await ctx.scheduler.runAfter(0, internal.activityLogs.createActivityLog, {
      action: "deleted",
      entityType: "event",
      entityId: undefined, // Event no longer exists
      userId,
      userName: user.name || user.email || "Usuário",
      userEmail: user.email || "",
      details: eventDetails,
    });
  },
});

// Get events for a specific date (public)
export const getEventsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    return events.sort((a, b) => {
      const timeA = a.startTime || a.time || '00:00';
      const timeB = b.startTime || b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  },
});

// Parse text and create multiple events
export const parseAndCreateEvents = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Usuário não autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuário não encontrado");

    const events = parseEventsFromText(args.text);
    const createdEvents = [];

    for (const event of events) {
      const eventId = await ctx.db.insert("events", {
        ...event,
        userId,
        notificationSent: false,
        originalText: args.text,
      });
      createdEvents.push(eventId);

      // Create activity log for each event
      await ctx.scheduler.runAfter(0, internal.activityLogs.createActivityLog, {
        action: "created",
        entityType: "event",
        entityId: eventId,
        userId,
        userName: user.name || user.email || "Usuário",
        userEmail: user.email || "",
        details: {
          eventTitle: event.title,
          eventDate: event.date,
          eventStartTime: event.startTime,
          eventEndTime: event.endTime,
          sector: event.sector,
        },
      });
    }

    return createdEvents;
  },
});

// Helper function to parse events from text
function parseEventsFromText(text: string) {
  const events = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  const sectorKeywords = {
    'COMISSÕES': ['comissão', 'comissões', 'reunião'],
    'ESA PIAUÍ': ['esa', 'escola', 'curso', 'palestra', 'aula'],
    'DCE': ['dce', 'direitos', 'consumidor'],
    'IMPRENSA': ['imprensa', 'ceja', 'jovem', 'advocacia'],
    'PODCAST': ['podcast', 'gravação', 'entrevista'],
    'DEMANDAS EXTERNAS': ['prerrogativa', 'prerrogativas', 'defesa', 'advocacia', 'direitos do advogado', 'demanda externa', 'reunião externa'],
    'PRESIDÊNCIA': ['presidência', 'presidente', 'diretoria']
  };

  for (const line of lines) {
    const event = parseEventFromLine(line, sectorKeywords);
    if (event) {
      events.push(event);
    }
  }

  return events;
}


export const getEventById = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    return event;
  },
});

function parseEventFromLine(line: string, sectorKeywords: Record<string, string[]>) {

  // Extract date patterns (DD/MM/YYYY, DD/MM, DD-MM-YYYY, etc.)
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{1,2})[\/\-](\d{1,2})/,
  ];

  // Extract time patterns (HH:MM, HH:MM:SS, HHh, etc.)
  const timePatterns = [
    /(\d{1,2}):(\d{2})/,
    /(\d{1,2})h(\d{2})?/,
    /(\d{1,2})\s*horas?/,
  ];

  let date = '';
  let startTime = '09:00'; // Default start time
  let endTime = '10:00'; // Default end time (1 hour duration)
  let title = line;
  let sector = 'COMISSÕES'; // Default sector

  // Extract date
  for (const pattern of datePatterns) {
    const match = line.match(pattern);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3] || new Date().getFullYear().toString();
      date = `${year}-${month}-${day}`;
      title = title.replace(match[0], '').trim();
      break;
    }
  }

  // Extract time
  for (const pattern of timePatterns) {
    const match = line.match(pattern);
    if (match) {
      const hour = match[1].padStart(2, '0');
      const minute = (match[2] || '00').padStart(2, '0');
      startTime = `${hour}:${minute}`;
      
      // Calculate end time (add 1 hour by default)
      const startHour = parseInt(hour);
      const endHour = startHour + 1;
      endTime = `${endHour.toString().padStart(2, '0')}:${minute}`;
      
      title = title.replace(match[0], '').trim();
      break;
    }
  }

  // Determine sector based on keywords
  const lowerLine = line.toLowerCase();
  for (const [sectorName, keywords] of Object.entries(sectorKeywords)) {
    if (keywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
      sector = sectorName;
      break;
    }
  }

  // Only create event if we have a date
  if (date && title.trim()) {
    return {
      title: title.trim(),
      date,
      startTime,
      endTime,
      sector,
      description: '',
      location: '',
    };
  }

  return null;
}

// Get notification sound URL from storage
export const getNotificationSoundUrl = query({
  args: {},
  handler: async (ctx) => {
    // The sound file ID from the database
    const soundFileId = "kg274dkgjj91k7zy9ncnb9nvm97rmtt6";
    
    try {
      // Get the signed URL for the sound file
      const soundUrl = await ctx.storage.getUrl(soundFileId as any);
      return soundUrl;
    } catch (error) {
      console.warn("Failed to get notification sound URL:", error);
      return null;
    }
  },
});
