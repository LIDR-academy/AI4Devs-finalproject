document.addEventListener('DOMContentLoaded', () => {
    // Attempt to extract token from URL params if accessed directly
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        const rsvpBtn = document.getElementById('rsvp-btn');
        if (rsvpBtn) {
            rsvpBtn.href = `/rsvp/${token}`;
        }
    }

    const addToCalendarBtn = document.getElementById('add-to-calendar-btn');
    if (addToCalendarBtn && window.eventData) {
        addToCalendarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const event = window.eventData;
            
            // Generate a simple Google Calendar link
            const title = encodeURIComponent(`${event.name}`);
            const location = encodeURIComponent(event.venue + ', ' + event.address);
            
            // Format dates (simplification)
            const d = new Date(event.date);
            const start = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
            const endD = new Date(d.getTime() + 4 * 60 * 60 * 1000); // assume 4 hours
            const end = endD.toISOString().replace(/-|:|\.\d\d\d/g, "");

            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}`;
            window.open(url, '_blank');
        });
    }
});
