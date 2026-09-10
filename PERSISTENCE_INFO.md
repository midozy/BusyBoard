# 💾 BusyBoard Persistence Guide

## ✅ What Persists (Saved in Browser)

### **Automatically Saved:**
1. ✅ **Current Status** - Your selected status (Available, Busy, etc.)
2. ✅ **Custom Message** - Your personalized message text
3. ✅ **Dark Mode** - Light/dark theme preference
4. ✅ **Panel Visibility** - Whether control panel is hidden or shown
5. ✅ **Auto-Reset Settings** - Timer duration and target status
6. ✅ **Auto-Reset Schedule** - Active countdown timer state

### **Storage Location:**
- **Standalone Mode** (`file://`): Browser localStorage
- **Server Mode** (`http://`): Server API + localStorage for UI preferences

## ❌ What Doesn't Persist

### **Fullscreen Mode**
- ⚠️ **Cannot persist** due to browser security restrictions
- Browsers prevent auto-entering fullscreen without user interaction
- This is intentional security behavior (prevents malicious sites from hijacking your screen)
- **Workaround:** Press `F` key after page loads to re-enter fullscreen

## 🔍 How to Verify Persistence

### Test Panel Visibility:
1. Hide the control panel (click `»` or press `P`)
2. Refresh the page (`Cmd+R` or `F5`)
3. ✅ Panel should stay hidden
4. Press `P` to show it again

### Test Dark Mode:
1. Toggle dark mode (click 🌙 or press `D`)
2. Refresh the page
3. ✅ Theme should persist

### Test Status:
1. Change status to "Busy"
2. Add custom message "Back at 3pm"
3. Refresh the page
4. ✅ Status and message should persist

## 🐛 Troubleshooting

### Panel Visibility Not Persisting?

**Check localStorage:**
```javascript
// Open browser console (F12) and run:
localStorage.getItem('busyboard.panelHidden')
// Should return '0' (shown) or '1' (hidden)
```

**Clear and test:**
```javascript
// Clear all BusyBoard data:
localStorage.clear()
// Refresh page and test again
```

### Custom Message Not Persisting?

**In Server Mode:**
- Custom messages are sent to the server API
- Check if `/api/status` endpoint is working:
  ```bash
  curl http://localhost:3000/api/status
  ```

**In Standalone Mode:**
- Check localStorage:
  ```javascript
  localStorage.getItem('busyboard.customMessage')
  ```

## 📝 localStorage Keys Used

```javascript
busyboard.status           // Current status key
busyboard.customMessage    // Custom message text
busyboard.theme            // 'light' or 'dark'
busyboard.panelHidden      // '0' or '1'
busyboard.autoResetMinutes // Timer duration
busyboard.autoResetTarget  // Target status
busyboard.autoResetAt      // Timestamp for reset
```

## 🔒 Privacy Note

All data is stored **locally in your browser** or on your own server. Nothing is sent to external services.

- **Standalone Mode:** 100% local (localStorage only)
- **Server Mode:** Your own server + localStorage for UI preferences
