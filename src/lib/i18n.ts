export type Language = 'sv' | 'en';

export const translations = {
  sv: {
    // Header
    appTitle: 'LiU Labbsalar',
    campusValla: 'CAMPUS VALLA',
    refreshSchedule: 'Uppdatera schema',
    aboutTitle: 'Om LiU Labbsalar',
    themeToggle: 'Växla färgtema',
    langToggle: 'Byt språk till engelska',

    // Hero Clock & Live status
    liveStatus: (free: number, total: number) => `LIVE • ${free} AV ${total} DATORSALAR LEDIGA JUST NU`,
    simulatingStatus: (date: string, time: string, free: number, total: number) =>
      `SIMULERAR: ${date} ${time} • ${free} / ${total} SALAR LEDIGA`,
    loadingStatus: 'HÄMTAR SALSTILLGÅNG FRÅN TIMEEDIT...',
    resetLive: 'Återställ',
    resetLiveTitle: 'Återgå till realtid',

    // Filter Bar
    allPill: (count: number) => `Alla (${count})`,
    linuxPill: (count: number) => `Linux (${count})`,
    windowsPill: (count: number) => `Windows (${count})`,
    futureBtn: 'Framtida tid/dag',
    onlyAvailable: 'Endast lediga',
    allBuildings: 'Alla byggnader',
    selectedBuildingsCount: (count: number) => `${count} byggnader`,
    filterMobileBtn: 'Filter',
    searchPlaceholder: 'Sök sal...',
    resetFilters: 'Återställ filter',
    done: 'Klar',

    // Room List & Rows
    occupiedHeader: 'Upptagna salar:',
    allDayFree: 'Hela dagen',
    allDayFreeTooltip: 'Ledig hela dagen',
    freeUntilTooltip: (time: string, mins: string) => `Ledig till ${time} (${mins} kvar)`,
    busyUntilTooltip: (time: string, course?: string) =>
      `Upptagen till ${time}${course ? ` (${course})` : ''}`,
    busyUntil: (time: string) => time,
    busyNow: 'Upptagen',
    busySoon: 'Snart upptagen',
    computers: 'datorer',
    seats: 'sittplatser',
    floor: 'Plan',
    openMazemap: 'Öppna i Mazemap',
    findOnMazemap: (room: string) => `Hitta ${room} på Mazemap`,
    roomSchedule: 'Salsschema (07:00 – 21:00)',
    bookingsTitle: (count: number) => `Bokningar (${count}):`,
    noBookingsToday: 'Inga bokningar under dagen • Salen är ledig hela dagen',
    noRoomsMatch: 'Inga salar matchar dina valda filter',
    noRoomsMatchSub: 'Prova att ändra operativsystem, byggnad eller sökord.',

    // Time Machine Modal
    timeMachineTitle: 'Framtida saltillgång',
    timeMachineSub: 'Simulera salsbeläggning vid vald tidpunkt och dag (14-dagars fönster)',
    selectDay: 'Välj dag',
    today: 'Idag',
    tomorrow: 'Imorgon',
    lecturePasses: 'Lektionspass',
    exactTime: 'Exakt tid',
    cancel: 'Avbryt',
    simulateAction: (day: string, time: string) => `Simulera ${day} ${time}`,

    // Footer
    footerText: 'Linköping University • TimeEdit',
  },
  en: {
    // Header
    appTitle: 'LiU Computer Labs',
    campusValla: 'CAMPUS VALLA',
    refreshSchedule: 'Refresh schedule',
    aboutTitle: 'About LiU Lab Rooms',
    themeToggle: 'Toggle color theme',
    langToggle: 'Switch language to Swedish',

    // Hero Clock & Live status
    liveStatus: (free: number, total: number) => `LIVE • ${free} OF ${total} COMPUTER LABS AVAILABLE NOW`,
    simulatingStatus: (date: string, time: string, free: number, total: number) =>
      `SIMULATING: ${date} ${time} • ${free} / ${total} LABS FREE`,
    loadingStatus: 'FETCHING LAB AVAILABILITY FROM TIMEEDIT...',
    resetLive: 'Reset',
    resetLiveTitle: 'Return to live time',

    // Filter Bar
    allPill: (count: number) => `All (${count})`,
    linuxPill: (count: number) => `Linux (${count})`,
    windowsPill: (count: number) => `Windows (${count})`,
    futureBtn: 'Future time/day',
    onlyAvailable: 'Available only',
    allBuildings: 'All buildings',
    selectedBuildingsCount: (count: number) => `${count} buildings`,
    filterMobileBtn: 'Filter',
    searchPlaceholder: 'Search lab...',
    resetFilters: 'Reset filters',
    done: 'Done',

    // Room List & Rows
    occupiedHeader: 'Occupied labs:',
    allDayFree: 'All day',
    allDayFreeTooltip: 'Available all day',
    freeUntilTooltip: (time: string, mins: string) => `Available until ${time} (${mins} remaining)`,
    busyUntilTooltip: (time: string, course?: string) =>
      `Occupied until ${time}${course ? ` (${course})` : ''}`,
    busyUntil: (time: string) => time,
    busyNow: 'Occupied',
    busySoon: 'Busy soon',
    computers: 'computers',
    seats: 'seats',
    floor: 'Floor',
    openMazemap: 'Open in Mazemap',
    findOnMazemap: (room: string) => `Find ${room} on Mazemap`,
    roomSchedule: 'Lab Schedule (07:00 – 21:00)',
    bookingsTitle: (count: number) => `Bookings (${count}):`,
    noBookingsToday: 'No bookings scheduled • Room is free all day',
    noRoomsMatch: 'No lab rooms match your selected filters',
    noRoomsMatchSub: 'Try changing your OS, building filter, or search query.',

    // Time Machine Modal
    timeMachineTitle: 'Future Lab Availability',
    timeMachineSub: 'Simulate computer lab occupancy at any chosen date and time (14-day window)',
    selectDay: 'Select day',
    today: 'Today',
    tomorrow: 'Tomorrow',
    lecturePasses: 'Lecture Passes',
    exactTime: 'Exact time',
    cancel: 'Cancel',
    simulateAction: (day: string, time: string) => `Simulate ${day} ${time}`,

    // Footer
    footerText: 'Linköping University • TimeEdit',
  },
};
