function isBlockedForWindow(transactions, requestedStart, requestedEnd) {
  const windows = Array.isArray(transactions) ? transactions : [];

  return windows.some((transaction) => {
    const startBooking = new Date(transaction?.startBooking).getTime();
    const endBooking = new Date(transaction?.endBooking).getTime();

    return requestedStart.getTime() < endBooking && requestedEnd.getTime() > startBooking;
  });
}

export function findAvailableAlternative(location, selectedLotId, requestedStart, requestedEnd) {
  const lots = [...(location?.Lots?.items ?? [])].sort((left, right) => (left?.lotNr ?? 0) - (right?.lotNr ?? 0));

  return lots.find((lot) => {
    if (!lot?.id || lot.id === selectedLotId) {
      return false;
    }

    return !isBlockedForWindow(lot?.Transactions?.items, requestedStart, requestedEnd);
  }) ?? null;
}