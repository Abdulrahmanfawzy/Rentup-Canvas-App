const transformElementsKeys = (
  elements: any[],
  mappingsByType: Record<string, Record<string, string>>,
  fallbackMapping: Record<string, string> // 👈 للتحويلات الافتراضية
) => {
  return elements.map((el) => {
    const type = el.type;
    const keyMap = mappingsByType[type] || fallbackMapping;

    const transformed: any = { ...el };

    for (const [oldKey, newKey] of Object.entries(keyMap)) {
      if (oldKey in el) {
        transformed[newKey] = el[oldKey];
      }
    }

    return transformed;
  });
};
export default transformElementsKeys;
