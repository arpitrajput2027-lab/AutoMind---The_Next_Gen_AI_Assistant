# AutoMind VENOM X Features

This document is based on the current implementation across `backend/`, `frontend/`, tests, and runtime configuration. It lists the project features individually instead of treating the README feature table as the source of truth.

## 1. Natural-Language Assistant

1. **Natural-language command input** - Users can type ordinary instructions instead of memorizing rigid command syntax.
2. **Hindi and English-oriented interaction** - The system prompt and Sarvam speech configuration are designed for Hindi/English commands, including `hi-IN` speech recognition and synthesis.
3. **LLM intent understanding** - The assistant sends the user request, conversation context, and session-file context to the active language model.
4. **Structured JSON planning** - The LLM is instructed to return a `thought`, ordered `plan`, concise `final_response`, and `needs_clarification` flag.
5. **Action validation** - The planner ignores actions that are not present in the registered `VALID_ACTIONS` set.
6. **Parameter normalization** - Common aliases such as `filename`/`path`, `count`/`times`, `file_path`/`filename`, `lang`/`language`, and `task`/`description` are normalized before execution.
7. **Sequential multi-step execution** - A single request can produce multiple actions, which the executor runs in order.
8. **Concise assistant responses** - The assistant prompt targets short responses suitable for both the chat UI and text-to-speech.
9. **Clarifying questions** - Incomplete or ambiguous requests can pause execution and ask the user for one missing detail.
10. **Bounded clarification flow** - Clarification depth is capped by `MAX_INTERACTION_DEPTH` to prevent an endless question loop.
11. **Direct conversational answers** - Knowledge, explanation, coding-help, and general questions can receive an LLM response without desktop actions.
12. **Content expansion for writing requests** - Very short generated text for a `type_text` task is expanded into a longer essay/article using the content generator.
13. **LLM provider switching** - The WebSocket client can switch the active backend model between Gemini and Groq at runtime.
14. **Groq fallback to Gemini** - Groq failures fall back to Gemini for normal requests, code generation, and file-edit generation when Gemini is configured.
15. **Chunked long-output generation** - Code and LLM-assisted file edits support continuation calls when a provider stops because of token limits.
16. **Reasoning-tag cleanup** - Qwen-style `<think>` blocks are stripped from Groq responses before they are used.

## 2. Registered Desktop Actions

Every action below is registered in `backend/core/tool_registry.py` and can be selected by the planner.

### System Control

17. **Increase display brightness** - Raises brightness by a configurable amount, capped at 100%.
18. **Decrease display brightness** - Lowers brightness by a configurable amount, floored at 0%.
19. **Set display brightness** - Sets brightness to a requested 0-100 level.
20. **Increase system volume** - Raises master volume by a configurable amount.
21. **Decrease system volume** - Lowers master volume by a configurable amount.
22. **Set system volume** - Sets master volume to a requested 0-100 level.
23. **Toggle mute** - Mutes or unmutes the default audio endpoint.
24. **Shutdown Windows/Linux** - Schedules a Windows shutdown after five seconds and supports the Linux shutdown command.
25. **Restart Windows/Linux** - Schedules a Windows restart after five seconds and supports the Linux reboot command.
26. **Put Windows to sleep** - Uses the Windows power-management command to suspend the computer.
27. **Lock the screen** - Locks a Windows workstation through `LockWorkStation`.
28. **Type text into the active application** - Uses the clipboard and paste operation for fast, Unicode-safe text entry.
29. **Press Enter repeatedly** - Sends the Enter key a requested number of times.
30. **Interruptible typing** - General text typing checks stop and pause state between lines.

### Application Launch

31. **Open Notepad** - Launches Notepad, waits for its window, focuses the text area, and prepares it for writing.
32. **Write directly in Notepad** - Opens Notepad and types content character by character with cancellation checks.
33. **Open Microsoft Word** - Searches common Office installation paths, launches Word, waits for its window, and focuses the document area.
34. **Open Microsoft Excel** - Launches Excel through the Windows shell.
35. **Open Microsoft PowerPoint** - Launches PowerPoint through the Windows shell.
36. **Open VS Code** - Launches VS Code, optionally with a project path in the underlying tool API.
37. **Open Google Chrome** - Launches Chrome.
38. **Open Microsoft Edge** - Launches Edge.
39. **Open Paint** - Launches Microsoft Paint.
40. **Open Calculator** - Launches Windows Calculator.
41. **Open File Explorer** - Launches Windows File Explorer.
42. **Open Command Prompt** - Launches Command Prompt.
43. **Open Windows Terminal** - Launches Windows Terminal.
44. **Open Task Manager** - Launches Task Manager.
45. **Open Windows Settings** - Opens the `ms-settings:` URI.
46. **Open Control Panel** - Launches Control Panel.
47. **Open Discord** - Attempts to launch Discord through the Windows shell.
48. **Open Spotify** - Attempts to launch Spotify through the Windows shell.
49. **Open Zoom** - Attempts to launch Zoom through the Windows shell.

### File and Code Operations

50. **Create an empty file** - Creates a file at a requested path and records it as the latest session file.
51. **Write or overwrite a text file** - Saves UTF-8 content and updates session context.
52. **Read a text file** - Reads UTF-8 file content for the tool response.
53. **Delete a file** - Removes a file from the filesystem.
54. **Find and replace in text files** - Replaces all matching occurrences in plain-text files such as TXT, HTML, Python, JavaScript, CSS, and JSON.
55. **Find and replace in DOCX files** - Replaces matching text in Word paragraphs and table cells while preserving the document file.
56. **LLM-assisted file editing** - Reads an existing file, applies a natural-language edit instruction through the active LLM, and writes back the complete result.
57. **Edit the last session file** - `last`, `last_file`, or an empty path can resolve to the latest created or modified file.
58. **Generate source code** - Produces complete code from a description in Python, JavaScript, TypeScript, Java, C, C++, or another requested language supported by the LLM prompt.
59. **Save generated code on the Desktop** - Generated code is written to the current user's Desktop with a requested filename.
60. **Open generated code in VS Code** - The generated file is opened automatically when VS Code can be launched.
61. **Generate an HTML website** - Creates an `index.html` file from a natural-language description and opens it in VS Code.

### Web and Search

62. **Open an arbitrary URL** - Opens a supplied URL in the default browser.
63. **Google search** - Opens a Google search URL for the requested query.
64. **YouTube search and first-result launch** - Searches YouTube, extracts the first detected video ID, and opens the video URL.
65. **Webpage text summarization helper** - The backend web tool includes a helper that fetches HTML, extracts early paragraph text with BeautifulSoup, and returns a short excerpt.

### Office Document Generation

66. **Create a formatted Word document** - Generates a DOCX with a title, justified paragraphs, Calibri formatting, footer page text, and professional margins when requested.
67. **Create a PowerPoint presentation** - Generates a PPTX with a title slide and bullet-content slides from structured slide data.
68. **Track generated document context** - DOCX, PPTX, HTML, and code paths are tracked separately in session state for later references.

### Communication

69. **Email draft preview** - An email action interrupts normal execution and sends recipient, subject, body, and sender label to the frontend for review.
70. **Edit email fields before sending** - The preview modal allows changes to recipient, subject, and body.
71. **Confirm or discard an email** - The user must explicitly confirm the preview before the backend sends it through Gmail SMTP over SSL; the modal can also be discarded or closed with Escape.
72. **WhatsApp Web messaging** - Opens WhatsApp Web, finds the search control using image recognition when available, falls back to a keyboard shortcut, selects the contact, types the message, and presses Enter.

### Vision and Smart-Home Actions

73. **Capture a full or regional screenshot** - Uses PyAutoGUI and saves the capture to the configured temporary screenshot path.
74. **Analyze the current screen with Gemini vision** - Captures the screen, sends the image plus optional context to Gemini, returns a textual analysis, and cleans up the temporary image.
75. **Turn a smart-home light on or off** - Calls the Sinric Pro device API using configured credentials and device ID.
76. **Turn a smart-home fan on or off** - Calls the Sinric Pro device API using configured credentials and device ID.

## 3. Execution and Session Behavior

77. **Live execution-step events** - Each completed backend action is emitted to the frontend as an `execution_step` WebSocket message.
78. **Pause an active task** - The frontend can request pause; the executor waits between actions and typing loops while paused.
79. **Resume a paused task** - The frontend can resume the global execution state.
80. **Stop an active task** - Stop requests interrupt the executor, typing loops, or the current WebSocket task where cancellation is possible.
81. **Cancel a previous command when a new one arrives** - A new WebSocket command requests stop and cancels the previous background task.
82. **Persistent rolling conversation memory** - User and assistant messages are stored in `memory.json` and limited to the configured last 10 exchanges.
83. **Clear conversation memory** - The mobile route and legacy desktop UI expose memory clearing.
84. **Last-file session awareness** - The assistant can refer to the most recently created, written, generated, or edited file.
85. **Automatic file previews after execution** - Created or modified files are re-read and emitted to the frontend with a detected type.
86. **Error reporting** - Tool errors, malformed LLM JSON, missing files, missing credentials, and WebSocket errors are converted into visible responses or error messages.

## 4. Voice, Audio, and Avatar

87. **Browser speech recognition input** - The frontend uses the Web Speech API with an Indian English or Hindi-oriented configuration where supported.
88. **Sarvam microphone STT mode** - The browser records microphone audio with `MediaRecorder`, uploads it to `/api/stt`, and auto-sends the returned transcript as a command.
89. **Backend microphone STT mode** - The Python audio module records microphone input with `sounddevice`, writes a temporary WAV file, and sends it to Sarvam speech-to-text.
90. **Sarvam TTS responses** - The backend `/api/tts` endpoint requests `bulbul:v3` audio and returns base64 WAV data for browser playback.
91. **Sarvam TTS chunking** - Long responses are split at sentence boundaries or words before synthesis to stay below the service character limit.
92. **Browser audio playback** - Base64 audio is decoded with the Web Audio API and played through an audio buffer source.
93. **Edge/browser TTS path** - The frontend also contains an alternate TTS hook using the same backend TTS endpoint and a selectable voice mode in the chat UI.
94. **Audio amplitude lip sync** - Analyser-node frequency data drives mouth amplitude while synthesized audio is playing.
95. **3D GLB avatar** - The assistant dashboard renders `public/models/avatar.glb` with Three.js and React Three Fiber.
96. **Procedural avatar movement** - The avatar has subtle breathing and head rotation movement, with a different look direction while thinking.
97. **Avatar state feedback** - Listening, thinking, speaking, and idle states change the avatar window indicator and store state.
98. **Task-based avatar emotions** - Successful or failed tasks map to expressions such as happy, excited, sad, or neutral.
99. **Draggable avatar window** - The floating avatar panel can be repositioned by dragging its header.
100. **Avatar orbit controls** - The 3D view supports restricted rotation while zoom and pan are disabled.

## 5. Frontend User Experience

101. **Landing page** - The Next.js landing page includes hero, features, how-it-works, technology, demo, and footer sections.
102. **Animated command typewriter** - The landing hero cycles through example desktop commands with a typing/deleting animation.
103. **Interactive command simulator** - The landing demo lets users select example commands and watch simulated intent parsing and execution log steps.
104. **Assistant dashboard** - The dashboard combines chat, model selection, voice controls, execution controls, connection state, and the floating avatar.
105. **Chat history UI** - User, assistant, and system messages are shown with timestamps, task labels, success states, and scrolling to the newest message.
106. **Quick command buttons** - Empty chat state shortcuts provide common code, email, WhatsApp, and PowerPoint requests.
107. **Keyboard-friendly command entry** - Enter sends a command and Shift+Enter preserves a newline.
108. **Live thinking indicator** - The chat panel shows an animated assistant indicator while a command is processing.
109. **Execution log panel** - Users can show or hide a step log with pending, running, done, and error visual states.
110. **Connection status indicator** - The dashboard reflects WebSocket connecting, connected, disconnected, and error states.
111. **Automatic WebSocket reconnect** - The main frontend WebSocket hook reconnects after an unintentional disconnect.
112. **Model selector UI** - The sidebar exposes Gemini and Groq selection and reports model-switch events in chat.
113. **File result cards** - Generated or modified files appear as cards with file type icons and an editor link.
114. **Dedicated file editor route** - `/editor` loads a backend file by path and displays its detected type and content.
115. **HTML preview mode** - HTML files can be viewed as rendered `srcDoc` inside a sandboxed iframe.
116. **Code and text view mode** - Non-HTML files and HTML source can be displayed in a readable code/text panel.
117. **Natural-language editor instructions** - The editor sends an instruction to `/api/edit` and refreshes the file content after the LLM edit.
118. **Editor change history** - The editor records applied or failed instructions with timestamps and status icons.
119. **Email review modal** - Email previews use an editable modal with recipient, subject, body, character count, cancel, and confirm controls.
120. **Responsive mobile-oriented controls** - The React dashboard and separate served mobile web app provide browser-based access to desktop commands.

## 6. API, Mobile, and Runtime Support

121. **FastAPI backend server** - Uvicorn serves the assistant API and WebSocket endpoints on the configured host and port.
122. **REST command execution** - `POST /execute` accepts a command object and returns success, response, and execution logs.
123. **WebSocket command execution** - `/ws` and `/ws/{session_id}` accept commands and control messages asynchronously.
124. **WebSocket ping/pong** - Clients can verify a live connection with timestamped ping/pong messages.
125. **Health endpoint** - `GET /health` reports server status, version, active connections, and mobile directory availability.
126. **System status endpoint** - The additional mobile router exposes CPU usage, memory usage, platform, and listening state.
127. **Memory endpoints** - The mobile router exposes current conversation context and a POST endpoint to clear it.
128. **Screenshot endpoint** - The mobile router can request a screenshot and return its path.
129. **Browser-served mobile web app** - The backend serves `backend/mobile/web_app/index.html` and static assets from the mobile server.
130. **Mobile WebSocket reconnection** - The vanilla mobile client retries a connection up to a configured maximum and reports connection loss.
131. **Mobile voice capture** - The served mobile client requests microphone access and uses browser speech recognition when available.
132. **Mobile command shortcuts and visualizer** - The mobile app includes quick actions, a chat view, microphone state, loading state, and canvas visualizer behavior.
133. **Optional desktop GUI entry point** - `backend/main.py` initializes memory, starts the mobile server in a background thread, speaks a welcome message, and launches the desktop GUI when its dependencies are available.
134. **Server-only entry point** - `backend/run_server.py` provides a backend mode without launching the desktop GUI.
135. **Windows-first runtime design** - Desktop application launching, keyboard automation, audio controls, brightness control, and power actions target Windows; availability depends on installed applications and permissions.

## 7. Verification and Developer Support

136. **Tool smoke tests** - Backend test scripts cover system controls, code generation, Word creation, and PowerPoint creation.
137. **Mobile server tests** - Test scripts cover health, home page access, and REST command execution when the server is running.
138. **Vision tests** - The repository includes a dedicated vision test script for screenshot and analysis behavior.
139. **Sarvam integration tests** - The repository includes a Sarvam test script for speech services.
140. **WhatsApp integration test** - The repository includes a WhatsApp-specific test script for the browser automation flow.
141. **API and mobile connection checks** - Additional scripts check backend API behavior and mobile connectivity.
142. **Frontend TypeScript/Next.js tooling** - The frontend includes Next.js, TypeScript, ESLint, Tailwind CSS, Three.js, Zustand, and package scripts for development/build workflows.

## 8. Required or Conditional Integrations

The following features are implemented but require their external dependency or local environment to work:

- Gemini or Groq credentials for LLM features and Gemini vision.
- Sarvam credentials for Sarvam STT/TTS and the configured Sarvam services.
- Gmail address plus an SMTP app password for confirmed email sending.
- A logged-in WhatsApp Web session and a compatible browser screen for message automation.
- Microsoft Office for Word, Excel, and PowerPoint launch or document workflows.
- VS Code, Chrome, Edge, Discord, Spotify, Zoom, and other target applications for their launch actions.
- Sinric Pro credentials and configured device IDs for light and fan controls.
- A microphone, speakers, browser permissions, and compatible browser APIs for voice features.
- Windows permissions and hardware support for brightness, volume, power, and screen automation.

The project is therefore best described as a Windows-focused autonomous desktop control assistant with optional cloud AI, communication, office, voice, vision, and smart-home integrations.