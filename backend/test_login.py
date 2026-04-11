import urllib.request
import json

data = json.dumps({'email': 'test@example.com', 'password': 'password123'}).encode()
req = urllib.request.Request(
    'http://localhost:5000/api/auth/login',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    resp = urllib.request.urlopen(req)
    print(f'Status: 200')
    print(json.dumps(json.loads(resp.read().decode()), indent=2))
except urllib.error.HTTPError as e:
    print(f'Status: {e.code}')
    error_data = json.loads(e.read().decode())
    print(json.dumps(error_data, indent=2))
except Exception as e:
    print(f'Error: {e}')
