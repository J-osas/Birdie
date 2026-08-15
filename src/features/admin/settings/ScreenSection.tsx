import { useEffect, useState } from 'react';
import { AppTheme, getTheme, setTheme } from '@/lib/theme';
import { isSoundOn, setSoundOn } from '@/lib/sound';
import { SectionCard, ToggleRow } from './SectionCard';

export function ScreenSection() {
  const [theme, setThemeState] = useState<AppTheme>('light');
  const [sound, setSound] = useState(true);

  useEffect(() => {
    setThemeState(getTheme());
    setSound(isSoundOn());
  }, []);

  return (
    <SectionCard
      id="screen"
      title="Your screen"
      hint="This only changes how Birdie looks on this browser. It does not change the public website for families."
    >
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)]">Look</p>
        <div className="flex flex-wrap gap-2">
          {([
            ['light', 'Light'],
            ['dark', 'Dark'],
            ['system', 'Match computer'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setThemeState(id);
                setTheme(id);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                theme === id
                  ? 'bg-[#660033] text-white border-[#660033]'
                  : 'bg-[var(--app-surface)] text-[var(--app-ink)] border-[var(--app-border)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ToggleRow
        label="Notification sound"
        hint="A short chime when a new bell item arrives. Same switch as in the bell menu."
        checked={sound}
        onChange={(on) => {
          setSound(on);
          setSoundOn(on);
        }}
      />
    </SectionCard>
  );
}
