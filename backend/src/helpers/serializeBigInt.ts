export function serializeBigInt(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  } else if (obj instanceof Date) {
    return obj.toISOString(); // или obj.getTime() — в зависимости от нужд
  } else if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)]));
  } else {
    return obj;
  }
}
