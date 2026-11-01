# Instalación · Valverde · análisis de envíos

Web: https://peskysa.github.io/valverde/ . No requiere cuenta ni instalación.

## Aplicación gráfica

Windows: usa el instalador o el portable. Linux: instala el DEB o descomprime el TAR.GZ y ejecuta el binario. Android: el APK firmado requiere permitir la instalación desde el origen elegido; no se publica en Google Play. Web: descomprime el ZIP y sirve su carpeta con un servidor HTTP local, o abre la web publicada. Web Portable: ejecuta el EXE y mantén abierta la ventana mientras usas el navegador; escucha solo en 127.0.0.1.

## Desde código

Requisitos para la interfaz y las pruebas: Node.js 24 y pnpm 11.25.0. Instala con `corepack pnpm install --frozen-lockfile` y prueba con `npm test`. Prepara la web con `npm run build:web`; sirve dist/web con un servidor HTTP local. No sirvas la raíz del repositorio, porque podría contener archivos de trabajo locales.

Para los ejemplos Python usa Python 3.12 o posterior en un entorno por proyecto: `python -m venv .venv`. En Windows usa el intérprete de .venv\Scripts\python.exe; en Linux .venv/bin/python. Instala con `python -m pip install -r requirements.txt`. Sigue el manual para el comando específico.

Los ejemplos Flask escuchan solo en localhost y no deben exponerse como servidor de producción. No se requiere contratar servicios ni introducir claves.
