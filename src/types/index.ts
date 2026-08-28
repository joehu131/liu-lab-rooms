export type OSType = 'linux' | 'windows';

export type AvailabilityStatus = 'FREE' | 'ENDING_SOON' | 'BUSY';

export interface RoomMetadata {
  id: string;              // e.g. "264005"
  timeeditId: string;      // e.g. "264005.195"
  name: string;            // e.g. "Asgård" or "SU15/16"
  building: string;        // e.g. "B-huset", "A-huset", "E-huset", "Key", "Fysikhuset", "Studenthuset"
  floor: string;           // e.g. "02", "03"
  corridor?: string;       // e.g. "Data-korr"
  seats: number;
  computers: number;
  os: OSType;
  mazemapUrl: string;
}

export interface TimeSlotInterval {
  start: number;           // Epoch ms
  end: number;             // Epoch ms
  courseCode?: string;     // e.g. "TDDD27" or "DRS Service"
  info?: string;           // Booking info
}

export interface GanttSegment {
  startHour: number;       // Fractional hour, e.g. 8.25 for 08:15
  endHour: number;         // Fractional hour, e.g. 10.0 for 10:00
  isOccupied: boolean;
  courseCode?: string;
}

export interface RoomAvailability {
  room: RoomMetadata;
  status: AvailabilityStatus;
  freeUntil?: number;      // Epoch ms when next booking starts (if currently free)
  freeMinutesRemaining?: number; // How many minutes free from reference time
  busyUntil?: number;      // Epoch ms when current booking ends (if currently busy)
  currentBooking?: {
    courseCode?: string;
    info?: string;
    end: number;
  };
  nextBooking?: {
    courseCode?: string;
    info?: string;
    start: number;
  };
  ganttSegments: GanttSegment[];
}

export interface ScheduleResponse {
  fetchedAt: number;       // UTC Epoch ms
  validFrom: number;       // Epoch ms
  validTo: number;         // Epoch ms
  reservations: Record<string, TimeSlotInterval[]>; // keyed by room name (normalized)
}
