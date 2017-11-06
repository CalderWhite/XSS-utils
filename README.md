# XSS-utils

A local web interface to help you run XSS tests on any website.

## Installing/Building

First, install all required packages with:
```bash
npm run install
sudo pip3 install -r requirements.txt
```

And then build the static files:
```bash
npm run build
```

## Executing

In the project directory, run `python3 server.py`, and check [`localhost:8080`](https://127.0.0.1:8080)