const escapeCSV = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }

  let text = String(value);

  // Prevent spreadsheet formula injection
  if (
    typeof value === "string" &&
    /^[\s]*[=+\-@]/.test(text)
  ) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

export const generateCSV = (headers, rows) => {
  const headerRow = headers
    .map(escapeCSV)
    .join(",");

  const dataRows = rows.map((row) =>
    row.map(escapeCSV).join(",")
  );

  return "\uFEFF" +
    [headerRow, ...dataRows].join("\r\n");
};