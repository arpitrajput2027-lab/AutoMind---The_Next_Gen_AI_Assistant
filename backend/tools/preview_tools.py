# tools/preview_tools.py - Email & Document Preview

import tkinter as tk
from tkinter import messagebox
from tools.email import send_email_direct

class EmailPreviewDialog:
    """Email preview dialog with edit capability"""
    def __init__(self, to, subject, body):
        self.to = to
        self.subject = subject
        self.body = body
        self.send_confirmed = False
        
        self.root = tk.Tk()
        self.root.title("📧 Email Preview - VENOM AI")
        self.root.geometry("600x500")
        self.root.configure(bg="#1a1a2e")
        
        self.build_ui()
    
    def build_ui(self):
        """Build preview UI"""
        # Title
        tk.Label(
            self.root, 
            text="📧 Email Preview",
            font=("Segoe UI", 18, "bold"),
            bg="#1a1a2e",
            fg="#00d4ff"
        ).pack(pady=15)
        
        # To field
        tk.Label(self.root, text="To:", bg="#1a1a2e", fg="white", font=("Segoe UI", 11, "bold")).pack(anchor="w", padx=20)
        self.to_entry = tk.Entry(self.root, font=("Segoe UI", 11), width=50)
        self.to_entry.insert(0, self.to)
        self.to_entry.pack(padx=20, pady=5)
        
        # Subject field
        tk.Label(self.root, text="Subject:", bg="#1a1a2e", fg="white", font=("Segoe UI", 11, "bold")).pack(anchor="w", padx=20)
        self.subject_entry = tk.Entry(self.root, font=("Segoe UI", 11), width=50)
        self.subject_entry.insert(0, self.subject)
        self.subject_entry.pack(padx=20, pady=5)
        
        # Body field
        tk.Label(self.root, text="Body:", bg="#1a1a2e", fg="white", font=("Segoe UI", 11, "bold")).pack(anchor="w", padx=20)
        self.body_text = tk.Text(self.root, font=("Segoe UI", 10), height=12, width=60)
        self.body_text.insert("1.0", self.body)
        self.body_text.pack(padx=20, pady=5)
        
        # Buttons
        btn_frame = tk.Frame(self.root, bg="#1a1a2e")
        btn_frame.pack(pady=15)
        
        tk.Button(
            btn_frame,
            text="✅ Send Email",
            command=self.send,
            bg="#00ff88",
            fg="black",
            font=("Segoe UI", 11, "bold"),
            padx=20,
            pady=8
        ).pack(side="left", padx=10)
        
        tk.Button(
            btn_frame,
            text="❌ Cancel",
            command=self.cancel,
            bg="#ff4444",
            fg="white",
            font=("Segoe UI", 11, "bold"),
            padx=20,
            pady=8
        ).pack(side="left", padx=10)
    
    def send(self):
        """Send email"""
        self.to = self.to_entry.get()
        self.subject = self.subject_entry.get()
        self.body = self.body_text.get("1.0", "end-1c")
        self.send_confirmed = True
        self.root.destroy()
    
    def cancel(self):
        """Cancel sending"""
        self.send_confirmed = False
        self.root.destroy()
    
    def show(self):
        """Show dialog and return result"""
        self.root.mainloop()
        return self.send_confirmed, self.to, self.subject, self.body

def preview_and_send_email(to, subject, body):
    """Show preview dialog and send if confirmed"""
    dialog = EmailPreviewDialog(to, subject, body)
    confirmed, final_to, final_subject, final_body = dialog.show()
    
    if confirmed:
        result = send_email_direct(final_to, final_subject, final_body)
        return f"Email sent: {result}"
    else:
        return "Email sending cancelled"