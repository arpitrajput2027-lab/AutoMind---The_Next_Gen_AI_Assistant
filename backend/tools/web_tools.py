import webbrowser
import requests
from bs4 import BeautifulSoup
import urllib.parse
import pyautogui
import time
import re

def open_url(url):
    webbrowser.open(url)
    return f"Opened {url}"

def search_google(query):
    url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
    webbrowser.open(url)
    return f"Searched Google for '{query}'"

def summarize_webpage(url):
    try:
        res = requests.get(url)
        soup = BeautifulSoup(res.text, 'html.parser')
        paragraphs = soup.find_all('p')
        text = " ".join(p.text for p in paragraphs[:5])
        return text[:500] + "..."  # summary
    except Exception as e:
        return f"Failed to summarize webpage: {e}"



def youtube_search(query: str):
    search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(search_url, headers=headers)

    video_ids = re.findall(r"watch\?v=(\S{11})", response.text)

    if not video_ids:
        return "No video found."

    first_video_url = f"https://www.youtube.com/watch?v={video_ids[0]}"

    webbrowser.open(first_video_url)

    return "YouTube video opened and playing."

def google_search(query: str):
    url = f"https://www.google.com/search?q={query}"
    webbrowser.open(url)
    return "Google search opened."