// lib/pdfGenerator.ts
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";

export type UsulanPiutang = {
  no: number;
  namaWp: string;
  alamatWp: string;
  nik: string;
  pekerjaan: string;
  jenisPiutang: string;
  noSkrdStrd: string;
  sebabMacet: string;
  pokok: number;
  denda: number;
  total: number;
  upayaPenagihan: string;
  createdAt: Date;
};

export type PdfGeneratorOptions = {
  data: UsulanPiutang[];
  searchTerm?: string;
  selectedJenis?: string;
  formatRupiah: (angka: number) => string;
};

// HELPER: potong teks agar tidak overflow kolom (untuk yang single line)
function truncate(text: string, maxChars: number): string {
  if (!text) return "-";
  return text.length > maxChars ? text.substring(0, maxChars - 2) + ".." : text;
}

// HELPER: wrap text menjadi beberapa baris
function wrapText(text: string, maxCharsPerLine: number): string[] {
  if (!text || text === "-") return [text || "-"];

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (word.length > maxCharsPerLine) {
      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = "";
      }
      let remaining = word;
      while (remaining.length > maxCharsPerLine) {
        lines.push(remaining.substring(0, maxCharsPerLine - 2) + "..");
        remaining = remaining.substring(maxCharsPerLine - 2);
      }
      currentLine = remaining;
    } else if ((currentLine + " " + word).length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + " " + word : word;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.length === 0 ? [text] : lines;
}

// KONSTANTA LAYOUT
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN_L = 28;
const MARGIN_R = 28;
const MARGIN_TOP = 25;
const MARGIN_BOTTOM = 45;
const TABLE_X1 = MARGIN_L;
const TABLE_X2 = PAGE_WIDTH - MARGIN_R;
const TABLE_W = TABLE_X2 - TABLE_X1;

// Lebar tiap kolom
const COL_W: Record<string, number> = {
  no: 30,
  namaWp: 80,
  alamatWp: 85,
  nik: 75,
  pekerjaan: 58,
  jenisPiutang: 58,
  noSkrd: 68,
  sebabMacet: 78,
  pokok: 72,
  denda: 62,
  total: 65,
  upaya: TABLE_W - (30 + 80 + 85 + 75 + 58 + 58 + 68 + 78 + 72 + 62 + 65),
};

// Maksimum karakter per baris untuk setiap kolom
const MAX_CHARS_PER_COL: Record<string, number> = {
  no: 4,
  namaWp: 18,
  alamatWp: 20,
  nik: 16,
  pekerjaan: 12,
  jenisPiutang: 12,
  noSkrd: 14,
  sebabMacet: 16,
  pokok: 15,
  denda: 15,
  total: 15,
  upaya: 12,
};

function buildColX(): Record<string, number> {
  const colX: Record<string, number> = {};
  let x = TABLE_X1;
  for (const [key, w] of Object.entries(COL_W)) {
    colX[key] = x;
    x += w;
  }
  return colX;
}

function colRight(colKey: string, colX: Record<string, number>): number {
  return colX[colKey] + COL_W[colKey];
}

function drawCentered(
  page: PDFPage,
  text: string,
  colKey: string,
  y: number,
  size: number,
  font: PDFFont,
  colX: Record<string, number>,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  const centerX = colX[colKey] + (COL_W[colKey] - textWidth) / 2;
  page.drawText(text, { x: centerX, y, size, font, color: rgb(0, 0, 0) });
}

// GAMBAR HEADER SATU HALAMAN
function drawPageHeader(
  page: PDFPage,
  boldFont: PDFFont,
  _font: PDFFont,
  topY: number,
  colX: Record<string, number>,
): number {
  const TITLE =
    "DAFTAR USULAN PENGURUSAN PIUTANG DAERAH DALAM RANGKA PENGHAPUSAN PIUTANG DAERAH";
  const TITLE_SIZE = 11;
  const titleW = boldFont.widthOfTextAtSize(TITLE, TITLE_SIZE);
  const titleY = topY - 14;
  page.drawText(TITLE, {
    x: TABLE_X1 + (TABLE_W - titleW) / 2,
    y: titleY,
    size: TITLE_SIZE,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  const HDR_TOP = titleY - 30;
  const HDR_H = 55; // Tinggi header ditambah untuk 3 baris "JENIS PIUTANG"
  const ROW_B_H = 16;
  const HDR_BOT = HDR_TOP - HDR_H;
  const SPLIT_Y = HDR_BOT + ROW_B_H;

  // Background abu + border luar
  page.drawRectangle({
    x: TABLE_X1,
    y: HDR_BOT,
    width: TABLE_W,
    height: HDR_H,
    color: rgb(0.88, 0.88, 0.88),
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.8,
  });

  // Garis horizontal pemisah antara baris atas dan bawah
  page.drawLine({
    start: { x: colX.pokok, y: SPLIT_Y },
    end: { x: colX.total + COL_W.total, y: SPLIT_Y },
    thickness: 0.6,
    color: rgb(0, 0, 0),
  });

  // Garis vertikal pemisah kolom - KECUALI untuk kolom pokok, denda, total
  const VSEP = [
    "namaWp",
    "alamatWp",
    "nik",
    "pekerjaan",
    "jenisPiutang",
    "noSkrd",
    "sebabMacet",
    "upaya",
  ];
  VSEP.forEach((key) => {
    page.drawLine({
      start: { x: colX[key], y: HDR_TOP },
      end: { x: colX[key], y: HDR_BOT },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
  });

  // Garis vertikal batas kiri merged cell
  page.drawLine({
    start: { x: colX.pokok, y: HDR_TOP },
    end: { x: colX.pokok, y: HDR_BOT },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });

  // Garis vertikal batas kanan merged cell
  page.drawLine({
    start: { x: colX.total + COL_W.total, y: HDR_TOP },
    end: { x: colX.total + COL_W.total, y: HDR_BOT },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });

  const FS = 7;
  const rowACY = SPLIT_Y + (HDR_TOP - SPLIT_Y) / 2 - FS / 2;
  const rowBCY = HDR_BOT + ROW_B_H / 2 - FS / 2;

  // Kolom single-label (NO, NAMA WP, ALAMAT WP, NIK, PEKERJAAN)
  const singles: [string, string][] = [
    ["no", "NO"],
    ["namaWp", "NAMA WP"],
    ["alamatWp", "ALAMAT WP"],
    ["nik", "NIK"],
    ["pekerjaan", "PEKERJAAN"],
  ];
  singles.forEach(([key, label]) =>
    drawCentered(page, label, key, rowACY, FS, boldFont, colX),
  );

  // JENIS PIUTANG — 3 baris (JENIS, PIUTANG, plus satu baris kosong atau diatur ulang)
  // Agar tidak terpotong, kita buat 2 baris dengan font lebih kecil atau 2 baris standar
  {
    const lineH = FS + 2;
    const lines = ["JENIS", "PIUTANG"];
    const blockH = lines.length * lineH - 2;
    const startY = SPLIT_Y + (HDR_TOP - SPLIT_Y + blockH) / 2 - FS;
    lines.forEach((line, i) =>
      drawCentered(
        page,
        line,
        "jenisPiutang",
        startY - i * lineH,
        FS,
        boldFont,
        colX,
      ),
    );
  }

  // NO, SKRD, STRD, DLL — 2 baris
  {
    const lineH = FS + 2;
    const lines = ["NO, SKRD,", "STRD, DLL"];
    const blockH = lines.length * lineH - 2;
    const startY = SPLIT_Y + (HDR_TOP - SPLIT_Y + blockH) / 2 - FS;
    lines.forEach((line, i) =>
      drawCentered(
        page,
        line,
        "noSkrd",
        startY - i * lineH,
        FS,
        boldFont,
        colX,
      ),
    );
  }

  // SEBAB PIUTANG MACET — 3 baris
  {
    const lineH = FS + 2;
    const lines = ["SEBAB", "PIUTANG", "MACET"];
    const blockH = lines.length * lineH - 2;
    const startY = SPLIT_Y + (HDR_TOP - SPLIT_Y + blockH) / 2 - FS;
    lines.forEach((line, i) =>
      drawCentered(
        page,
        line,
        "sebabMacet",
        startY - i * lineH,
        FS,
        boldFont,
        colX,
      ),
    );
  }

  // RINCIAN PIUTANG — MERGED 3 KOLOM
  const rincianStartX = colX.pokok;
  const rincianEndX = colX.total + COL_W.total;
  const rincianWidth = rincianEndX - rincianStartX;
  const rincianText = "RINCIAN PIUTANG";
  const rincianTextWidth = boldFont.widthOfTextAtSize(rincianText, FS);
  const rincianTextX = rincianStartX + (rincianWidth - rincianTextWidth) / 2;

  page.drawText(rincianText, {
    x: rincianTextX,
    y: rowACY,
    size: FS,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // POKOK, DENDA, TOTAL — di ROW-B
  drawCentered(page, "POKOK", "pokok", rowBCY, FS, boldFont, colX);
  drawCentered(page, "DENDA", "denda", rowBCY, FS, boldFont, colX);
  drawCentered(page, "TOTAL", "total", rowBCY, FS, boldFont, colX);

  // UPAYA PENAGIHAN — 2 baris
  {
    const lineH = FS + 2;
    const lines = ["UPAYA", "PENAGIHAN"];
    const blockH = lines.length * lineH - 2;
    const startY = SPLIT_Y + (HDR_TOP - SPLIT_Y + blockH) / 2 - FS;
    lines.forEach((line, i) =>
      drawCentered(page, line, "upaya", startY - i * lineH, FS, boldFont, colX),
    );
  }

  // Garis vertikal pemisah di baris bawah (POKOK, DENDA, TOTAL)
  page.drawLine({
    start: { x: colX.denda, y: SPLIT_Y },
    end: { x: colX.denda, y: HDR_BOT },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: colX.total, y: SPLIT_Y },
    end: { x: colX.total, y: HDR_BOT },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });

  return HDR_BOT;
}

// MAIN FUNGSI — generatePiutangPDF
export async function generatePiutangPDF(
  options: PdfGeneratorOptions,
): Promise<Uint8Array> {
  const { data, searchTerm = "", selectedJenis = "", formatRupiah } = options;

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.namaWp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nik.includes(searchTerm);
    const matchJenis = !selectedJenis || item.jenisPiutang === selectedJenis;
    return matchSearch && matchJenis;
  });

  if (filteredData.length === 0)
    throw new Error("Tidak ada data untuk diekspor");

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const colX = buildColX();
  const LINE_H = 11;
  const TOP_PADDING = 6;
  const BOTTOM_PADDING = 6;

  let currentPage: PDFPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let currentY: number = drawPageHeader(
    currentPage,
    boldFont,
    font,
    PAGE_HEIGHT - MARGIN_TOP,
    colX,
  );

  // DATA ROWS
  for (let i = 0; i < filteredData.length; i++) {
    const item = filteredData[i];

    // Hitung jumlah baris untuk setiap kolom
    const namaLines = wrapText(item.namaWp, MAX_CHARS_PER_COL.namaWp).length;
    const alamatLines = wrapText(
      item.alamatWp || "-",
      MAX_CHARS_PER_COL.alamatWp,
    ).length;
    const jenisLines = wrapText(
      item.jenisPiutang,
      MAX_CHARS_PER_COL.jenisPiutang,
    ).length;
    const sebabLines = wrapText(
      item.sebabMacet || "-",
      MAX_CHARS_PER_COL.sebabMacet,
    ).length;
    const upayaLines = wrapText(
      item.upayaPenagihan || "-",
      MAX_CHARS_PER_COL.upaya,
    ).length;
    const maxLines = Math.max(
      namaLines,
      alamatLines,
      jenisLines,
      sebabLines,
      upayaLines,
      1,
    );

    const contentHeight = maxLines * LINE_H;
    const rowHeight = contentHeight + TOP_PADDING + BOTTOM_PADDING;

    if (currentY - rowHeight < MARGIN_BOTTOM + 80) {
      currentPage.drawLine({
        start: { x: TABLE_X1, y: currentY },
        end: { x: TABLE_X2, y: currentY },
        thickness: 0.8,
        color: rgb(0, 0, 0),
      });
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentY = drawPageHeader(
        currentPage,
        boldFont,
        font,
        PAGE_HEIGHT - MARGIN_TOP,
        colX,
      );
    }

    const rowTop: number = currentY;
    const rowBot: number = currentY - rowHeight;

    // Zebra stripe
    if (i % 2 === 1) {
      currentPage.drawRectangle({
        x: TABLE_X1,
        y: rowBot,
        width: TABLE_W,
        height: rowHeight,
        color: rgb(0.95, 0.95, 0.95),
      });
    }

    // Border baris
    currentPage.drawRectangle({
      x: TABLE_X1,
      y: rowBot,
      width: TABLE_W,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.3,
    });

    // Garis vertikal kolom di baris data
    Object.keys(COL_W).forEach((key) => {
      if (key === "no") return;
      currentPage.drawLine({
        start: { x: colX[key], y: rowTop },
        end: { x: colX[key], y: rowBot },
        thickness: 0.3,
        color: rgb(0, 0, 0),
      });
    });

    const textStartY: number = rowTop - TOP_PADDING - 2;

    // NO (center)
    const noStr = `${i + 1}`;
    const noW = font.widthOfTextAtSize(noStr, 6.5);
    currentPage.drawText(noStr, {
      x: colX.no + (COL_W.no - noW) / 2,
      y: textStartY,
      size: 6.5,
      font,
    });

    // NAMA WP (multi-line)
    const namaLines_arr = wrapText(item.namaWp, MAX_CHARS_PER_COL.namaWp);
    for (let li = 0; li < namaLines_arr.length; li++) {
      currentPage.drawText(namaLines_arr[li], {
        x: colX.namaWp + 2,
        y: textStartY - li * LINE_H,
        size: 6.5,
        font,
      });
    }

    // ALAMAT WP (multi-line)
    const alamatLines_arr = wrapText(
      item.alamatWp || "-",
      MAX_CHARS_PER_COL.alamatWp,
    );
    for (let li = 0; li < alamatLines_arr.length; li++) {
      currentPage.drawText(alamatLines_arr[li], {
        x: colX.alamatWp + 2,
        y: textStartY - li * LINE_H,
        size: 6.5,
        font,
      });
    }

    // NIK (single line, truncate if needed)
    const nikText =
      (item.nik || "-").length > MAX_CHARS_PER_COL.nik
        ? (item.nik || "-").substring(0, MAX_CHARS_PER_COL.nik - 2) + ".."
        : item.nik || "-";
    currentPage.drawText(nikText, {
      x: colX.nik + 2,
      y: textStartY,
      size: 6.5,
      font,
    });

    // PEKERJAAN (single line, truncate if needed)
    const pekerjaanText =
      (item.pekerjaan || "-").length > MAX_CHARS_PER_COL.pekerjaan
        ? (item.pekerjaan || "-").substring(
            0,
            MAX_CHARS_PER_COL.pekerjaan - 2,
          ) + ".."
        : item.pekerjaan || "-";
    currentPage.drawText(pekerjaanText, {
      x: colX.pekerjaan + 2,
      y: textStartY,
      size: 6.5,
      font,
    });

    // JENIS PIUTANG (multi-line - FULL, tidak dipotong)
    const jenisLines_arr = wrapText(
      item.jenisPiutang,
      MAX_CHARS_PER_COL.jenisPiutang,
    );
    for (let li = 0; li < jenisLines_arr.length; li++) {
      currentPage.drawText(jenisLines_arr[li], {
        x: colX.jenisPiutang + 2,
        y: textStartY - li * LINE_H,
        size: 6.5,
        font,
      });
    }

    // NO SKRD (single line, truncate if needed)
    const noSkrdText =
      (item.noSkrdStrd || "-").length > MAX_CHARS_PER_COL.noSkrd
        ? (item.noSkrdStrd || "-").substring(0, MAX_CHARS_PER_COL.noSkrd - 2) +
          ".."
        : item.noSkrdStrd || "-";
    currentPage.drawText(noSkrdText, {
      x: colX.noSkrd + 2,
      y: textStartY,
      size: 6.5,
      font,
    });

    // SEBAB MACET (multi-line)
    const sebabLines_arr = wrapText(
      item.sebabMacet || "-",
      MAX_CHARS_PER_COL.sebabMacet,
    );
    for (let li = 0; li < sebabLines_arr.length; li++) {
      currentPage.drawText(sebabLines_arr[li], {
        x: colX.sebabMacet + 2,
        y: textStartY - li * LINE_H,
        size: 6.5,
        font,
      });
    }

    // POKOK (right align)
    const pokokStr = formatRupiah(item.pokok);
    currentPage.drawText(pokokStr, {
      x: colRight("pokok", colX) - 2 - font.widthOfTextAtSize(pokokStr, 6.5),
      y: textStartY,
      size: 6.5,
      font,
    });

    // DENDA (right align)
    const dendaStr = formatRupiah(item.denda);
    currentPage.drawText(dendaStr, {
      x: colRight("denda", colX) - 2 - font.widthOfTextAtSize(dendaStr, 6.5),
      y: textStartY,
      size: 6.5,
      font,
    });

    // TOTAL (right align, bold)
    const totalStr = formatRupiah(item.total);
    currentPage.drawText(totalStr, {
      x: colRight("total", colX) - 2 - font.widthOfTextAtSize(totalStr, 6.5),
      y: textStartY,
      size: 6.5,
      font: boldFont,
    });

    // UPAYA PENAGIHAN (multi-line)
    const upayaLines_arr = wrapText(
      item.upayaPenagihan || "-",
      MAX_CHARS_PER_COL.upaya,
    );
    for (let li = 0; li < upayaLines_arr.length; li++) {
      currentPage.drawText(upayaLines_arr[li], {
        x: colX.upaya + 2,
        y: textStartY - li * LINE_H,
        size: 6.5,
        font,
      });
    }

    currentY -= rowHeight;
  }

  // Garis bawah penutup tabel
  currentPage.drawLine({
    start: { x: TABLE_X1, y: currentY },
    end: { x: TABLE_X2, y: currentY },
    thickness: 0.8,
    color: rgb(0, 0, 0),
  });

  // TANDA TANGAN
  const SIGN_X = 600;
  let ttY = currentY - 40;

  const BULAN = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const today = new Date();
  const tglStr = `${today.getDate()} ${BULAN[today.getMonth()]} ${today.getFullYear()}`;

  currentPage.drawText(`Kendal, ${tglStr}`, {
    x: SIGN_X,
    y: ttY,
    size: 9,
    font,
    color: rgb(0, 0, 0),
  });

  ttY -= 20;
  currentPage.drawText("Kepala SKPD", {
    x: SIGN_X,
    y: ttY,
    size: 9,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  ttY -= 35;
  currentPage.drawText("(_________________________)", {
    x: SIGN_X,
    y: ttY,
    size: 9,
    font,
    color: rgb(0, 0, 0),
  });

  ttY -= 18;
  currentPage.drawText("NIP. ............", {
    x: SIGN_X,
    y: ttY,
    size: 9,
    font,
    color: rgb(0, 0, 0),
  });

  return await pdfDoc.save();
}

// FUNGSI DOWNLOAD PDF
export async function downloadPiutangPDF(
  options: PdfGeneratorOptions,
): Promise<void> {
  try {
    const pdfBytes: Uint8Array = await generatePiutangPDF(options);
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `daftar_usulan_piutang_${dateStr}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
