
import time
from playwright.sync_api import sync_playwright
import threading
import http.server
import socketserver
import os

PORT = 8081

def run_server():
    os.chdir(os.getcwd())
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

def main():
    # Start server in a thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(2)  # Wait for server to start

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Test index.html
        print("Testing index.html...")
        page.goto(f"http://localhost:{PORT}/index.html")

        # Click chatbot toggle
        page.click("#chatbot-toggle")

        # Wait for chat to be visible and welcome message
        page.wait_for_selector("#chat-window", state="visible")
        time.sleep(2)  # Give time for first message
        page.screenshot(path="chatbot_start.png")

        # Step 1: Name
        print("Entering name...")
        page.fill("#user-input", "Juan Perez")
        page.click("#send-btn")
        time.sleep(2)
        page.screenshot(path="chatbot_step1.png")

        # Step 2: Email
        print("Entering email...")
        page.fill("#user-input", "juan@example.com")
        page.click("#send-btn")
        time.sleep(2)
        page.screenshot(path="chatbot_step2.png")

        # Step 3: Phone
        print("Entering phone...")
        page.fill("#user-input", "5512345678")
        page.click("#send-btn")
        time.sleep(2)
        page.screenshot(path="chatbot_step3.png")

        # Step 4: Event Type (Buttons)
        print("Selecting event type...")
        page.click("text=Boda")
        time.sleep(2)
        page.screenshot(path="chatbot_step4.png")

        # Step 5: Location
        print("Entering location...")
        page.fill("#user-input", "CDMX")
        page.click("#send-btn")
        time.sleep(2)
        page.screenshot(path="chatbot_step5.png")

        # Step 6: Guest Count (Buttons)
        print("Selecting guest count...")
        page.wait_for_selector("text=200-500")
        page.click("text=200-500")
        time.sleep(2)
        page.screenshot(path="chatbot_step6.png")

        # Step 7: Date (DatePicker)
        print("Selecting date...")
        # Since date picker is native, we might need to fill it via JS or just type in it if it's an input
        page.fill(".chat-date-input", "2026-12-31")
        page.click("text=Confirmar fecha")
        time.sleep(2)
        page.screenshot(path="chatbot_final.png")

        # Check for WhatsApp button
        wa_btn = page.query_selector(".whatsapp-btn")
        if wa_btn:
            print("WhatsApp button found!")
            href = wa_btn.get_attribute("href")
            print(f"WhatsApp link: {href[:100]}...")
            if "wa.me" in href and "Juan" in href:
                print("WhatsApp link looks correct!")
        else:
            print("WhatsApp button NOT found!")

        browser.close()

if __name__ == "__main__":
    main()
