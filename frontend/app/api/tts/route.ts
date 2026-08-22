import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

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

    // Python script ka path
    const scriptPath = path.join(process.cwd(), "tts.py");

    // Python script run karo
    const { stdout, stderr } = await execAsync(
      `python "${scriptPath}" "${cleanText}"`,
      { timeout: 30000 } // 30 second timeout
    );

    if (stderr && !stdout) {
      console.error("TTS Python Error:", stderr);
      return NextResponse.json(
        { error: "TTS generate nahi hua" },
        { status: 500 }
      );
    }

    const audioBase64 = stdout.trim();

    if (!audioBase64) {
      return NextResponse.json(
        { error: "Audio empty aaya" },
        { status: 500 }
      );
    }

    return NextResponse.json({ audio: audioBase64 });

  } catch (error) {
    console.error("TTS Route Error:", error);
    return NextResponse.json(
      { error: "TTS server error" },
      { status: 500 }
    );
  }
}