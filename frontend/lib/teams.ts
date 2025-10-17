export const SPANISH_TEAMS = [
  "Alaves",
  "Barcelona",
  "Bilbao",
  "Getafe",
  "Girona",
  "Las Palmas",
  "Madrid Fehér",
  "Madrid Piros",
  "Mallorca",
  "Osasuna",
  "San Sebastian",
  "Sevilla Piros",
  "Sevilla Zöld",
  "Valencia",
  "Villarreal",
  "Vigo",
] as const;

export type SpanishTeam = (typeof SPANISH_TEAMS)[number];
