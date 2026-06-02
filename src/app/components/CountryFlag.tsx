"use client";

import { getPais } from "@/app/lib/paises";

type Props = {
  nombre: string;
  className?: string;
};

export default function CountryFlag({ nombre, className = "" }: Props) {
  const pais = getPais(nombre);
  if (!pais) return null;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span
        className="leading-none"
        style={{ fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne Color', sans-serif" }}
      >
        {pais.emoji}
      </span>
    </span>
  );
}
