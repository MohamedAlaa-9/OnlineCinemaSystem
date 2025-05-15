import os
import requests
import qrcode
import uuid
from io import BytesIO
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Image, Spacer, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


class TicketPDFGenerator:
    def __init__(self, ticket, poster_url):
        self.ticket = ticket
        self.poster_url = poster_url
        self.qr_code = None
        self.poster_image = None
        self.output_buffer = BytesIO()

    def download_poster(self):
        response = requests.get(self.poster_url)
        if response.status_code == 200:
            self.poster_image = BytesIO(response.content)
        else:
            raise Exception("Failed to download movie poster")

    def generate_qr_code(self):
        qr = qrcode.make(self.ticket.verify_code)
        self.qr_code = BytesIO()
        qr.save(self.qr_code)
        self.qr_code.seek(0)

    def generate_pdf(self):
        doc = SimpleDocTemplate(self.output_buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        # Poster image
        poster = Image(self.poster_image, width=150, height=220)

        # QR code
        qr_img = Image(self.qr_code, width=100, height=100)

        # Ticket details
        details = [
            ["Process ID:", self.ticket.booking.process_id],
            ["Username:", self.ticket.booking.user.username],
            ["Movie:", self.ticket.movie.title],
            ["Ticket No.:", self.ticket.id],
            ["Seat:", self.ticket.seat],
            ["Hall:", self.ticket.hall.name],
            ["Location:", self.ticket.hall.location],
            ["Showtime:", self.ticket.showtime.strftime("%Y-%m-%d %H:%M")],
            ["Verification Code:", self.ticket.verify_code]
        ]
        table = Table(details)
        table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ]))

        layout = Table([[poster, table, qr_img]], colWidths=[160, 240, 100])
        story.append(layout)
        story.append(Spacer(1, 12))
        story.append(Paragraph("*" * 90, styles['Normal']))
        doc.build(story)

        return self.output_buffer

    def save_to_storage(self):
        filename = f"tickets/{self.ticket.verify_code}.pdf"
        self.output_buffer.seek(0)
        path = default_storage.save(filename, ContentFile(self.output_buffer.read()))
        return default_storage.url(path)

    def build(self):
        self.download_poster()
        self.generate_qr_code()
        self.generate_pdf()
        return self.save_to_storage()
