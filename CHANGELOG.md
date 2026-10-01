# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-10-01

### Added
- `pills_icons_only` option on the compact card — collapses the status pills to
  circular icon-only badges (the full state text stays available on hover).

### Changed
- Compact card header redesign: vehicle name and odometer sit on the left, the
  cost/100km badge is right-aligned, and the connection badge was removed for a
  cleaner header.
- Compact card EV layout now uses an auto-sized image column so EV-only and
  battery+fuel cards keep a consistent height.
- Compact card vehicle image height is capped so cards of different vehicles line
  up evenly side by side.
- Status pills wrap to the next line instead of overflowing on narrow layouts.

## [1.0.0] - 2026-10-01

### Added
- Initial release.
- `stellantis-vehicle-card` — a purpose-built full dashboard card for Stellantis vehicles
  (Citroën / Peugeot / Opel / DS / Fiat) via the
  [homeassistant-stellantis-vehicles](https://github.com/andreadegiovine/homeassistant-stellantis-vehicles)
  integration. Hero layout with the vehicle image flanked by battery (and fuel) gauges,
  live charging animation, charging strip (rate, ready-by time, target), a cost/100km
  highlight band with savings vs a configurable fuel baseline, status chips, vehicle
  detail stats, and climate/wake remote controls.
- `stellantis-vehicle-compact-card` — a compact status card centered on the vehicle image,
  with a cost badge in the header, battery/fuel metrics, charging strip, status pills,
  state-based accent glow, and a configurable icon-badge direction.
- `hide_fuel` option for EV-only vehicles (hides the fuel gauge and rebalances the layout).
- Fully configurable `entities`, `image`, `title`, `eyebrow`, `subtitle`, `save_label`,
  and `fuel_baseline` so a single card type serves any Stellantis vehicle.
