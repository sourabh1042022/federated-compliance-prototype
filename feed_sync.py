import json
import os
import shutil

SOURCE_FILE = os.path.expanduser("~/Desktop/mock_feed.json")
DEST_DIR = "./regulatory_feed"
DEST_FILE = os.path.join(DEST_DIR, "fetched_rules.json")

os.makedirs(DEST_DIR, exist_ok=True)
shutil.copy(SOURCE_FILE, DEST_FILE)

print(f"✔️ Regulatory feed updated from {SOURCE_FILE}")
