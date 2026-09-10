# 🔄 Cross-Device Synchronization

## ✨ What Syncs Across Devices

When running in **Server Mode** (http://), BusyBoard now syncs the following across ALL connected devices:

### 📱 **Synced Settings:**
1. ✅ **Status** - Current status (Available, Busy, etc.)
2. ✅ **Custom Message** - Your personalized message
3. ✅ **Panel Visibility** - Control panel hidden/shown state
4. ✅ **Dark Mode** - Light/dark theme preference

### 🎯 **Use Case Example:**

**Main Display (Desktop):**
- Shows BusyBoard in fullscreen
- Panel hidden for clean display

**Remote Control (Mobile):**
- Open same URL on phone
- Change status → Updates main display instantly
- Hide panel → Main display panel hides too
- Toggle dark mode → Main display theme changes

## 🚀 How It Works

### **Server Mode** (`http://`)
- All UI preferences stored on server
- Polls every 1.5 seconds for updates
- Changes sync across all devices
- Perfect for office door displays

### **Standalone Mode** (`file://`)
- Uses localStorage (per-device)
- No synchronization
- Perfect for personal use

## 📋 Setup Instructions

### 1. Start the Server
```bash
node server.js
```

### 2. Open on Main Display
```
http://localhost:3000
```
- Press `F` for fullscreen
- Press `P` to hide panel
- Clean display mode activated

### 3. Open on Mobile
```
http://YOUR_IP:3000
```
(IP shown in server startup message)

### 4. Control from Mobile
- Change status → Main display updates
- Hide/show panel → Main display syncs
- Toggle dark mode → Main display syncs
- Add custom message → Main display syncs

## ⚡ Real-Time Updates

**Polling Interval:** 1.5 seconds

Changes appear on other devices within:
- ✅ Status changes: ~1.5s
- ✅ Panel visibility: ~1.5s
- ✅ Theme changes: ~1.5s
- ✅ Custom messages: ~1.5s

## 🔍 Testing Cross-Device Sync

### Test Panel Sync:
1. Open BusyBoard on two devices
2. On device 1: Hide panel (press `P`)
3. Wait 1-2 seconds
4. ✅ Device 2 panel should hide automatically

### Test Theme Sync:
1. Open BusyBoard on two devices
2. On device 1: Toggle dark mode (press `D`)
3. Wait 1-2 seconds
4. ✅ Device 2 should switch to dark mode

### Test Status Sync:
1. Open BusyBoard on two devices
2. On device 1: Change status to "Busy"
3. Wait 1-2 seconds
4. ✅ Device 2 should show "Busy"

## ⚠️ What Doesn't Sync

### **Fullscreen Mode**
- ❌ Cannot sync across devices
- Browser security prevents remote fullscreen activation
- Each device must enter fullscreen manually (press `F`)

### **Auto-Reset Timer**
- ⚠️ Timer settings are per-device (localStorage)
- Timer countdown doesn't sync
- Only the final status change syncs

## 🛠️ Troubleshooting

### Panel Not Syncing?

**Check server is running:**
```bash
# Should see server startup message
node server.js
```

**Check API endpoint:**
```bash
curl http://localhost:3000/api/status
# Should return JSON with panelHidden field
```

**Check browser console:**
```javascript
// Open DevTools (F12) and check for errors
// Should see polling requests every 1.5s
```

### Theme Not Syncing?

**Verify server state:**
```bash
curl http://localhost:3000/api/status
# Check "theme" field is "light" or "dark"
```

**Test manual update:**
```bash
curl -X POST http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark"}'
```

### Slow Updates?

**Normal behavior:**
- Updates poll every 1.5 seconds
- Expect 1-2 second delay

**If slower:**
- Check network connection
- Check server isn't overloaded
- Check browser console for errors

## 📊 API Reference

### GET /api/status
Returns current state:
```json
{
  "status": "busy",
  "customMessage": "Back at 3pm",
  "panelHidden": false,
  "theme": "dark"
}
```

### POST /api/status
Update any field:
```json
{
  "status": "busy",           // optional
  "customMessage": "...",     // optional
  "panelHidden": true,        // optional
  "theme": "dark"             // optional
}
```

## 🎯 Best Practices

### For Office Door Display:
1. **Main Display:**
   - Fullscreen mode (`F`)
   - Panel hidden (`P`)
   - Dark mode for better visibility

2. **Remote Control:**
   - Keep panel visible
   - Bookmark URL on phone
   - Add to home screen (PWA)

### For Team Rooms:
1. **Shared Display:**
   - Mount tablet on wall
   - Fullscreen + panel hidden
   - Dark mode in evening

2. **Team Members:**
   - Everyone uses same URL
   - Any member can update status
   - Changes visible to all

## 🔐 Privacy & Security

- All data stays on your local network
- No external services
- No data collection
- Server runs on your machine
- CORS enabled for local network only

## 🚀 Deployment Notes

### Vercel Deployment:
- ⚠️ Serverless functions are stateless
- State persists only during function lifetime
- For production, add Vercel KV or database
- See `VERCEL_SETUP.md` for details

### Local Network:
- ✅ Full persistence with `.status.json`
- ✅ Survives server restarts
- ✅ Perfect for office use
