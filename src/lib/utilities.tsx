export function interpolate(ls: array, separator: object): array {
  let insert = (item, index) => index > 0 ? [ separator, item ] : [ item ];
  return ls.flatMap(insert);
}

