"""Agregación reproducible de envíos; no entrena modelos ni llama a servicios.

SPDX-License-Identifier: AGPL-3.0-only
"""
from collections import Counter
from datetime import date, datetime
from pathlib import Path
import argparse
import csv
import json


def daily_counts(rows):
    counts = Counter()
    for row in rows:
        value = row.get('Manifest Date')
        if isinstance(value, datetime):
            day = value.date()
        elif isinstance(value, date):
            day = value
        elif isinstance(value, str):
            try:
                day = datetime.fromisoformat(value).date()
            except ValueError:
                raise ValueError('Fecha de envío no válida.') from None
        else:
            raise ValueError('Falta Manifest Date o no es una fecha.')
        station = str(row.get('To StationCode') or 'Sin estación')
        counts[(day.isoformat(), station)] += 1
    return [{'date': day, 'station': station, 'unidad': units}
            for (day, station), units in sorted(counts.items())]


def read_shipments(source):
    source = Path(source)
    if source.suffix.lower() == '.csv':
        with source.open(encoding='utf-8-sig', newline='') as stream:
            yield from csv.DictReader(stream)
    elif source.suffix.lower() == '.xlsx':
        from openpyxl import load_workbook
        book = load_workbook(source, read_only=True, data_only=True, keep_links=False)
        try:
            for sheet in book:
                rows = sheet.iter_rows(values_only=True)
                headers = next(rows, ())
                if 'Manifest Date' not in headers:
                    raise ValueError('La hoja necesita la columna Manifest Date.')
                for values in rows:
                    if any(v is not None for v in values):
                        yield dict(zip(headers, values))
        finally:
            book.close()
    else:
        raise ValueError('Usa CSV o XLSX.')


def aggregate_days(rows):
    counts = Counter()
    for row in rows:
        counts[row['date']] += row['unidad']
    return [{'date': day, 'unidad': units} for day, units in sorted(counts.items())]


def main():
    parser = argparse.ArgumentParser(description='Cuenta envíos por día y estación, sin exportar identificadores.')
    parser.add_argument('input', type=Path)
    parser.add_argument('--output', type=Path, default=Path('test-output/analysis'))
    args = parser.parse_args()
    try:
        rows = daily_counts(read_shipments(args.input))
    except (OSError, ValueError) as error:
        parser.error(str(error))
    if not rows:
        parser.error('No hay registros de envíos.')
    args.output.mkdir(parents=True, exist_ok=True)
    daily = aggregate_days(rows)
    for name, data, fields in [('por-estacion.csv', rows, ['date', 'station', 'unidad']),
                                ('diario.csv', daily, ['date', 'unidad'])]:
        with (args.output/name).open('w', encoding='utf-8', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=fields)
            writer.writeheader()
            # Impedir que nombres de estación se ejecuten como fórmulas en una hoja.
            for item in data:
                safe = {k: ("'"+v if isinstance(v, str) and v.startswith(('=', '+', '-', '@')) else v)
                        for k, v in item.items()}
                writer.writerow(safe)
    report = {'registros': sum(r['unidad'] for r in rows), 'dias': len(daily),
              'estaciones': len({r['station'] for r in rows}),
              'prediccion': False, 'identificadores_exportados': False}
    (args.output/'resumen.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
