export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function notifyPlannedWorkouts(workouts) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const today = new Date().toISOString().split('T')[0]
  const todayPlanned = workouts.filter(w => w.date === today && w.status === 'planned')

  if (todayPlanned.length === 0) return

  // Don't spam — only notify once per session
  const lastNotified = sessionStorage.getItem('strelo_notified')
  if (lastNotified === today) return
  sessionStorage.setItem('strelo_notified', today)

  const sportLabels = { swim: 'Swim', bike: 'Bike', run: 'Run', brick: 'Brick', gym: 'Gym' }
  const summary = todayPlanned
    .map(w => sportLabels[w.sport] || w.sport)
    .join(', ')

  new Notification('Strelo — Training Today', {
    body: `${todayPlanned.length} session${todayPlanned.length > 1 ? 's' : ''} planned: ${summary}`,
    icon: '/icon-192.svg',
    tag: 'strelo-daily',
  })
}
