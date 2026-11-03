# tools/web_search.py — Real-time web search with multiple fallbacks
# Returns structured results the LLM can use to answer live questions.

from __future__ import annotations

import json
import re
from typing import Any
from urllib.parse import quote_plus


# Last search results for the current request (assistant reads these)
_last_search: dict[str, Any] = {"query": "", "results": []}


def get_last_search_results() -> dict[str, Any]:
    return _last_search


def clear_last_search() -> None:
    global _last_search
    _last_search = {"query": "", "results": []}


def _normalize(results: list[dict[str, str]]) -> list[dict[str, str]]:
    cleaned: list[dict[str, str]] = []
    seen = set()
    for r in results:
        title = (r.get("title") or "").strip()
        url = (r.get("url") or "").strip()
        snippet = (r.get("snippet") or "").strip()
        key = url or title
        if not key or key in seen:
            continue
        seen.add(key)
        cleaned.append({"title": title, "snippet": snippet, "url": url})
    return cleaned


def _unescape(text: str) -> str:
    return (
        text.replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&nbsp;", " ")
    )


def _search_ddgs(query: str, max_results: int = 5) -> list[dict[str, str]]:
    """Primary: ddgs package (optional — HTML fallback covers when missing)."""
    DDGS = None
    try:
        from ddgs import DDGS as _DDGS
        DDGS = _DDGS
    except ImportError:
        try:
            from duckduckgo_search import DDGS as _DDGS  # type: ignore
            DDGS = _DDGS
        except ImportError:
            print("[web_search] ddgs not installed — using HTML fallback")
            return []

    try:
        raw = list(DDGS().text(query, max_results=max_results))
        return _normalize([
            {
                "title": r.get("title") or "",
                "snippet": r.get("body") or r.get("snippet") or "",
                "url": r.get("href") or r.get("link") or "",
            }
            for r in raw
        ])
    except Exception as e:
        print(f"[web_search] DDGS failed: {e}")
        return []


def _search_duckduckgo_html(query: str, max_results: int = 5) -> list[dict[str, str]]:
    """Fallback: scrape DuckDuckGo HTML results (no API key)."""
    import requests

    try:
        resp = requests.get(
            "https://html.duckduckgo.com/html/",
            params={"q": query},
            timeout=12,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
            },
        )
        resp.raise_for_status()
        html = resp.text

        # Result blocks: <a class="result__a" href="...">title</a>
        # Snippet: <a class="result__snippet">...</a> or <td class="result-snippet">
        titles = re.findall(
            r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
            html,
            flags=re.IGNORECASE | re.DOTALL,
        )
        snippets = re.findall(
            r'class="result__snippet"[^>]*>(.*?)</(?:a|td|div)>',
            html,
            flags=re.IGNORECASE | re.DOTALL,
        )

        def strip_tags(s: str) -> str:
            return _unescape(re.sub(r"<[^>]+>", "", s)).strip()

        results = []
        for i, (href, title_html) in enumerate(titles[:max_results]):
            # DuckDuckGo wraps redirects sometimes
            url = href
            m = re.search(r"uddg=([^&]+)", href)
            if m:
                from urllib.parse import unquote
                url = unquote(m.group(1))
            snippet = strip_tags(snippets[i]) if i < len(snippets) else ""
            results.append({
                "title": strip_tags(title_html),
                "snippet": snippet,
                "url": url,
            })
        return _normalize(results)
    except Exception as e:
        print(f"[web_search] DDG HTML failed: {e}")
        return []


def _search_duckduckgo_api(query: str) -> list[dict[str, str]]:
    """Fallback: DuckDuckGo Instant Answer API (sparse for news)."""
    import requests

    try:
        resp = requests.get(
            "https://api.duckduckgo.com/",
            params={"q": query, "format": "json", "no_html": 1, "skip_disambig": 1},
            timeout=10,
            headers={"User-Agent": "VENOM-AI/1.0"},
        )
        data = resp.json()
        results: list[dict[str, str]] = []

        if data.get("AbstractText"):
            results.append({
                "title": data.get("Heading") or query,
                "snippet": data["AbstractText"],
                "url": data.get("AbstractURL") or "",
            })

        for topic in data.get("RelatedTopics", [])[:6]:
            if isinstance(topic, dict) and topic.get("Text"):
                results.append({
                    "title": (topic.get("Text") or "")[:80],
                    "snippet": topic.get("Text") or "",
                    "url": topic.get("FirstURL") or "",
                })
            elif isinstance(topic, dict) and "Topics" in topic:
                for t in topic["Topics"][:2]:
                    if t.get("Text"):
                        results.append({
                            "title": (t.get("Text") or "")[:80],
                            "snippet": t.get("Text") or "",
                            "url": t.get("FirstURL") or "",
                        })

        return _normalize(results)
    except Exception as e:
        print(f"[web_search] Instant Answer API failed: {e}")
        return []


def _search_wikipedia(query: str) -> list[dict[str, str]]:
    """Last-resort: Wikipedia OpenSearch + summary."""
    import requests

    try:
        headers = {"User-Agent": "VENOM-AI/1.0 (hackathon-demo)"}
        opensearch = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "opensearch",
                "search": query,
                "limit": 3,
                "namespace": 0,
                "format": "json",
            },
            timeout=10,
            headers=headers,
        )
        data = opensearch.json()
        titles = data[1] if len(data) > 1 else []
        descs = data[2] if len(data) > 2 else []
        urls = data[3] if len(data) > 3 else []

        results = []
        for i, title in enumerate(titles):
            results.append({
                "title": title,
                "snippet": descs[i] if i < len(descs) else "",
                "url": urls[i] if i < len(urls) else "",
            })

        # Enrich first hit with extract if snippets empty
        if results and not results[0]["snippet"]:
            sum_resp = requests.get(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote_plus(results[0]['title'])}",
                timeout=10,
                headers=headers,
            )
            if sum_resp.ok:
                extract = sum_resp.json().get("extract") or ""
                results[0]["snippet"] = extract[:300]
                if not results[0]["url"]:
                    results[0]["url"] = sum_resp.json().get("content_urls", {}).get("desktop", {}).get("page", "")

        return _normalize(results)
    except Exception as e:
        print(f"[web_search] Wikipedia failed: {e}")
        return []


def web_search(query: str, max_results: int = 5) -> str:
    """
    Search the web in real-time and return a readable summary of results.
    Also stores structured results in _last_search for the assistant pipeline.
    """
    global _last_search

    if not query or not str(query).strip():
        return "No search query provided."

    query = str(query).strip()
    try:
        max_results = int(max_results) if max_results else 5
    except (TypeError, ValueError):
        max_results = 5

    results: list[dict[str, str]] = []
    for fn in (
        lambda: _search_ddgs(query, max_results=max_results),
        lambda: _search_duckduckgo_html(query, max_results=max_results),
        lambda: _search_duckduckgo_api(query),
        lambda: _search_wikipedia(query),
    ):
        results = fn()
        if results:
            break

    _last_search = {"query": query, "results": results}

    if not results:
        return f"No web results found for: {query}"

    lines = [f"Web search results for: {query}", ""]
    for i, r in enumerate(results, 1):
        lines.append(f"{i}. {r['title']}")
        if r.get("snippet"):
            lines.append(f"   {r['snippet'][:280]}")
        if r.get("url"):
            lines.append(f"   Source: {r['url']}")
        lines.append("")

    return "\n".join(lines).strip()


def format_sources_payload() -> list[dict[str, str]]:
    """Clean source list for WebSocket / frontend."""
    return [
        {
            "title": r.get("title", ""),
            "snippet": r.get("snippet", "")[:200],
            "url": r.get("url", ""),
        }
        for r in (_last_search.get("results") or [])
        if r.get("title") or r.get("url")
    ]
