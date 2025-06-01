document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = 'http://127.0.0.1:8000/api/stripe/ticket_download';
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const bookingId = params.get('booking_id');
    
    const statusMessage = document.getElementById('statusMessage');
    const downloadLinksContainer = document.getElementById('downloadLinks');

    if (!sessionId || !bookingId) {
        statusMessage.classList.replace('alert-info', 'alert-danger');
        statusMessage.textContent = 'Invalid download request. Missing session or booking ID.';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${bookingId}?session_id=${sessionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const data = await res.json();

        if (!res.ok) {
            statusMessage.classList.replace('alert-info', 'alert-danger');
            statusMessage.textContent = data.error || 'Failed to retrieve your tickets.';
            return;
        }

        statusMessage.classList.replace('alert-info', 'alert-success');
        statusMessage.textContent = data.message;

        // Create download links
        data.download_links.forEach((url, index) => {
            const link = document.createElement('a');
            link.href = url;
            link.className = 'btn btn-primary m-2';
            link.download = `ticket_${index + 1}.pdf`;
            link.textContent = `Download Ticket ${index + 1}`;
            downloadLinksContainer.appendChild(link);
        });

    } catch (err) {
        statusMessage.classList.replace('alert-info', 'alert-danger');
        statusMessage.textContent = 'Something went wrong: ' + err.message;
    }
});
