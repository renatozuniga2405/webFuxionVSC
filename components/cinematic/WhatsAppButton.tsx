export default function WhatsAppButton({ isFinal }: { isFinal?: boolean }) {
  const phone = '51972081522';
  const message = encodeURIComponent('Hola FUXION, quisiera más información sobre sus productos.');
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`wsp-float-btn ${isFinal ? 'is-final' : ''}`}
      aria-label="Contactar por WhatsApp al +51972081522"
      tabIndex={isFinal ? -1 : 0}
      aria-hidden={isFinal ? 'true' : undefined}
    >
      <svg
        viewBox="0 0 32 32"
        className="wsp-icon"
        aria-hidden="true"
        width="30"
        height="30"
        fill="currentColor"
      >
        <path d="M16.01 2.002C8.28 2.002 2 8.274 2 16.002c0 2.637.73 5.105 2 7.218L2 30.002l7.02-1.84a13.93 13.93 0 0 0 6.99 1.84c7.73 0 14.01-6.273 14.01-14.001 0-7.727-6.28-13.999-14.01-13.999zm8.17 19.789c-.34.96-1.74 1.76-2.42 1.87-.66.1-1.52.15-2.46-.15-2.02-.65-4.24-2.22-5.96-4.04-1.72-1.82-3.07-4.14-3.55-6.22-.22-.96-.06-1.8.1-2.43.19-.65.73-1.42 1.4-1.72.33-.15.69-.22 1.05-.22h.74c.24 0 .49.03.71.55.27.65.92 2.25 1 2.41.08.17.13.37.02.59-.11.22-.17.35-.33.54-.17.19-.35.42-.5.57-.17.17-.35.35-.15.7.2.34.88 1.44 1.88 2.33 1.3 1.15 2.39 1.51 2.73 1.68.34.17.54.14.74-.09.2-.23.86-1 1.09-1.34.23-.34.46-.29.77-.17.31.11 1.97.93 2.31 1.1.34.17.57.26.66.4.08.14.08.83-.26 1.79z" />
      </svg>
      <span className="wsp-tooltip">Chatea con nosotros</span>
    </a>
  );
}

