import ExcelJS from "exceljs";

export const generateExcel = async (rows) => {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Results");

  worksheet.columns = [
    {
      header: "Roll Number",
      key: "rollNumber",
      width: 22,
    },
    {
      header: "Name",
      key: "name",
      width: 35,
    },
    {
      header: "Total Marks",
      key: "totalMarks",
      width: 18,
    },
  ];

  worksheet.addRows(rows);

  // Style header
  const header = worksheet.getRow(1);

  header.font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    size: 12,
  };

  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF217346" },
  };

  header.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  header.height = 28;

  // Preserve roll numbers as text
  worksheet.getColumn("rollNumber").numFmt = "@";

  // Align marks
  worksheet.getColumn("totalMarks").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  // Format student rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.height = 22;

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        bottom: {
          style: "thin",
          color: { argb: "FFE2E8F0" },
        },
      };

      if (rowNumber % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
      }
    });
  });

  // Freeze header
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  // Enable filtering
  worksheet.autoFilter = "A1:C1";

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
};