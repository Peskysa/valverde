# Desarrollo · Valverde · análisis de envíos

1. Node.js 24 y pnpm 11.25.0: `corepack pnpm install --frozen-lockfile`.
2. `npm test` ejecuta las pruebas de lógica y estructura.
3. `npm run build:web` prepara dist/web, con manual y licencias.
4. `npx playwright install chromium` y `npm run test:browser` comprueban la interfaz real en escritorio y móvil, validación, errores de JavaScript y enlaces locales.
5. Con Python 3.12 y las dependencias de requirements.txt cuando exista: `python -m unittest discover -s tests -p "test_*.py"`.

Los scripts no ejecutan notebooks históricos ni trabajos ajenos automáticamente. No subas archivos .env, entornos, claves, datos personales o archivos de pruebas.

La aplicación gráfica usa un contenedor Electron con integración Node desactivada y contexto aislado. Android usa WebView local con acceso a archivos restringido. Los procesadores originales Python se mantienen para sus formatos propios; la interfaz multiplataforma procesa los formatos indicados en el manual.
La etiqueta de versión debe coincidir con project.json y package.json. La publicación verifica el conjunto esperado antes de hacerlo público. La Release incluye fuentes del mismo commit y sumas SHA-256.
