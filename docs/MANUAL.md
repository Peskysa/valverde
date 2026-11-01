# Manual · Valverde · análisis de envíos

La interfaz gráfica agrega una serie CSV con columnas date,unidad. Usa fechas ISO AAAA-MM-DD y unidades enteras no negativas. Puedes pegar el contenido o importar un archivo de hasta 2 MB / 5000 filas. Pulsa Analizar para sumar fechas repetidas, ordenar los días, ver el total y la media, consultar el gráfico y descargar el CSV agregado. No se interpolan días ausentes y no se hacen predicciones. La separación visual entre puntos del gráfico es por orden de registro.

El análisis Python conserva el enfoque de trabajo con hojas de envíos: `python analysis.py Peski.xlsx --output test-output/analysis`. Acepta XLSX con varias hojas o CSV de registros, con columnas Manifest Date y To StationCode. Genera diario.csv, por-estacion.csv y resumen.json; no exporta identificadores de envío. El CSV diario resultante puede abrirse en la interfaz gráfica.

Peski.xlsx contiene ahora **420 registros totalmente sintéticos**, no datos comerciales reales. El cuaderno 00_analisis_reproducible.ipynb reproduce la agregación. Los siete cuadernos de 2022 se conservan como referencia con salidas borradas y no se presentan como modelos actuales validados. No se reinstala automáticamente el antiguo entorno de aprendizaje automático.
