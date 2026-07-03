function isBlockedForWindow(transactions, requestedStart, requestedEnd) {
  const windows = Array.isArray(transactions) ? transactions : [];

  return windows.some((transaction) => {
    const startBooking = new Date(transaction?.startBooking).getTime();
    const endBooking = new Date(transaction?.endBooking).getTime();

    return requestedStart.getTime() < endBooking && requestedEnd.getTime() > startBooking;
  });
}

function sortTransactions(transactions) {
  const windows = Array.isArray(transactions) ? transactions : [];

  return [...windows].sort(
    (left, right) => new Date(left?.startBooking).getTime() - new Date(right?.startBooking).getTime(),
  );
}

export function findNextAvailableStartForWindow(transactions, requestedStart, requestedEnd) {
  const sortedWindows = sortTransactions(transactions);

  return sortedWindows.reduce((nextAvailable, transaction) => {
    const startBooking = new Date(transaction?.startBooking);
    const endBooking = new Date(transaction?.endBooking);

    if (requestedStart >= endBooking || requestedEnd <= startBooking) {
      return nextAvailable;
    }

    if (!nextAvailable) {
      return endBooking;
    }

    return startBooking <= nextAvailable
      ? new Date(Math.max(nextAvailable.getTime(), endBooking.getTime()))
      : nextAvailable;
  }, null);
}

export function getMinutesUntilNextBooking(transactions, requestedStart) {
  const sortedWindows = sortTransactions(transactions);

  for (const transaction of sortedWindows) {
    const startBooking = new Date(transaction?.startBooking).getTime();
    const endBooking = new Date(transaction?.endBooking).getTime();
    const requestedStartTime = requestedStart.getTime();

    if (requestedStartTime >= endBooking) {
      continue;
    }

    if (requestedStartTime < startBooking) {
      return Math.max(0, Math.floor((startBooking - requestedStartTime) / 60000));
    }

    return 0;
  }

  return null;
}

export function findAvailableAlternative(location, selectedLotId, requestedStart, requestedEnd) {
  const lots = [...(location?.Lots?.items ?? [])].sort((left, right) => (left?.lotNr ?? 0) - (right?.lotNr ?? 0));

  return lots.find((lot) => {
    if (!lot?.id || lot.id === selectedLotId || lot?.avlBool === false) {
      return false;
    }

    return !isBlockedForWindow(lot?.Transactions?.items, requestedStart, requestedEnd);
  }) ?? null;
}