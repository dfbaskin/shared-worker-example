const formatter = Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatDateText(dateTxt?: string) {
  if (!dateTxt) {
    return '';
  }

  const dt = new Date(dateTxt);
  return dt instanceof Date && !isNaN(dt.valueOf()) ? formatter.format(dt) : '';
}

export function utcNow() {
  const dt = new Date();
  return Date.UTC(
    dt.getUTCFullYear(),
    dt.getUTCMonth(),
    dt.getUTCDate(),
    dt.getUTCHours(),
    dt.getUTCMinutes(),
    dt.getUTCSeconds(),
    dt.getUTCMilliseconds()
  );
}

export function isOlderThanSeconds(
  dateText: string | undefined,
  seconds: number
) {
  if (dateText) {
    const dt = new Date(dateText);
    if (dt instanceof Date && !isNaN(dt.valueOf())) {
      const diff = (utcNow() - dt.getTime()) / 1000;
      return diff >= seconds;
    }
  }
  return false;
}
