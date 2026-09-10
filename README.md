# 🚦 BusyBoard — Office Door Status Display

A modern, elegant web application for displaying office door status with remote control capabilities. Perfect for offices, meeting rooms, or any space where you need to communicate availability.

![BusyBoard Preview](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 📊 **9 Status Types**
- ✓ **Available** — Come on in
- ● **Busy** — Please knock first
- ◆ **In Meeting** — In a meeting
- 🚶 **In Physical Meeting** — In a physical meeting
- ★ **Executive Meeting** — Executive meeting in progress
- ☎ **Teams Call** — On a Teams call
- ◐ **Focus Work** — Deep focus — minimal interruptions
- ⛔ **Do Not Disturb** — Do not disturb
- ○ **Away** — Away from desk

### 🎯 **Core Features**
- **💬 Custom Messages** — Add personalized notes like "Back at 3pm" or "On lunch break"
- **⏰ Auto-Reset Timer** — Automatically revert to a chosen status after 5min-2hrs
- **🌓 Dark Mode** — Easy on the eyes with automatic theme switching
- **⌨️ Keyboard Shortcuts** — Quick status changes with number keys (1-9)
- **📱 Remote Control** — Control from any device on your network
- **🔄 Real-Time Sync** — Status updates across all connected devices
- **💾 Persistent State** — Status survives page refreshes and server restarts
- **🖥️ Fullscreen Mode** — Perfect for dedicated displays

### 🎨 **UI/UX**
- Beautiful gradient backgrounds for each status
- Smooth transitions and animations
- Responsive design (desktop, tablet, mobile)
- Live clock and date display
- Character counter for custom messages (60 char limit)
- Emoji support 😊

## 🚀 Quick Start

### **Standalone Mode** (No Server Required)
Perfect for single-device use with localStorage persistence.

```bash
# Just open the HTML file in your browser
open index.html
```

### **Server Mode** (Multi-Device Sync)
Run a Node.js server to sync status across multiple devices.

```bash
# Start the server
node server.js

# Access from:
# - This machine: http://localhost:3000
# - Other devices: http://YOUR_IP:3000
```

The server will display your local IP address for remote access.

## 📋 Requirements

- **Standalone Mode**: Any modern web browser
- **Server Mode**: Node.js (no additional dependencies required)

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-9` | Set status (Available, Busy, Meeting, etc.) |
| `F` | Toggle fullscreen |
| `D` | Toggle dark mode |
| `P` | Show/hide control panel |

## 🎨 Customization

### Adding New Statuses
Edit `app.js` and add to the `STATUSES` array:

```javascript
{ 
  key: 'custom', 
  label: 'Custom Status', 
  icon: '🎯', 
  color: '--c-custom', 
  note: 'Your custom note', 
  key_num: '0' 
}
```

Then add the color variable in `styles.css`:

```css
--c-custom: #your-color-hex;
```

### Changing Colors
All status colors are defined as CSS variables in `styles.css`:

```css
:root {
  --c-available: #1e9e5a;
  --c-busy: #e0792e;
  /* ... customize as needed */
}
```

## 🏗️ Architecture

### **Frontend** (`app.js`)
- Vanilla JavaScript (no frameworks)
- localStorage for standalone persistence
- 1.5s polling for server sync
- CSS custom properties for dynamic theming

### **Backend** (`server.js`)
- Node.js HTTP server (zero dependencies)
- REST API: `GET/POST /api/status`
- CORS-enabled for network access
- Persists to `.status.json`

### **API Endpoints**

#### Get Status
```bash
GET /api/status
Response: {"status": "busy", "customMessage": "Back at 3pm"}
```

#### Update Status
```bash
POST /api/status
Body: {"status": "busy", "customMessage": "Back at 3pm"}
Response: {"status": "busy", "customMessage": "Back at 3pm"}
```

## 📁 Project Structure

```
BusyBoard/
├── index.html      # Main UI structure
├── app.js          # Client-side logic
├── server.js       # Node.js server (optional)
├── styles.css      # Complete styling
├── .status.json    # Persistent status (auto-generated)
└── README.md       # This file
```

## 🔧 Configuration

### Environment Variables (Server Mode)
```bash
PORT=3000 node server.js  # Change default port
```

### localStorage Keys (Standalone Mode)
- `busyboard.status` — Current status
- `busyboard.customMessage` — Custom message text
- `busyboard.theme` — Light/dark preference
- `busyboard.panelHidden` — Panel visibility
- `busyboard.autoResetMinutes` — Timer duration
- `busyboard.autoResetTarget` — Target status
- `busyboard.autoResetAt` — Scheduled reset timestamp

## 🎯 Use Cases

- **Office Doors** — Display on a tablet outside your office
- **Meeting Rooms** — Show room availability
- **Home Office** — Let family know when you're busy
- **Co-working Spaces** — Communicate availability to colleagues
- **Remote Teams** — Share status with distributed team members

## 🛠️ Development

### Running Locally
```bash
# Clone the repository
git clone https://github.com/yourusername/BusyBoard.git
cd BusyBoard

# Option 1: Open directly in browser
open index.html

# Option 2: Run with server
node server.js
```

### Testing
- Test standalone mode by opening `index.html` directly
- Test server mode by running `node server.js`
- Test remote access from another device on your network

## 📝 License

MIT License — Feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🙏 Acknowledgments

Built with ❤️ for better office communication.

---

**Made with [Devin](https://devin.ai)**
