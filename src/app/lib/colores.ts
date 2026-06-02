export const COLORES_GRUPO: Record<string, string> = {
  A: "#E61D25",
  B: "#2A398D",
  C: "#00A3E0",
  D: "#3CAC3B",
  E: "#D4AF37",
  F: "#A2238E",
  G: "#E61D25",
  H: "#2A398D",
  I: "#00A3E0",
  J: "#3CAC3B",
  K: "#D4AF37",
  L: "#A2238E",
};

export const COLORES_RONDA: Record<string, string> = {
  dieciseisavos: "#2A398D",
  octavos: "#A2238E",
  cuartos: "#00A3E0",
  semifinal: "#E61D25",
  tercer_puesto: "#3CAC3B",
  final: "#D4AF37",
};

export const COLORES_RONDA_LABEL: Record<string, string> = {
  dieciseisavos: "#2A398D",
  octavos: "#A2238E",
  cuartos: "#00A3E0",
  semifinal: "#E61D25",
  tercer_puesto: "#3CAC3B",
  final: "#D4AF37",
};

export const COLORES_ESTADOS: Record<string, string> = {
  PROGRAMADO: "#F4F5F7",
  BLOQUEADO: "#FBE84E",
  EN_VIVO: "#E61D25",
  FINALIZADO: "#3CAC3B",
  PROCESADO: "#00A3E0",
};

export const GRADIENTE_NAVBAR = "linear-gradient(135deg, #000000 0%, #111217 100%)";

export function getColorGrupo(grupo: string): string {
  return COLORES_GRUPO[grupo] ?? "#D4AF37";
}

export function getColorRonda(ronda: string): string {
  return COLORES_RONDA[ronda] ?? "#D4AF37";
}
