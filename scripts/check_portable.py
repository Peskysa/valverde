"""Check the actual compiled portable launcher over HTTP."""
from pathlib import Path
import json, subprocess, sys, tempfile, time, urllib.request, urllib.error
with tempfile.TemporaryDirectory() as d:
    report=Path(d)/'server.json'
    process=subprocess.Popen([sys.argv[1],'--serve-test',str(report)])
    try:
        for _ in range(100):
            if report.exists():break
            if process.poll() is not None:raise RuntimeError('El portable terminó antes de arrancar')
            time.sleep(.2)
        url=json.loads(report.read_text())['url']
        assert url.startswith('http://127.0.0.1:')
        assert "Valverde · análisis de envíos".encode('utf-8') in urllib.request.urlopen(url).read()
        assert b'AGPL' in urllib.request.urlopen(url+'LICENSE').read()
        try:urllib.request.urlopen(urllib.request.Request(url,data=b'x',method='POST'))
        except urllib.error.HTTPError as e:assert e.code==501
        else:raise AssertionError('El servidor permite POST')
        print('Portable compilado: aplicación, licencia y servidor de solo lectura correctos.')
    finally:process.terminate();process.wait(timeout=20)
