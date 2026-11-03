import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text nahi mila" },
        { status: 400 }
      );
    }

    // Text clean karo — special characters remove karo
    const cleanText = text
      .replace(/['"]/g, "")
      .replace(/\n/g, " ")
      .trim()
      .substring(0, 500); // Max 500 characters

    // Prefer project venv Python (has upgraded edge-tts), fall back to system python
    const scriptPath = path.join(process.cwd(), "tts.py");
    const venvPython = path.join(process.cwd(), "..", "backend", "venv", "Scripts", "python.exe");
    const pythonBin = process.env.TTS_PYTHON || venvPython;
    const pythonCandidates = [pythonBin, "python"];

    let stdout = "";
    let lastErr: unknown = null;
    for (const bin of pythonCandidates) {
      try {
        const result = await execFileAsync(bin, [scriptPath, cleanText], {
          timeout: 45000,
          windowsHide: true,
        });
        stdout = result.stdout;
        if (stdout?.trim()) break;
        lastErr = result.stderr || "empty audio";
      } catch (err) {
        lastErr = err;
      }
    }

    if (!stdout?.trim()) {
      console.error("TTS Python Error:", lastErr);
      return NextResponse.json(
        { error: "TTS generate nahi hua" },
        { status: 500 }
      );
    }

    return NextResponse.json({ audio: stdout.trim() });

  } catch (error) {
    console.error("TTS Route Error:", error);
    return NextResponse.json(
      { error: "TTS server error" },
      { status: 500 }
    );
  }
}