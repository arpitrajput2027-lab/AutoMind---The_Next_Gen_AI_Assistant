# tests/run_all_tests.py - Run All Tests

import subprocess
import sys
import os

tests = [
    "test_sarvam.py",
    "test_vision.py",
    "test_tools.py",
    # "test_mobile.py"  # Requires server running
]

def run_test(test_file):
    """Run a single test file"""
    print(f"\n{'=' * 60}")
    print(f"Running: {test_file}")
    print('=' * 60)
    
    result = subprocess.run(
        [sys.executable, test_file],
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    
    return result.returncode == 0

if __name__ == "__main__":
    print("🚀 VENOM AI - Running All Tests")
    
    results = {}
    for test in tests:
        results[test] = run_test(test)
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test:30} {status}")
    
    print("=" * 60)