# Distribución · Valverde · análisis de envíos

| Modalidad | Alcance |
| --- | --- |
| Windows | Instalador y portable de la interfaz local |
| Linux | DEB amd64 y TAR.GZ portable de la interfaz local |
| Web | Interfaz estática en Pages y ZIP descargable |
| Web Portable | Servidor local Windows que abre la interfaz en el navegador |
| Android | APK firmado de la interfaz local |

Los paquetes gráficos ejecutan la interfaz de navegador. El análisis de hojas de registros XLSX requiere Python local; la interfaz gráfica usa CSV diario. Las diferencias son explícitas; instalar el contenedor no añade un backend Python a Android.

La Release debe contener nueve paquetes con el prefijo de project.json y SHA256SUMS.txt, según el estándar de la colección. Las claves Android son propias de cada proyecto y se excluyen de Git. No se necesita firmar con una clave nueva en las próximas actualizaciones.

## Estado de verificación

Las pruebas automáticas verifican lógica, carga de interfaz y formatos de paquetes. Las compilaciones Windows, Linux y Android se realizan en sus trabajos de GitHub Actions; cada Release enlaza el resultado. Android no se ha probado en un teléfono físico y no se distribuye por Google Play. Los EXE no tienen firma comercial. Las sumas SHA-256 comprueban integridad, no identidad de una autoridad de firma.

Los recursos históricos excluidos de la licencia original están descritos en NOTICE y THIRD_PARTY.md. Los archivos de fuente conservan el historial previo en GitHub; la fuente ZIP contiene el estado del commit publicado, no una limpieza de la historia.
