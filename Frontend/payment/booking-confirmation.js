        // Get booking details from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Update confirmation details
        document.getElementById('confirmMovie').textContent = urlParams.get('movie') || 'Avengers: Endgame';
        
        // Format date
        const dateParam = urlParams.get('date') || '2023-05-20';
        const dateObj = new Date(dateParam);
        const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('confirmDate').textContent = formattedDate;
        
        document.getElementById('confirmTime').textContent = urlParams.get('time') || '10:00 AM';
        
        // Get number of tickets
        const tickets = parseInt(urlParams.get('tickets') || '2');
        document.getElementById('confirmTickets').textContent = tickets;
        
        // Generate random seats
        const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        let seats = [];
        
        const randomRow = seatRows[Math.floor(Math.random() * seatRows.length)];
        const startSeat = Math.floor(Math.random() * 10) + 1;
        
        for (let i = 0; i < tickets; i++) {
            seats.push(`${randomRow}${startSeat + i}`);
        }
        
        document.getElementById('confirmSeats').textContent = seats.join(', ');
        
        // Calculate total (fixed price of $12 per ticket)
        const total = tickets * 12;
        document.getElementById('confirmTotal').textContent = `$${total.toFixed(2)}`;
        
        // Generate booking ID
        const today = new Date();
        const dateString = today.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        document.getElementById('bookingId').textContent = `CP-${dateString}-${randomNum}`;