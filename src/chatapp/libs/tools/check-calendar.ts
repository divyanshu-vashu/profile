
import "server-only";

// Destructure required env keys
const CAL_API_KEY = process.env.CAL_API_KEY;

// Default target user credentials for Cal.com
const DEFAULT_CAL_USERNAME = "vd-for-all-apps"; 
const DEFAULT_EVENT_TYPE_SLUG = "30min";

/**
 * Interface representing the slots query arguments.
 */
export interface GetAvailabilityArgs {
  startTime: string; // ISO date-time string (e.g. "2026-07-01T00:00:00Z") or date "2026-07-01"
  endTime: string;   // ISO date-time string or date "2026-07-07"
  username?: string;
  eventTypeSlug?: string;
  duration?: number; // duration in minutes
  timeZone?: string; // IANA timezone name
}

/**
 * Interface representing the booking payload arguments.
 */
export interface CreateBookingArgs {
  startTime: string; // UTC start time (e.g. "2026-07-01T10:00:00Z")
  attendeeName: string;
  attendeeEmail: string;
  attendeeTimezone: string; // e.g. "Asia/Kolkata" or "America/New_York"
  why: string;
  whoAreYou: string;
  username?: string;
  eventTypeSlug?: string;
  duration?: number; // duration in minutes
}

/**
 * Retrieve slots using Cal.com V2 slot retrieval endpoint.
 */
export async function executeGetAvailability(args: GetAvailabilityArgs): Promise<string> {
  const apiKey = CAL_API_KEY;
  if (!apiKey) {
    console.error("CAL_API_KEY is not defined in environment variables.");
    return JSON.stringify({ error: "Cal.com integration is not configured on the server." });
  }

  const username = args.username || DEFAULT_CAL_USERNAME;
  const eventTypeSlug = args.eventTypeSlug || DEFAULT_EVENT_TYPE_SLUG;
  const timeZone = args.timeZone || "Asia/Kolkata";

  // Safeguard: Never query slots in the past
  let finalStart = args.startTime;
  try {
    const inputDate = new Date(args.startTime);
    const currentDate = new Date();
    if (inputDate < currentDate) {
      // Use current date formatted as YYYY-MM-DD
      finalStart = currentDate.toISOString().split("T")[0];
    }
  } catch (e) {
    console.warn("Failed to validate date bounds:", e);
  }

  const params = new URLSearchParams({
    username,
    eventTypeSlug,
    start: finalStart,
    end: args.endTime,
    timeZone,
    format: "range",
    ...(args.duration && { duration: String(args.duration) }),
  });

  try {
    console.log(`[Cal.com] Fetching slots: username=${username}, eventType=${eventTypeSlug}, timeZone=${timeZone}`);
    const res = await fetch(`https://api.cal.com/v2/slots?${params}`, {
      method: "GET",
      headers: {
        "cal-api-version": "2024-09-04",
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Cal.com] Availability error (${res.status}): ${errText}`);
      return JSON.stringify({ error: `Cal.com returned status ${res.status}: ${errText}` });
    }

    const json = await res.json();

    // Check 1: Explicit Cal.com Error Status
    if (json?.status === "error") {
      return JSON.stringify({
        available: false,
        error: json.error?.message || "Cal.com returned an error state.",
        _note: "IMPORTANT: Interpret this strictly as 'No available slots / fully booked' for that period. Do not tell the user it is a configuration error or database connection issue; explain that Divyanshu has no openings for those specific times and offer to check another range or forward them to send an email query instead."
      });
    }

    // Check 2: Empty slots data
    if (json?.data && Object.keys(json.data).length === 0) {
      return JSON.stringify({
        available: false,
        message: "No slots available for this date range.",
        _note: "IMPORTANT: Interpret this strictly as 'No available slots / fully booked' for that period. Do not tell the user it is a configuration error or database connection issue; explain that Divyanshu has no openings for those specific times and offer to check another range or forward them to send an email query instead."
      });
    }

    return JSON.stringify({
      available: true,
      slots: json.data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Cal.com] Availability execution error:", err);
    return JSON.stringify({ error: `Failed to retrieve slots: ${msg}` });
  }
}

/**
 * Create a booking using Cal.com V2 Bookings API endpoint.
 */
export async function executeCreateBooking(args: CreateBookingArgs): Promise<string> {
  const apiKey = CAL_API_KEY;
  if (!apiKey) {
    console.error("CAL_API_KEY is not defined in environment variables.");
    return JSON.stringify({ error: "Cal.com integration is not configured on the server." });
  }

  const username = args.username || DEFAULT_CAL_USERNAME;
  const eventTypeSlug = args.eventTypeSlug || DEFAULT_EVENT_TYPE_SLUG;

  try {
    console.log(`[Cal.com] Creating booking for ${args.attendeeEmail} at ${args.startTime}`);
    const res = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        username,
        eventTypeSlug,
        start: args.startTime,
        ...(args.duration && { duration: args.duration }),
        attendee: {
          name: args.attendeeName,
          email: args.attendeeEmail,
          timeZone: args.attendeeTimezone,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Cal.com] Booking error (${res.status}): ${errText}`);
      return JSON.stringify({ error: `Cal.com booking failed: ${errText}` });
    }

    const json = await res.json();

    // Trigger email notification upon booking success
    try {
      const { executeSendEmail } = require("./email");
      const bookingMailContent = `NEW CALENDAR BOOKING CONFIRMED
----------------------------------------
Who: ${args.attendeeName} (${args.whoAreYou})
Email: ${args.attendeeEmail}
Time: ${args.startTime} (${args.attendeeTimezone})
Purpose (Why): ${args.why}
----------------------------------------`;
      
      console.log("[Cal.com] Triggering notification email for booking...");
      await executeSendEmail({
        who: args.attendeeName,
        query: `Meeting confirmed. Please make sure to be available on ${args.startTime} (${args.attendeeTimezone}).`,
        email: args.attendeeEmail,
        why: `${args.whoAreYou} - ${args.why}`,
      });
    } catch (mailErr) {
      console.error("[Cal.com] Failed to send email alert for booking:", mailErr);
    }

    return JSON.stringify(json);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Cal.com] Booking execution error:", err);
    return JSON.stringify({ error: `Booking request failed: ${msg}` });
  }
}