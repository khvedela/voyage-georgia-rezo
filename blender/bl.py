#!/usr/bin/env python3
"""Tiny client for Blender's MCP add-on socket (127.0.0.1:9876, null-byte-delimited JSON).

  python3 blender/bl.py file.py [args...]   run a Python file inside Blender (sys.argv-like ARGS available)
  python3 blender/bl.py -c "code"           run a snippet
Prints whatever the code printed; exits non-zero with the traceback on error.
"""
import json, socket, sys, os

def send(code, timeout=1800):
    s = socket.create_connection(("127.0.0.1", 9876), timeout=timeout)
    s.sendall(json.dumps({"type": "execute", "code": code, "strict_json": False}).encode() + b"\0")
    buf = b""
    while b"\0" not in buf:
        chunk = s.recv(1 << 16)
        if not chunk:
            break
        buf += chunk
    s.close()
    return json.loads(buf.split(b"\0")[0].decode())

def run(code):
    r = send(code)
    sys.stdout.write(r.get("stdout", ""))
    sys.stderr.write(r.get("stderr", ""))
    if r.get("status") != "ok":
        sys.stderr.write(str(r.get("message", r)) + "\n")
        sys.exit(1)

if __name__ == "__main__":
    if sys.argv[1] == "-c":
        run(sys.argv[2])
    else:
        path = os.path.abspath(sys.argv[1])
        args = sys.argv[2:]
        run(f"import sys\nARGS = {args!r}\n__file__ = {path!r}\nexec(compile(open({path!r}).read(), {path!r}, 'exec'), {{'ARGS': ARGS, '__file__': {path!r}, '__name__': '__main__'}})")
