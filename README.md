# Sinister-Six-Digital-Signage

This is our awesome group 6 repository for our CS 3250 assignment! We can update the name and description once we settle in.

## Raspberry Pi Setup

### Prerequisites

- Raspberry Pi with Raspberry Pi OS (Desktop)
- Chromium browser (pre-installed on Raspberry Pi OS)
- Python 3 (pre-installed on Raspberry Pi OS)

### Installation

1. Clone the repository onto the Pi:

   ```bash
   git clone https://github.com/CS-3250-SinisterSix/Sinister-Six-Digital-Signage.git
   cd Sinister-Six-Digital-Signage
   ```

2. Make the launcher script executable:

   ```bash
   chmod +x start-signage.sh
   ```

3. Test it manually:

   ```bash
   ./start-signage.sh
   ```

   Press `Alt+F4` (or `Ctrl+C` in the terminal) to exit kiosk mode.

### Autostart on Boot (Desktop Entry)

Copy the provided desktop entry to the autostart directory:

```bash
mkdir -p ~/.config/autostart
cp signage.desktop ~/.config/autostart/
```

Edit `~/.config/autostart/signage.desktop` if the repo is cloned to a path other than `/home/pi/Sinister-Six-Digital-Signage`.

The signage app will now launch automatically when the Pi boots into desktop.

### Disable Screen Blanking

To prevent the screen from going to sleep:

```bash
sudo raspi-config
```

Navigate to **Display Options** > **Screen Blanking** > **No**.

Alternatively, add to `/etc/xdg/lxsession/LXDE-pi/autostart`:

```
@xset s off
@xset -dpms
@xset s noblank
```

### Weather Configuration

The weather location is set in `config.json`:

```json
{
  "weather": {
    "enabled": true,
    "location": "Denver, CO",
    "units": "fahrenheit"
  }
}
```

Since the Raspberry Pi has no GPS hardware and browser geolocation is unavailable, the app uses this configured location as a fallback. The geolocation checkbox is unchecked by default.

Users can still type a city name into the weather input field to override the configured location.
