#!/usr/bin/env python3
"""Tiny client for the MCP-for-Blender addon socket (127.0.0.1:9876).

  python3 blender/bl.py file.py [args...]   run a Python file inside Blender (sys.argv-like ARGS available)
  python3 blender/bl.py -c "code"           run a snippet
Prints whatever the code printed; exits non-zero with the traceback on error.
"""
import json, socket, sys, os

def send(cmd, timeout=900):
    s = socket.create_connection(("127.0.0.1", 9876), timeout=timeout)
    s.sendall(json.dumps(cmd).encode())
    buf = b""
    while True:
        chunk = s.recv(1 << 16)
        if not chunk:
            break
        buf += chunk
        try:
            return json.loads(buf.decode())
        except ValueError:
            continue
    return json.loads(buf.decode())

def run(code):
    r = send({"type": "execute_code", "params": {"code": code}})
    if r.get("status") != "success":
        sys.stderr.write(str(r.get("message", r)) + "\n")
        sys.exit(1)
    out = r.get("result", {})
    sys.stdout.write(out.get("result", "") if isinstance(out, dict) else str(out))

if __name__ == "__main__":
    if sys.argv[1] == "-c":
        run(sys.argv[2])
    else:
        path = os.path.abspath(sys.argv[1])
        args = sys.argv[2:]
        run(f"import sys\nARGS = {args!r}\n__file__ = {path!r}\nexec(compile(open({path!r}).read(), {path!r}, 'exec'))")
