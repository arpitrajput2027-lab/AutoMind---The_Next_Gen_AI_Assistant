# test_whatsapp.py

from tools.whatsapp_tools import send_message
import time

print("Starting WhatsApp test in 3 seconds...")
print("Make sure WhatsApp Web is logged in!")
time.sleep(3)

result = send_message("Me", "Test from VENOM AI")
print(f"\nResult: {result}")