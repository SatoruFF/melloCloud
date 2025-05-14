import os
import re

# Layers that should follow the public API import rule
LAYERS = ["entities", "features", "shared", "widgets", "pages"]
SRC_DIR = "./../src" # refactor if folder will be changed

# Regex to match import statements
IMPORT_RE = re.compile(r"import\s+[^'\"\n]+\s+from\s+['\"]([^'\"]+)['\"]")

def is_violation(import_path: str) -> bool:
    """
    Checks if the import path violates the public API rule.
    For example, 'entities/User/model/schema' is a violation.
    """
    parts = import_path.split('/')
    if parts[0] not in LAYERS:
        return False  # External or irrelevant import
    if len(parts) > 2 and parts[2] != 'index':
        return True  # Deep import — should be avoided
    return False

def check_file(file_path: str):
    """
    Scans a file for import statements that violate the rule.
    Returns a list of (line_number, import_path) for violations.
    """
    violations = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f.readlines(), start=1):
            match = IMPORT_RE.search(line)
            if match:
                import_path = match.group(1)
                if import_path.startswith('.') or import_path.startswith('@/'):
                    continue  # Local or alias import — skip
                if is_violation(import_path):
                    violations.append((idx, import_path))
    return violations

def main():
    violations_found = {}

    # Walk through the src directory and check each relevant file
    for root, _, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path)
                violations = check_file(full_path)
                if violations:
                    violations_found[rel_path] = violations

    # Print the results
    if violations_found:
        print("🔍 Public API violations found:\n")
        for file, entries in violations_found.items():
            print(f"File: {file}")
            for line_num, path in entries:
                print(f"  Line {line_num}: import {path}")
            print()
    else:
        print("✅ All imports follow the public API rule.")

if __name__ == "__main__":
    main()
