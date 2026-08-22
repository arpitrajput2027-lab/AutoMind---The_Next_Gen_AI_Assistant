# tests/test_tools.py - Test All Tools

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.system_tools import set_brightness, set_volume
from tools.vscode_tools import generate_code
from tools.office_tools import create_formatted_word, create_powerpoint
import time

def test_system_controls():
    """Test brightness and volume"""
    print("\n🔆 Testing system controls...")
    
    # Brightness
    result = set_brightness(50)
    print(f"Brightness: {result}")
    
    time.sleep(1)
    
    # Volume
    result = set_volume(30)
    print(f"Volume: {result}")
    
    print("✅ System controls working")

def test_code_generation():
    """Test VS Code automation"""
    print("\n💻 Testing code generation...")
    
    try:
        result = generate_code(
            language="python",
            description="A function to calculate fibonacci numbers",
            file_path="test_fibonacci.py"
        )
        print(f"✅ {result}")
    except Exception as e:
        print(f"❌ Code generation failed: {e}")

def test_word_creation():
    """Test Word document creation"""
    print("\n📄 Testing Word document creation...")
    
    try:
        content = """
This is a test document created by VENOM AI.

It demonstrates automatic formatting with justified text, borders, and page numbers.

This is paragraph 2.
This is paragraph 3.
"""
        result = create_formatted_word("test_document.docx", content)
        print(f"✅ {result}")
    except Exception as e:
        print(f"❌ Word creation failed: {e}")

def test_powerpoint_creation():
    """Test PowerPoint creation"""
    print("\n📊 Testing PowerPoint creation...")
    
    try:
        slides = [
            {"title": "VENOM AI Presentation", "content": ""},
            {"title": "Features", "content": "Voice control\nAI-powered\nMulti-platform"},
            {"title": "Benefits", "content": "Fast\nReliable\nIntelligent"}
        ]
        result = create_powerpoint("test_presentation.pptx", slides)
        print(f"✅ {result}")
    except Exception as e:
        print(f"❌ PowerPoint creation failed: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("VENOM AI - Tools Tests")
    print("=" * 50)
    
    test_system_controls()
    test_code_generation()
    test_word_creation()
    test_powerpoint_creation()
    
    print("\n✅ All tool tests complete!")