'use client';

export default function WaveDivider({ color = '#5A1A8A', bgColor = '#ffffff', bgOpacity = 0.7 }) {
  return (
    <div style={{ backgroundColor: bgColor }}
    >
      <div 
        className="w-full h-[62px] -mb-[1px]"
        style={{
          // backgroundColor: bgColor,
          // backgroundOpacity: bgOpacity,
          WebkitMaskImage: 'url("/assets/wave_divider.svg")',
          maskImage: 'url("/assets/wave_divider.svg")',
          WebkitMaskRepeat: 'repeat-x',
          maskRepeat: 'repeat-x',
          WebkitMaskSize: 'auto 100%',
          maskSize: 'auto 100%',
          backgroundColor: color
        }}
      />
    </div>
  );
}