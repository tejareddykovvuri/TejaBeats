import http.server
import socketserver
import urllib.request
import urllib.parse
import os
import sys

PORT = 8088
WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build", "web")

class WebProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/api.php') or parsed.path == '/api.php':
            target_url = "https://www.jiosaavn.com" + self.path
            req = urllib.request.Request(
                target_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json, text/plain, */*",
                }
            )
            try:
                with urllib.request.urlopen(req, timeout=12) as response:
                    data = response.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "text/plain")
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
            return

        elif parsed.path == '/yt/search':
            qs = urllib.parse.parse_qs(parsed.query)
            q = qs.get('q', [''])[0]
            import json
            req_data = json.dumps({
                "context": {
                    "client": {
                        "clientName": "WEB",
                        "clientVersion": "2.20230515.04.00"
                    }
                },
                "query": q
            }).encode('utf-8')
            yt_req = urllib.request.Request(
                "https://www.youtube.com/youtubei/v1/search",
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            )
            try:
                with urllib.request.urlopen(yt_req, timeout=10) as response:
                    raw = json.loads(response.read().decode('utf-8'))
                    items = []
                    contents = raw.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [])
                    for sec in contents:
                        for it in sec.get('itemSectionRenderer', {}).get('contents', []):
                            vr = it.get('videoRenderer')
                            if vr:
                                vid = vr.get('videoId')
                                title = ''.join([r.get('text', '') for r in vr.get('title', {}).get('runs', [])])
                                channel = ''.join([r.get('text', '') for r in vr.get('ownerText', {}).get('runs', [])])
                                dur_text = vr.get('lengthText', {}).get('simpleText', '3:30')
                                dur_sec = 0
                                for part in dur_text.split(':'):
                                    dur_sec = dur_sec * 60 + (int(part) if part.isdigit() else 0)
                                thumbs = vr.get('thumbnail', {}).get('thumbnails', [])
                                thumb = thumbs[-1].get('url') if thumbs else f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
                                items.append({
                                    'id': vid,
                                    'title': title,
                                    'artist': channel if channel else 'YouTube Artist',
                                    'duration': dur_sec,
                                    'image': thumb
                                })
                    res_bytes = json.dumps({'results': items}).encode('utf-8')
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(res_bytes)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                import json
                self.wfile.write(json.dumps({'error': str(e), 'results': []}).encode('utf-8'))
            return

        elif parsed.path == '/yt/suggest':
            qs = urllib.parse.parse_qs(parsed.query)
            q = qs.get('q', [''])[0]
            target_url = "https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=" + urllib.parse.quote_plus(q)
            req = urllib.request.Request(
                target_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                }
            )
            try:
                with urllib.request.urlopen(req, timeout=8) as response:
                    data = response.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(data)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "text/plain")
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
            return

        super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

WebProxyHandler.extensions_map['.wasm'] = 'application/wasm'
WebProxyHandler.extensions_map['.js'] = 'application/javascript'

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), WebProxyHandler) as httpd:
        print(f"TejaBeats Web Server running at http://localhost:{PORT}")
        sys.stdout.flush()
        httpd.serve_forever()
