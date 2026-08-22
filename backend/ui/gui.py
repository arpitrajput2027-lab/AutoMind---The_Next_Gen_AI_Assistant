# # ui/gui.py - Advanced Futuristic GUI

# import customtkinter as ctk
# import threading
# import time
# import random
# from core.assistant import process_query
# from audio.sarvam_tts import speak_sarvam
# from core.speech import listen
# from core.memory import clear_memory

# ctk.set_appearance_mode("dark")
# ctk.set_default_color_theme("blue")

# class VenomGUI(ctk.CTk):
#     def __init__(self):
#         super().__init__()

#         # Window setup
#         self.title("⚡ VENOM AI - Autonomous Intelligence")
#         self.geometry("1400x900")
#         self.configure(fg_color="#0a0e1a")
        
#         # State
#         self.listening = False
#         self.voice_thread_running = False
#         self.wake_word_mode = True
#         self.wake_word = "hello venom"
#         self.is_speaking = False
        
#         # Color scheme
#         self.colors = {
#             "bg_dark": "#0a0e1a",
#             "bg_card": "#12182b",
#             "bg_sidebar": "#0f1419",
#             "accent_cyan": "#00d4ff",
#             "accent_green": "#00ff88",
#             "accent_purple": "#a855f7",
#             "accent_orange": "#fb923c",
#             "text_primary": "#ffffff",
#             "text_secondary": "#94a3b8",
#         }
        
#         self.build_ui()
#         self.start_animations()
#         self.after(1500, self.start_listening)

#     # ==================== UI CONSTRUCTION ====================
#     def build_ui(self):
#         """Build main interface"""
        
#         # Configure grid
#         self.grid_columnconfigure(1, weight=1)
#         self.grid_rowconfigure(0, weight=1)
        
#         # Build components
#         self.build_sidebar()
#         self.build_main_area()
    
#     def build_sidebar(self):
#         """Modern sidebar with controls"""
        
#         self.sidebar = ctk.CTkFrame(
#             self, 
#             width=320, 
#             fg_color=self.colors["bg_sidebar"],
#             corner_radius=0
#         )
#         self.sidebar.grid(row=0, column=0, sticky="ns")
#         self.sidebar.grid_propagate(False)
        
#         # Logo section
#         logo_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
#         logo_frame.pack(pady=30)
        
#         ctk.CTkLabel(
#             logo_frame,
#             text="⚡ VENOM",
#             font=("SF Pro Display", 32, "bold"),
#             text_color=self.colors["accent_cyan"]
#         ).pack()
        
#         ctk.CTkLabel(
#             logo_frame,
#             text="Autonomous Intelligence",
#             font=("SF Pro Display", 12),
#             text_color=self.colors["text_secondary"]
#         ).pack()
        
#         # Status indicator
#         self.status_frame = ctk.CTkFrame(
#             self.sidebar, 
#             fg_color=self.colors["bg_card"],
#             corner_radius=15,
#             height=80
#         )
#         self.status_frame.pack(pady=20, padx=20, fill="x")
        
#         self.status_indicator = ctk.CTkLabel(
#             self.status_frame,
#             text="●",
#             font=("SF Pro Display", 40),
#             text_color=self.colors["accent_green"]
#         )
#         self.status_indicator.pack(pady=5)
        
#         self.status_text = ctk.CTkLabel(
#             self.status_frame,
#             text="READY",
#             font=("SF Pro Display", 14, "bold"),
#             text_color=self.colors["text_primary"]
#         )
#         self.status_text.pack()
        
#         # Control buttons
#         ctk.CTkLabel(
#             self.sidebar,
#             text="CONTROLS",
#             font=("SF Pro Display", 16, "bold"),
#             text_color=self.colors["text_secondary"]
#         ).pack(pady=(30, 15))
        
#         # Wake word toggle
#         self.wake_button = ctk.CTkButton(
#             self.sidebar,
#             text="🎤 Wake Word: ON",
#             command=self.toggle_wake_word,
#             fg_color=self.colors["accent_purple"],
#             hover_color="#9333ea",
#             corner_radius=10,
#             height=45,
#             font=("SF Pro Display", 13, "bold")
#         )
#         self.wake_button.pack(pady=5, padx=20, fill="x")
        
#         # Clear memory
#         ctk.CTkButton(
#             self.sidebar,
#             text="🗑️ Clear Memory",
#             command=self.clear_memory_action,
#             fg_color=self.colors["bg_card"],
#             hover_color="#1e293b",
#             corner_radius=10,
#             height=45,
#             font=("SF Pro Display", 13, "bold"),
#             border_width=2,
#             border_color=self.colors["text_secondary"]
#         ).pack(pady=5, padx=20, fill="x")
        
#         # Screenshot
#         ctk.CTkButton(
#             self.sidebar,
#             text="📸 Analyze Screen",
#             command=self.trigger_screen_analysis,
#             fg_color=self.colors["bg_card"],
#             hover_color="#1e293b",
#             corner_radius=10,
#             height=45,
#             font=("SF Pro Display", 13, "bold"),
#             border_width=2,
#             border_color=self.colors["text_secondary"]
#         ).pack(pady=5, padx=20, fill="x")
        
#         # Execution logs
#         ctk.CTkLabel(
#             self.sidebar,
#             text="EXECUTION LOGS",
#             font=("SF Pro Display", 16, "bold"),
#             text_color=self.colors["text_secondary"]
#         ).pack(pady=(30, 10))
        
#         self.logs_box = ctk.CTkTextbox(
#             self.sidebar,
#             fg_color=self.colors["bg_card"],
#             corner_radius=10,
#             font=("Consolas", 11),
#             text_color=self.colors["accent_green"]
#         )
#         self.logs_box.pack(padx=20, pady=10, fill="both", expand=True)
    
#     def build_main_area(self):
#         """Main chat area"""
        
#         main_frame = ctk.CTkFrame(self, fg_color=self.colors["bg_dark"])
#         main_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        
#         main_frame.grid_rowconfigure(1, weight=1)
#         main_frame.grid_columnconfigure(0, weight=1)
        
#         # Header with stats
#         header = ctk.CTkFrame(
#             main_frame, 
#             fg_color=self.colors["bg_card"],
#             corner_radius=15,
#             height=100
#         )
#         header.grid(row=0, column=0, sticky="ew", pady=(0, 20))
#         header.grid_columnconfigure(0, weight=1)
        
#         header_left = ctk.CTkFrame(header, fg_color="transparent")
#         header_left.pack(side="left", padx=30, pady=20)
        
#         ctk.CTkLabel(
#             header_left,
#             text="⚡ VENOM COMMAND CENTER",
#             font=("SF Pro Display", 28, "bold"),
#             text_color=self.colors["accent_cyan"]
#         ).pack(anchor="w")
        
#         ctk.CTkLabel(
#             header_left,
#             text="Speak naturally. I'll handle the rest.",
#             font=("SF Pro Display", 13),
#             text_color=self.colors["text_secondary"]
#         ).pack(anchor="w")
        
#         # Stats
#         stats_frame = ctk.CTkFrame(header, fg_color="transparent")
#         stats_frame.pack(side="right", padx=30)
        
#         self.add_stat(stats_frame, "🎯", "Tasks", "0")
#         self.add_stat(stats_frame, "⚡", "Speed", "FAST")
#         self.add_stat(stats_frame, "🔥", "Status", "ACTIVE")
        
#         # Voice visualizer
#         self.wave_canvas = ctk.CTkCanvas(
#             main_frame,
#             height=120,
#             bg=self.colors["bg_card"],
#             highlightthickness=0
#         )
#         self.wave_canvas.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        
#         # Chat area
#         chat_container = ctk.CTkFrame(
#             main_frame,
#             fg_color=self.colors["bg_card"],
#             corner_radius=15
#         )
#         chat_container.grid(row=2, column=0, sticky="nsew")
#         chat_container.grid_rowconfigure(0, weight=1)
#         chat_container.grid_columnconfigure(0, weight=1)
        
#         self.chat_box = ctk.CTkTextbox(
#             chat_container,
#             font=("SF Mono", 14),
#             fg_color=self.colors["bg_dark"],
#             corner_radius=10,
#             text_color=self.colors["text_primary"],
#             wrap="word"
#         )
#         self.chat_box.grid(row=0, column=0, sticky="nsew", padx=15, pady=15)
        
#         # Welcome message
#         self.append_system_message("⚡ VENOM AI INITIALIZED")
#         self.append_system_message("💬 Listening for commands...")
        
#         # Input area
#         input_frame = ctk.CTkFrame(
#             main_frame,
#             fg_color=self.colors["bg_card"],
#             corner_radius=15,
#             height=80
#         )
#         input_frame.grid(row=3, column=0, sticky="ew", pady=(20, 0))
        
#         self.entry = ctk.CTkEntry(
#             input_frame,
#             height=50,
#             font=("SF Pro Display", 14),
#             fg_color=self.colors["bg_dark"],
#             border_width=0,
#             placeholder_text="Type your command or press Enter to use voice..."
#         )
#         self.entry.pack(side="left", fill="x", expand=True, padx=15, pady=15)
#         self.entry.bind("<Return>", lambda e: self.send_text())
        
#         ctk.CTkButton(
#             input_frame,
#             text="🚀 Send",
#             command=self.send_text,
#             fg_color=self.colors["accent_cyan"],
#             hover_color="#0099cc",
#             corner_radius=10,
#             width=120,
#             height=50,
#             font=("SF Pro Display", 14, "bold")
#         ).pack(side="right", padx=15, pady=15)
    
#     def add_stat(self, parent, icon, label, value):
#         """Add stat card"""
#         stat = ctk.CTkFrame(parent, fg_color="transparent")
#         stat.pack(side="left", padx=15)
        
#         ctk.CTkLabel(
#             stat,
#             text=icon,
#             font=("SF Pro Display", 24)
#         ).pack()
        
#         ctk.CTkLabel(
#             stat,
#             text=label,
#             font=("SF Pro Display", 10),
#             text_color=self.colors["text_secondary"]
#         ).pack()
        
#         ctk.CTkLabel(
#             stat,
#             text=value,
#             font=("SF Pro Display", 13, "bold"),
#             text_color=self.colors["accent_green"]
#         ).pack()
    
#     # ==================== MESSAGING ====================
#     def append_system_message(self, text):
#         """Add system message"""
#         self.chat_box.configure(state="normal")
#         self.chat_box.insert("end", f"⚙️  {text}\n", "system")
#         self.chat_box.tag_config("system", foreground=self.colors["text_secondary"])
#         self.chat_box.configure(state="disabled")
#         self.chat_box.see("end")
    
#     def append_user_message(self, text):
#         """Add user message"""
#         self.chat_box.configure(state="normal")
#         self.chat_box.insert("end", f"\n🧑 You:\n", "user_label")
#         self.chat_box.insert("end", f"{text}\n", "user_text")
#         self.chat_box.tag_config("user_label", foreground=self.colors["accent_cyan"], font=("SF Pro Display", 13, "bold"))
#         self.chat_box.tag_config("user_text", foreground=self.colors["text_primary"])
#         self.chat_box.configure(state="disabled")
#         self.chat_box.see("end")
    
#     def append_venom_message(self, text):
#         """Add VENOM response"""
#         self.chat_box.configure(state="normal")
#         self.chat_box.insert("end", f"\n⚡ VENOM:\n", "venom_label")
#         self.chat_box.insert("end", f"{text}\n", "venom_text")
#         self.chat_box.tag_config("venom_label", foreground=self.colors["accent_green"], font=("SF Pro Display", 13, "bold"))
#         self.chat_box.tag_config("venom_text", foreground="#e2e8f0")
#         self.chat_box.configure(state="disabled")
#         self.chat_box.see("end")
    
#     def log_event(self, msg, color=None):
#         """Log execution event"""
#         self.logs_box.insert("end", f"{msg}\n")
#         self.logs_box.see("end")
    
#     # ==================== CONTROLS ====================
#     def toggle_wake_word(self):
#         """Toggle wake word mode"""
#         self.wake_word_mode = not self.wake_word_mode
#         state = "ON" if self.wake_word_mode else "OFF"
#         self.wake_button.configure(text=f"🎤 Wake Word: {state}")
#         self.log_event(f"Wake word mode: {state}")
    
#     def clear_memory_action(self):
#         """Clear conversation memory"""
#         clear_memory()
#         self.chat_box.configure(state="normal")
#         self.chat_box.delete("1.0", "end")
#         self.chat_box.configure(state="disabled")
#         self.append_system_message("🗑️ Memory cleared")
#         self.log_event("Memory cleared")
    
#     def trigger_screen_analysis(self):
#         """Trigger screen analysis"""
#         self.append_system_message("📸 Capturing screen...")
#         threading.Thread(
#             target=lambda: self.generate_response("analyze my screen"),
#             daemon=True
#         ).start()
    
#     def set_status(self, text, color):
#         """Update status indicator"""
#         self.status_text.configure(text=text)
#         self.status_indicator.configure(text_color=color)
    
#     # ==================== TEXT INPUT ====================
#     def send_text(self):
#         """Handle text input"""
#         text = self.entry.get().strip()
#         if not text:
#             return
        
#         self.entry.delete(0, "end")
#         self.append_user_message(text)
        
#         threading.Thread(
#             target=self.generate_response,
#             args=(text,),
#             daemon=True
#         ).start()
    
#     # ==================== RESPONSE GENERATION ====================
#     def generate_response(self, text):
#         """Generate and execute response"""
        
#         self.listening = False
#         self.is_speaking = True
#         self.set_status("THINKING", self.colors["accent_orange"])
#         self.log_event("🧠 Processing query...")
        
#         try:
#             # Process query
#             response, execution_logs = process_query(text)
            
#             # Display response
#             self.after(0, self.append_venom_message, response)
            
#             # Log execution
#             for log in execution_logs:
#                 self.after(0, self.log_event, log)
            
#             # Speak response
#             speak_sarvam(response)
            
#             self.log_event("✅ Response delivered")
            
#         except Exception as e:
#             error_msg = f"Error: {str(e)}"
#             self.after(0, self.append_venom_message, error_msg)
#             self.log_event(f"❌ {error_msg}")
        
#         finally:
#             self.is_speaking = False
#             self.set_status("LISTENING", self.colors["accent_green"])
#             self.listening = True
    
#     # ==================== VOICE LOOP ====================
#     def start_listening(self):
#         """Start voice listening thread"""
#         if not self.voice_thread_running:
#             self.listening = True
#             self.voice_thread_running = True
            
#             threading.Thread(target=self.voice_loop, daemon=True).start()
    
#     def voice_loop(self):
#         """Continuous voice listening"""
#         while True:
#             if not self.listening or self.is_speaking:
#                 time.sleep(0.5)
#                 continue
            
#             try:
#                 text = listen(timeout=5)
#                 if not text:
#                     continue
                
#                 text_lower = text.lower()
                
#                 # Check wake word
#                 if self.wake_word_mode:
#                     if self.wake_word not in text_lower:
#                         continue
#                     text = text_lower.replace(self.wake_word, "").strip()
#                     if not text:
#                         continue
                
#                 # Display and process
#                 self.after(0, self.append_user_message, text)
                
#                 threading.Thread(
#                     target=self.generate_response,
#                     args=(text,),
#                     daemon=True
#                 ).start()
                
#             except Exception as e:
#                 print(f"Voice error: {e}")
    
#     # ==================== ANIMATIONS ====================
#     def start_animations(self):
#         """Start UI animations"""
#         threading.Thread(target=self.waveform_animation, daemon=True).start()
    
#     def waveform_animation(self):
#         """Animated waveform"""
#         while True:
#             try:
#                 self.wave_canvas.delete("all")
#                 width = self.wave_canvas.winfo_width()
                
#                 if width < 10:
#                     time.sleep(0.1)
#                     continue
                
#                 num_bars = 60
#                 bar_width = width / num_bars
                
#                 for i in range(num_bars):
#                     # Dynamic height based on speaking state
#                     if self.is_speaking:
#                         height = random.randint(30, 90)
#                     elif self.listening:
#                         height = random.randint(10, 40)
#                     else:
#                         height = random.randint(5, 20)
                    
#                     x = i * bar_width
                    
#                     # Gradient effect
#                     color = self.colors["accent_cyan"] if self.listening else self.colors["accent_purple"]
                    
#                     self.wave_canvas.create_rectangle(
#                         x, 60 - height,
#                         x + bar_width - 2, 60 + height,
#                         fill=color,
#                         outline=""
#                     )
                
#                 time.sleep(0.05)
                
#             except Exception as e:
#                 print(f"Animation error: {e}")
#                 time.sleep(0.1)


# if __name__ == "__main__":
#     app = VenomGUI()
#     app.mainloop()
# ui/gui.py - Advanced Futuristic GUI (FIXED)

import customtkinter as ctk
import threading
import time
import random
from core.assistant import process_query
from audio.sarvam_tts import speak_sarvam
from core.speech import listen
from core.memory import clear_memory

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

class VenomGUI(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Window setup
        self.title("⚡ VENOM AI - Autonomous Intelligence")
        self.geometry("1400x900")
        self.configure(fg_color="#0a0e1a")
        
        # State
        self.listening = False
        self.voice_thread_running = False
        self.wake_word_mode = True
        self.wake_word = "hello venom"
        self.is_speaking = False
        self.task_count = 0
        
        # Color scheme
        self.colors = {
            "bg_dark": "#0a0e1a",
            "bg_card": "#12182b",
            "bg_sidebar": "#0f1419",
            "accent_cyan": "#00d4ff",
            "accent_green": "#00ff88",
            "accent_purple": "#a855f7",
            "accent_orange": "#fb923c",
            "text_primary": "#ffffff",
            "text_secondary": "#94a3b8",
        }
        
        self.build_ui()
        self.start_animations()
        self.after(1500, self.start_listening)

    # ==================== UI CONSTRUCTION ====================
    def build_ui(self):
        """Build main interface"""
        
        # Configure grid
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Build components
        self.build_sidebar()
        self.build_main_area()
    
    def build_sidebar(self):
        """Modern sidebar with controls"""
        
        self.sidebar = ctk.CTkFrame(
            self, 
            width=320, 
            fg_color=self.colors["bg_sidebar"],
            corner_radius=0
        )
        self.sidebar.grid(row=0, column=0, sticky="ns")
        self.sidebar.grid_propagate(False)
        
        # Logo section
        logo_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        logo_frame.pack(pady=30)
        
        ctk.CTkLabel(
            logo_frame,
            text="⚡ VENOM",
            font=("Arial", 32, "bold"),
            text_color=self.colors["accent_cyan"]
        ).pack()
        
        ctk.CTkLabel(
            logo_frame,
            text="Autonomous Intelligence",
            font=("Arial", 12),
            text_color=self.colors["text_secondary"]
        ).pack()
        
        # Status indicator
        self.status_frame = ctk.CTkFrame(
            self.sidebar, 
            fg_color=self.colors["bg_card"],
            corner_radius=15,
            height=80
        )
        self.status_frame.pack(pady=20, padx=20, fill="x")
        
        self.status_indicator = ctk.CTkLabel(
            self.status_frame,
            text="●",
            font=("Arial", 40),
            text_color=self.colors["accent_green"]
        )
        self.status_indicator.pack(pady=5)
        
        self.status_text = ctk.CTkLabel(
            self.status_frame,
            text="READY",
            font=("Arial", 14, "bold"),
            text_color=self.colors["text_primary"]
        )
        self.status_text.pack()
        
        # Control buttons
        ctk.CTkLabel(
            self.sidebar,
            text="CONTROLS",
            font=("Arial", 16, "bold"),
            text_color=self.colors["text_secondary"]
        ).pack(pady=(30, 15))
        
        # Wake word toggle
        self.wake_button = ctk.CTkButton(
            self.sidebar,
            text="🎤 Wake Word: ON",
            command=self.toggle_wake_word,
            fg_color=self.colors["accent_purple"],
            hover_color="#9333ea",
            corner_radius=10,
            height=45,
            font=("Arial", 13, "bold")
        )
        self.wake_button.pack(pady=5, padx=20, fill="x")
        
        # Clear memory
        ctk.CTkButton(
            self.sidebar,
            text="🗑️ Clear Memory",
            command=self.clear_memory_action,
            fg_color=self.colors["bg_card"],
            hover_color="#1e293b",
            corner_radius=10,
            height=45,
            font=("Arial", 13, "bold"),
            border_width=2,
            border_color=self.colors["text_secondary"]
        ).pack(pady=5, padx=20, fill="x")
        
        # Screenshot
        ctk.CTkButton(
            self.sidebar,
            text="📸 Analyze Screen",
            command=self.trigger_screen_analysis,
            fg_color=self.colors["bg_card"],
            hover_color="#1e293b",
            corner_radius=10,
            height=45,
            font=("Arial", 13, "bold"),
            border_width=2,
            border_color=self.colors["text_secondary"]
        ).pack(pady=5, padx=20, fill="x")
        
        # Execution logs
        ctk.CTkLabel(
            self.sidebar,
            text="EXECUTION LOGS",
            font=("Arial", 16, "bold"),
            text_color=self.colors["text_secondary"]
        ).pack(pady=(30, 10))
        
        self.logs_box = ctk.CTkTextbox(
            self.sidebar,
            fg_color=self.colors["bg_card"],
            corner_radius=10,
            font=("Consolas", 11),
            text_color=self.colors["accent_green"]
        )
        self.logs_box.pack(padx=20, pady=10, fill="both", expand=True)
    
    def build_main_area(self):
        """Main chat area"""
        
        main_frame = ctk.CTkFrame(self, fg_color=self.colors["bg_dark"])
        main_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        
        main_frame.grid_rowconfigure(2, weight=1)
        main_frame.grid_columnconfigure(0, weight=1)
        
        # Header with stats
        header = ctk.CTkFrame(
            main_frame, 
            fg_color=self.colors["bg_card"],
            corner_radius=15,
            height=100
        )
        header.grid(row=0, column=0, sticky="ew", pady=(0, 20))
        header.grid_columnconfigure(0, weight=1)
        
        header_left = ctk.CTkFrame(header, fg_color="transparent")
        header_left.pack(side="left", padx=30, pady=20)
        
        ctk.CTkLabel(
            header_left,
            text="⚡ VENOM COMMAND CENTER",
            font=("Arial", 28, "bold"),
            text_color=self.colors["accent_cyan"]
        ).pack(anchor="w")
        
        ctk.CTkLabel(
            header_left,
            text="Speak naturally. I'll handle the rest.",
            font=("Arial", 13),
            text_color=self.colors["text_secondary"]
        ).pack(anchor="w")
        
        # Stats
        stats_frame = ctk.CTkFrame(header, fg_color="transparent")
        stats_frame.pack(side="right", padx=30)
        
        self.task_count_label = self.add_stat(stats_frame, "🎯", "Tasks", "0")
        self.add_stat(stats_frame, "⚡", "Speed", "FAST")
        self.add_stat(stats_frame, "🔥", "Status", "ACTIVE")
        
        # Voice visualizer
        self.wave_canvas = ctk.CTkCanvas(
            main_frame,
            height=120,
            bg=self.colors["bg_card"],
            highlightthickness=0
        )
        self.wave_canvas.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        
        # Chat area
        chat_container = ctk.CTkFrame(
            main_frame,
            fg_color=self.colors["bg_card"],
            corner_radius=15
        )
        chat_container.grid(row=2, column=0, sticky="nsew")
        chat_container.grid_rowconfigure(0, weight=1)
        chat_container.grid_columnconfigure(0, weight=1)
        
        self.chat_box = ctk.CTkTextbox(
            chat_container,
            font=("Consolas", 13),
            fg_color=self.colors["bg_dark"],
            corner_radius=10,
            text_color=self.colors["text_primary"],
            wrap="word"
        )
        self.chat_box.grid(row=0, column=0, sticky="nsew", padx=15, pady=15)
        
        # Welcome message
        self.append_system_message("⚡ VENOM AI INITIALIZED")
        self.append_system_message("💬 Listening for commands...")
        
        # Input area
        input_frame = ctk.CTkFrame(
            main_frame,
            fg_color=self.colors["bg_card"],
            corner_radius=15,
            height=80
        )
        input_frame.grid(row=3, column=0, sticky="ew", pady=(20, 0))
        
        self.entry = ctk.CTkEntry(
            input_frame,
            height=50,
            font=("Arial", 14),
            fg_color=self.colors["bg_dark"],
            border_width=0,
            placeholder_text="Type your command or press Enter to use voice..."
        )
        self.entry.pack(side="left", fill="x", expand=True, padx=15, pady=15)
        self.entry.bind("<Return>", lambda e: self.send_text())
        
        ctk.CTkButton(
            input_frame,
            text="🚀 Send",
            command=self.send_text,
            fg_color=self.colors["accent_cyan"],
            hover_color="#0099cc",
            corner_radius=10,
            width=120,
            height=50,
            font=("Arial", 14, "bold")
        ).pack(side="right", padx=15, pady=15)
    
    def add_stat(self, parent, icon, label, value):
        """Add stat card"""
        stat = ctk.CTkFrame(parent, fg_color="transparent")
        stat.pack(side="left", padx=15)
        
        ctk.CTkLabel(
            stat,
            text=icon,
            font=("Arial", 24)
        ).pack()
        
        ctk.CTkLabel(
            stat,
            text=label,
            font=("Arial", 10),
            text_color=self.colors["text_secondary"]
        ).pack()
        
        value_label = ctk.CTkLabel(
            stat,
            text=value,
            font=("Arial", 13, "bold"),
            text_color=self.colors["accent_green"]
        )
        value_label.pack()
        
        # Return the value label for task counter
        if label == "Tasks":
            return value_label
        
        return None
    
    # ==================== MESSAGING (FIXED) ====================
    def append_system_message(self, text):
        """Add system message"""
        self.chat_box.configure(state="normal")
        self.chat_box.insert("end", f"⚙️  {text}\n", "system")
        self.chat_box.tag_config("system", foreground=self.colors["text_secondary"])
        self.chat_box.configure(state="disabled")
        self.chat_box.see("end")
    
    def append_user_message(self, text):
        """Add user message - FIXED (no font in tag_config)"""
        self.chat_box.configure(state="normal")
        
        # Separator
        self.chat_box.insert("end", "\n" + "─" * 60 + "\n", "separator")
        self.chat_box.tag_config("separator", foreground="#1e293b")
        
        # User label
        self.chat_box.insert("end", "🧑 YOU\n", "user_label")
        self.chat_box.tag_config("user_label", foreground=self.colors["accent_cyan"])
        
        # User message
        self.chat_box.insert("end", f"{text}\n", "user_text")
        self.chat_box.tag_config("user_text", foreground=self.colors["text_primary"])
        
        self.chat_box.configure(state="disabled")
        self.chat_box.see("end")
    
    def append_venom_message(self, text):
        """Add VENOM response - FIXED (no font in tag_config)"""
        self.chat_box.configure(state="normal")
        
        # Venom label
        self.chat_box.insert("end", "\n⚡ VENOM\n", "venom_label")
        self.chat_box.tag_config("venom_label", foreground=self.colors["accent_green"])
        
        # Response
        self.chat_box.insert("end", f"{text}\n", "venom_text")
        self.chat_box.tag_config("venom_text", foreground="#e2e8f0")
        
        self.chat_box.configure(state="disabled")
        self.chat_box.see("end")
    
    def log_event(self, msg, color=None):
        """Log execution event"""
        self.logs_box.configure(state="normal")
        self.logs_box.insert("end", f"• {msg}\n")
        self.logs_box.configure(state="disabled")
        self.logs_box.see("end")
    
    # ==================== CONTROLS ====================
    def toggle_wake_word(self):
        """Toggle wake word mode"""
        self.wake_word_mode = not self.wake_word_mode
        state = "ON" if self.wake_word_mode else "OFF"
        self.wake_button.configure(text=f"🎤 Wake Word: {state}")
        self.log_event(f"Wake word mode: {state}")
    
    def clear_memory_action(self):
        """Clear conversation memory"""
        clear_memory()
        self.chat_box.configure(state="normal")
        self.chat_box.delete("1.0", "end")
        self.chat_box.configure(state="disabled")
        self.append_system_message("🗑️ Memory cleared")
        self.log_event("Memory cleared")
    
    def trigger_screen_analysis(self):
        """Trigger screen analysis"""
        self.append_system_message("📸 Capturing screen...")
        threading.Thread(
            target=lambda: self.generate_response("analyze my screen"),
            daemon=True
        ).start()
    
    def set_status(self, text, color):
        """Update status indicator"""
        self.status_text.configure(text=text)
        self.status_indicator.configure(text_color=color)
    
    def update_task_count(self):
        """Update task counter"""
        self.task_count += 1
        if self.task_count_label:
            self.task_count_label.configure(text=str(self.task_count))
    
    # ==================== TEXT INPUT ====================
    def send_text(self):
        """Handle text input"""
        text = self.entry.get().strip()
        if not text:
            return
        
        self.entry.delete(0, "end")
        self.append_user_message(text)
        
        threading.Thread(
            target=self.generate_response,
            args=(text,),
            daemon=True
        ).start()
    
    # ==================== RESPONSE GENERATION ====================
    def generate_response(self, text):
        """Generate and execute response"""
        
        self.listening = False
        self.is_speaking = True
        self.set_status("THINKING", self.colors["accent_orange"])
        self.log_event("🧠 Processing query...")
        
        try:
            # Process query
            response, execution_logs = process_query(text)
            
            # Display response
            self.after(0, self.append_venom_message, response)
            
            # Log execution
            for log in execution_logs:
                self.after(0, self.log_event, log)
            
            # Update task count
            self.after(0, self.update_task_count)
            
            # Speak response
            speak_sarvam(response)
            
            self.log_event("✅ Response delivered")
            
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            self.after(0, self.append_venom_message, error_msg)
            self.log_event(f"❌ {error_msg}")
        
        finally:
            self.is_speaking = False
            self.set_status("LISTENING", self.colors["accent_green"])
            self.listening = True
    
    # ==================== VOICE LOOP ====================
    def start_listening(self):
        """Start voice listening thread"""
        if not self.voice_thread_running:
            self.listening = True
            self.voice_thread_running = True
            
            threading.Thread(target=self.voice_loop, daemon=True).start()
    
    def voice_loop(self):
        """Continuous voice listening"""
        while True:
            if not self.listening or self.is_speaking:
                time.sleep(0.5)
                continue
            
            try:
                text = listen(timeout=5)
                if not text:
                    continue
                
                text_lower = text.lower()
                
                # Check wake word
                if self.wake_word_mode:
                    if self.wake_word not in text_lower:
                        continue
                    text = text_lower.replace(self.wake_word, "").strip()
                    if not text:
                        continue
                
                # Display and process
                self.after(0, self.append_user_message, text)
                
                threading.Thread(
                    target=self.generate_response,
                    args=(text,),
                    daemon=True
                ).start()
                
            except Exception as e:
                print(f"Voice error: {e}")
                time.sleep(0.5)
    
    # ==================== ANIMATIONS ====================
    def start_animations(self):
        """Start UI animations"""
        threading.Thread(target=self.waveform_animation, daemon=True).start()
    
    def waveform_animation(self):
        """Animated waveform"""
        while True:
            try:
                self.wave_canvas.delete("all")
                width = self.wave_canvas.winfo_width()
                
                if width < 10:
                    time.sleep(0.1)
                    continue
                
                num_bars = 60
                bar_width = width / num_bars
                
                for i in range(num_bars):
                    # Dynamic height based on speaking state
                    if self.is_speaking:
                        height = random.randint(30, 90)
                    elif self.listening:
                        height = random.randint(10, 40)
                    else:
                        height = random.randint(5, 20)
                    
                    x = i * bar_width
                    
                    # Gradient effect
                    color = self.colors["accent_cyan"] if self.listening else self.colors["accent_purple"]
                    
                    self.wave_canvas.create_rectangle(
                        x, 60 - height,
                        x + bar_width - 2, 60 + height,
                        fill=color,
                        outline=""
                    )
                
                time.sleep(0.05)
                
            except Exception as e:
                print(f"Animation error: {e}")
                time.sleep(0.1)


if __name__ == "__main__":
    app = VenomGUI()
    app.mainloop()