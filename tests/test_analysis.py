from datetime import datetime
from pathlib import Path
import tempfile
import unittest
from openpyxl import Workbook
from analysis import aggregate_days, daily_counts, read_shipments

class AnalysisTest(unittest.TestCase):
    def test_aggregate(self):
        source = [{'Manifest Date': datetime(2026, 1, 1, 10), 'To StationCode': 'DEMO-A'},
                  {'Manifest Date': '2026-01-01T12:00:00', 'To StationCode': 'DEMO-B'},
                  {'Manifest Date': '2026-01-02', 'To StationCode': 'DEMO-A'}]
        result = daily_counts(source)
        self.assertEqual(aggregate_days(result), [{'date': '2026-01-01', 'unidad': 2},
                                                  {'date': '2026-01-02', 'unidad': 1}])
        self.assertEqual(sum(r['unidad'] for r in result), 3)

    def test_invalid(self):
        for record in [{}, {'Manifest Date': 'mal'}, {'Manifest Date': 123}]:
            with self.assertRaises(ValueError):
                daily_counts([record])

    def test_workbook(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'demo.xlsx'
            book = Workbook()
            book.active.append(['Manifest Date', 'To StationCode', 'Connote #'])
            book.active.append([datetime(2026, 1, 1), 'DEMO-A', 'NOT-EXPORTED'])
            book.save(path)
            result = daily_counts(read_shipments(path))
            self.assertNotIn('NOT-EXPORTED', str(result))
            self.assertEqual(result[0]['unidad'], 1)

if __name__ == '__main__':
    unittest.main()
