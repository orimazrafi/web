export type Filters = {
    from: string; // ISO date
    to: string;   // ISO date
    source?: string[]; // e.g. ["google","organic"]
    type?: string[];   // e.g. ["page_view","purchase"]
  };
  