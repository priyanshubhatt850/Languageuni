import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, courseName, startTime, duration } = await req.json();

    // Get OAuth token for Google Calendar
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (duration || 60) * 60 * 1000);

    // Create Google Calendar event with Meet
    const event = {
      summary: `${courseName || 'Language'} Class`,
      description: `Live class session`,
      start: {
        dateTime: start.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: sessionId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${error}`);
    }

    const calendarEvent = await response.json();
    const meetLink = calendarEvent.conferenceData?.entryPoints?.[0]?.uri;

    if (!meetLink) {
      throw new Error('Failed to create Google Meet link');
    }

    return Response.json({ 
      success: true,
      meetLink,
      message: 'Google Meet link created successfully'
    });

  } catch (error) {
    console.error('Error creating meet link:', error);
    return Response.json({ 
      error: error.message || 'Failed to create meet link' 
    }, { status: 500 });
  }
});