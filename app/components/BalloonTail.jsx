export default function BalloonTail({
  width = 60,
  height = 13,
  color = 'currentColor',
  dropClasses = '',
}) {
  return (
    <svg
      className={`${dropClasses}`}
      width={width}
      height={height}
      viewBox="0 0 33 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M16.7063 12.9464C10.5992 12.9464 10.8537 0.508057 0.675194 0.508057H32.2285C23.0679 0.508057 22.05 12.9464 16.7063 12.9464Z"
        fill={color}
      />
    </svg>
  );
}
