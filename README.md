# LiU Lab Rooms (Campus Valla)

A fast, mobile-friendly web app showing real-time computer lab availability at Linköping University Campus Valla.

<p align="center">
  <img src="resources/screenshots/webapp.png" alt="LiU Lab Rooms Web App" width="650" style="max-width: 100%; height: auto;" />
</p>

## Features

- **Live Availability**: Displays whether each of the 42 computer labs on Campus Valla is free, ending soon, or occupied.
- **Framtida Salstillgång**: Pick any day and time over the next 14 days to see upcoming room schedules.
- **Campus Navigation**: Direct links to Mazemap indoor navigation for every lab.
- **Filters & Search**: Filter by OS (Linux/Windows), building (B-huset, A-huset...), or free-only.
- **Zero Maintenance**: Queries TimeEdit's persistent JSON endpoint directly with edge caching. 

## Labs Included (42 Total)

- **22 Linux Labs** (B-huset): Asgård, Bakdörren, Brandväggen, Egypten, Multicore, Olympen, Resistorn, SU00–SU04, SU10–SU14, SU15/16, SU17/18, SU24, SU25, Vippan.
- **20 Windows Labs**: Alfheim, Bifrost, Elivågor, F302 (Fysikhuset), Fahlstedt (Key), Franklin (B-huset), Gimle, Glase, Glitner, Jotunheim, Medielab (Key), Nobelsalen, PC1–PC5 (E-huset), SH4162 (Studenthuset), Valhall, Vanheim.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run test suite
npm test

# Build for production
npm run build
```