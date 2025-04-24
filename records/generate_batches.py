import json, re, os

# === CONFIGURE THESE ===
input_files = [
    'records-5.json',
    'records-6.json'
]
table_name   = 'CloudDictionary'
chunk_size   = 25   # DynamoDB batch-write-item max

# === Helpers ===
def clean_json(raw):
    # strip JS-style comments
    raw = re.sub(r'//.*', '', raw)
    # remove trailing commas
    raw = re.sub(r',\s*([}\]])', r'\1', raw)
    return raw

# === Load & Merge ===
all_requests = []
for fname in input_files:
    with open(fname, 'r', encoding='utf-8') as f:
        raw = f.read()
    data = json.loads(clean_json(raw))
    all_requests.extend(data['CloudDictionary'])

# === Split into batches & write ===
batches = [all_requests[i : i+chunk_size]
           for i in range(0, len(all_requests), chunk_size)]

for idx, batch in enumerate(batches, start=1):
    out = { table_name: batch }
    out_name = f'batch_{idx}.json'
    with open(out_name, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2)
    print(f'Created {out_name}')
