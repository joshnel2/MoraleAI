import json
import argparse
import os
from typing import List, Dict


def load_jsonl(path: str) -> List[Dict]:
	items = []
	with open(path, 'r') as f:
		for line in f:
			line = line.strip()
			if not line:
				continue
			items.append(json.loads(line))
	return items


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('--input', required=True, help='Input folder containing chat.jsonl and kpis.jsonl')
	parser.add_argument('--output', required=True, help='Output folder for dataset.jsonl')
	args = parser.parse_args()

	chats = load_jsonl(os.path.join(args.input, 'chat.jsonl'))
	kpis = load_jsonl(os.path.join(args.input, 'kpis.jsonl'))

	kpi_by_period = {}
	for k in kpis:
		key = (k.get('kpiName'), k.get('period'))
		kpi_by_period.setdefault(key, []).append(k)

	merged = []
	for c in chats:
		period = c.get('period')
		row = {
			'anon_id': c.get('employeeAnonymizedId'),
			'content': c.get('text'),
			'emotions': c.get('emotionalState', {}),
			'opinions': c.get('opinions', {}),
			'period': period,
			'metrics': kpi_by_period.get(('sales', period), [])
		}
		merged.append(row)

	os.makedirs(args.output, exist_ok=True)
	out_path = os.path.join(args.output, 'dataset.jsonl')
	with open(out_path, 'w') as f:
		for m in merged:
			f.write(json.dumps(m) + '\n')
	print(f'Wrote {len(merged)} rows to {out_path}')


if __name__ == '__main__':
	main()