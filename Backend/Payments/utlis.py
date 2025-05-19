import os
import qrcode
import requests
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from reportlab.lib.pagesizes import A4,A5
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Image, Spacer, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from django.conf import settings


class TicketPDFGenerator:
    def __init__(self, ticket):
        self.ticket = ticket
        self.poster_url = ticket.movie.poster
        self.output_buffer = BytesIO()
        self.poster_image = None
        self.qr_code = None

    def download_poster(self):
        response = requests.get(self.poster_url, verify=False)
        if response.status_code == 200:
            self.poster_image = BytesIO(response.content)
        else:
            raise Exception(f"Failed to download poster for {self.ticket.movie.title}")

    def generate_qr_code(self):
        qr = qrcode.make(self.ticket.verify_code)
        self.qr_code = BytesIO()
        qr.save(self.qr_code)
        self.qr_code.seek(0)

    def generate_pdf(self):
        doc = SimpleDocTemplate(self.output_buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        poster = Image(self.poster_image, width=150, height=220)
        qr_img = Image(self.qr_code, width=100, height=100)

        details = [
            ["Process ID:", self.ticket.booking.id],
            ["Username:", self.ticket.booking.user.username],
            ["Movie:", self.ticket.movie.title],
            ["Ticket No.:", self.ticket.id],
            ["Seat:", self.ticket.seat_number],
            ["Hall:", self.ticket.cinema_hall.name],
            ["Location:", self.ticket.cinema_hall.location],
            ["Showtime:", self.ticket.showtime.starts_at],
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

    def save_to_storage(self):
        filename = f"tickets/{self.ticket.movie.title}.pdf"
        self.output_buffer.seek(0)
        saved_path = default_storage.save(filename, ContentFile(self.output_buffer.read()))
        return default_storage.url(saved_path)

    def build(self):
        self.download_poster()
        self.generate_qr_code()
        self.generate_pdf()
        return self.save_to_storage()
