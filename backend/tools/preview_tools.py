# tools/preview_tools.py - Email & Document Preview

import json

class EmailPreviewException(Exception):
    def __init__(self, to, subject, body):
        self.to = to
        self.subject = subject
        self.body = body
        super().__init__("Email Preview Requested")

def preview_and_send_email(to, subject, body):
    """
    Raises an exception to be caught by the server, 
    so the preview can be sent via WebSocket to the frontend.
    """
    raise EmailPreviewException(to, subject, body)