// Wraps the Web Vibration API with named patterns
// Silently no-ops on devices that don't support it

const patterns = {
  light:   [10],
  medium:  [20],
  heavy:   [40],
  success: [10, 60, 10],
  goal:    [20, 40, 20, 40, 60],
  error:   [40, 30, 40],
  delete:  [15, 30, 15],
}

export function useHaptic() {
  const vibrate = (pattern = 'light') => {
    if (!navigator.vibrate) return
    const seq = patterns[pattern] ?? patterns.light
    navigator.vibrate(seq)
  }

  return {
    tap:     () => vibrate('light'),
    bump:    () => vibrate('medium'),
    heavy:   () => vibrate('heavy'),
    success: () => vibrate('success'),
    goal:    () => vibrate('goal'),
    error:   () => vibrate('error'),
    delete:  () => vibrate('delete'),
  }
}
