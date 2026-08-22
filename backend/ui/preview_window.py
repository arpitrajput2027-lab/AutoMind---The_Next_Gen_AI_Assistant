# ui/preview_window.py - Preview Dialogs

import customtkinter as ctk

class ModernPreviewDialog(ctk.CTkToplevel):
    """Base class for preview dialogs"""
    def __init__(self, parent, title="Preview"):
        super().__init__(parent)
        
        self.title(title)
        self.geometry("700x600")
        self.configure(fg_color="#0a0e1a")
        
        # Make modal
        self.transient(parent)
        self.grab_set()
        
        self.confirmed = False
    
    def add_header(self, text, icon="📋"):
        """Add header section"""
        header = ctk.CTkFrame(self, fg_color="#12182b", corner_radius=15, height=80)
        header.pack(fill="x", padx=20, pady=20)
        
        ctk.CTkLabel(
            header,
            text=f"{icon} {text}",
            font=("SF Pro Display", 24, "bold"),
            text_color="#00d4ff"
        ).pack(pady=20)
    
    def add_buttons(self, confirm_text="Confirm", cancel_text="Cancel"):
        """Add action buttons"""
        btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        btn_frame.pack(pady=20)
        
        ctk.CTkButton(
            btn_frame,
            text=f"✅ {confirm_text}",
            command=self.confirm,
            fg_color="#00ff88",
            hover_color="#00cc66",
            text_color="black",
            font=("SF Pro Display", 13, "bold"),
            width=150,
            height=45
        ).pack(side="left", padx=10)
        
        ctk.CTkButton(
            btn_frame,
            text=f"❌ {cancel_text}",
            command=self.cancel,
            fg_color="#ff4444",
            hover_color="#cc0000",
            font=("SF Pro Display", 13, "bold"),
            width=150,
            height=45
        ).pack(side="left", padx=10)
    
    def confirm(self):
        self.confirmed = True
        self.destroy()
    
    def cancel(self):
        self.confirmed = False
        self.destroy()