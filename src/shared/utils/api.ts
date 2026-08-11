export const unwrapApiData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if ('result' in record) return record.result as T;
    if ('data' in record) return record.data as T;
    if ('content' in record) return record.content as T;
  }

  return payload as T;
};
