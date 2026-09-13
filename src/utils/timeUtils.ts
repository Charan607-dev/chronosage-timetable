export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, minutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateDurationHours(startTime: string, endTime: string): number {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const diff = endMin >= startMin ? endMin - startMin : (1440 - startMin) + endMin;
  return Math.round((diff / 60) * 10) / 10;
}

export function formatTime12h(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export function isCurrentActivity(startTime: string, endTime: string, currentMinutes?: number): boolean {
  const nowMin = currentMinutes !== undefined ? currentMinutes : timeToMinutes(getCurrentTimeString());
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  if (endMin >= startMin) {
    return nowMin >= startMin && nowMin < endMin;
  }
  // Crosses midnight
  return nowMin >= startMin || nowMin < endMin;
}

export function isTimeInPast(endTime: string, currentMinutes?: number): boolean {
  const nowMin = currentMinutes !== undefined ? currentMinutes : timeToMinutes(getCurrentTimeString());
  const endMin = timeToMinutes(endTime);
  return nowMin >= endMin;
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good Afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeGreeting = 'Good Evening';
  } else if (hour >= 22 || hour < 5) {
    timeGreeting = 'Good Night';
  }
  return `${timeGreeting}${name ? `, ${name}` : ''}`;
}

export function getDayAndDateFormatted(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
