import http.server
import socketserver
import os
import sys

PORT = 8000
DIRECTORY = os.getcwd()

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Check if path exists as a file
        path = self.translate_path(self.path)
        
        # If file doesn't exist and it's not looking for static assets (css/js/images), serve index.html
        if not os.path.exists(path):
            # Exception for obvious asset paths to prevent infinite loops if asset missing
            if any(x in self.path for x in ['.css', '.js', '.png', '.jpg', '.svg', '.mp3', '.woff']):
                super().do_GET() # Let it 404 normally
                return
                
            # Serve index.html for everything else (routes)
            self.path = '/index.html'
            
        super().do_GET()

if __name__ == '__main__':
    # Allow port config
    if len(sys.argv) > 1:
        PORT = int(sys.argv[1])
        
    print(f"Serving SPA at http://localhost:{PORT}")
    print("Press Ctrl+C to stop.")
    
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping server...")
            httpd.server_close()
