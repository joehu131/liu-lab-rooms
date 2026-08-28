# LiU Lab Rooms (Campus Valla)

A fast, mobile-friendly web app showing real-time computer lab availability at Linköping University Campus Valla.

Built for LiU students looking for an open Linux or Windows lab between classes or late at night.

## Features

- **Live Availability**: Displays whether each of the 42 computer labs on Campus Valla is free, ending soon, or occupied.
- **Framtida Salstillgång**: Pick any day and time over the next 14 days to see upcoming room schedules before heading to campus.
- **Smart Sorting**: Prioritizes rooms that are free all day with ample workstations ($\ge 10$ computers).
- **Campus Navigation**: Direct links to Mazemap indoor navigation for every lab.
- **Filters & Search**: Filter by OS (Linux/Windows), building (B-huset, A-huset, E-huset, Key, Fysikhuset, Studenthuset), or free-only.
- **Dark & Light Mode**: Clean aesthetic with dual themes.
- **Zero Maintenance**: Queries TimeEdit's persistent JSON endpoint directly with edge caching. No calendar links or manual semester updates needed.

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

## Deployment

Deploy directly to Vercel (Free Tier):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

The app uses Next.js Route Handlers with Edge CDN caching headers (`Cache-Control: public, s-maxage=900`) to minimize TimeEdit upstream requests while keeping client-side availability evaluations real-time.
