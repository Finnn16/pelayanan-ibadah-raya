import { useEffect, useMemo, useState } from "react";

// Penyimpanan lokal (browser)
const STORAGE_KEY = "pelayanan-ibadah:schedule";

// Daftar bagian (baris pada tabel)
const SECTIONS = [
  "KG Umum 1",
  "KG Umum 2",
  "KG Youth",
  "BTC Umum",
  "BTC Youth 1",
  "BTC Youth 2",
  "BTC Youth Gabungan",
  "Kopo Umum",
  "Kopo Youth",
  "IR Gabungan Gereja",
];

// Daftar nama tetap (fallback lokal jika DB belum terisi)
const PEOPLE_FALLBACK = [
  "Anggiat",
  "Sorta",
  "Andika",
  "Joshua Sianturi",
  "Sheren",
  "Jeven",
  "Rianida",
  "Egi",
  "Juju",
  "Parlin",
  "July",
  "Aldo",
  "Ay",
  "Sele",
  "Martin",
  "Duma",
  "Sahata",
  "Revi",
  "Johanes",
  "Roni",
  "Adi",
  "Riqfi",
  "Mey",
  "Ayu",
  "Endang",
  "Derric",
  "Boyan",
  "Farren",
  "Beniah",
  "Yoseph",
  "Debo",
  "Renti",
  "Nathan",
  "Marvel",
  "Axel",
  "Andi",
  "Viona",
  "Putri",
  "Vania",
  "Intan",
  "Loide",
  "Marchelia",
  "Ferdinan",
  "Jevin",
  "Asen",
  "Erica",
  "Dennis",
  "Erwin",
  "Petrus",
  "Matthew",
  "Samuel",
  "Lisbet",
  "Paula",
  "Diana",
  "Nelson",
  "Jocelin",
  "Magdalena",
  "Sianturi",
  "Ocep",
  "Imman",
  "Amy",
  "Ria",
  "Rouli",
  "Jeni",
  "Vina",
  "Sondang",
];

// Utils
const fmtDateLabel = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });

const keyOf = (date, section) => `${date}::${section}`;
const isEmptyField = (v) => {
  if (Array.isArray(v)) return v.length === 0;
  if (v == null) return true;
  return String(v).trim() === "";
};
const monthKey = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function loadData() {
  // Fetch dari API, bukan localStorage
  // Akan di-call di useEffect dengan async
  return [];
}

function saveData(arr) {
  // Deprecated - use API instead
  // Kept for backward compatibility
}

async function fetchSchedules() {
  try {
    const res = await fetch('/api/schedules');
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function saveSchedule(date, section, wl, singer, musik, tari) {
  try {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, section, wl, singer, musik, tari }),
    });
    if (!res.ok) throw new Error('Save failed');
    return await res.json();
  } catch (error) {
    console.error('Error saving schedule:', error);
    return null;
  }
}

async function deleteSchedule(date, section) {
  try {
    const res = await fetch('/api/schedules', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, section }),
    });
    if (!res.ok) throw new Error('Delete failed');
    return true;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return false;
  }
}

function MultiCheck({ label, value, onChange, options }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(q.toLowerCase())),
    [options, q]
  );
  const toggle = (name) => {
    if (value.includes(name)) onChange(value.filter((v) => v !== name));
    else onChange([...value, name]);
  };

  return (
    <fieldset className="flex h-80 sm:h-96 flex-col gap-2 rounded-xl border border-zinc-200 p-3 text-sm">
      <legend className="text-center text-sm font-semibold uppercase tracking-wide text-zinc-700">
        {label}
      </legend>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama..."
          className="w-full rounded-md border border-zinc-300 px-2 py-2 outline-none focus:ring-2 focus:ring-zinc-600"
        />
        <button
          type="button"
          onClick={() => onChange([])}
          className="whitespace-nowrap rounded border px-2 py-2 text-xs hover:bg-zinc-100"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-auto rounded-md border border-zinc-200 p-2">
        <ul className="flex flex-col gap-1">
          {filtered.map((name) => (
            <li key={name} className="flex items-center gap-2">
              <input
                id={`${label}-${name}`}
                type="checkbox"
                className="h-4 w-4"
                checked={value.includes(name)}
                onChange={() => toggle(name)}
              />
              <label htmlFor={`${label}-${name}`} className="select-none">
                {name}
              </label>
            </li>
          ))}
        </ul>
      </div>
      {value.length > 0 && (
        <div className="pt-1 text-xs text-zinc-600">
          Terpilih: {value.join(", ")}
        </div>
      )}
    </fieldset>
  );
}

function SingleSelect({ label, value, onChange, options, allowEmpty = true }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-600"
      >
        {allowEmpty && (
          <option value="">— (kosong) —</option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {allowEmpty && value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-1 w-max rounded border px-2 py-1 text-xs hover:bg-zinc-100"
        >
          Kosongkan
        </button>
      )}
    </label>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState("");
  const [section, setSection] = useState(SECTIONS[0]);
  const [wl, setWl] = useState([]); // now multi-select
  const [singer, setSinger] = useState([]);
  const [musik, setMusik] = useState([]);
  const [tari, setTari] = useState([]);
  const [people, setPeople] = useState(PEOPLE_FALLBACK);
  const [monthView, setMonthView] = useState(""); // YYYY-MM or empty for all
  const [loading, setLoading] = useState(true);

  // init from API
  useEffect(() => {
    let ignore = false;
    (async () => {
      const data = await fetchSchedules();
      if (!ignore) {
        setItems(data);
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // fetch people list from API (DB) with fallback
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch('/api/people');
        if (!res.ok) return;
        const json = await res.json();
        if (!ignore && Array.isArray(json?.data)) {
          const names = json.data
            .filter((p) => p?.active !== false)
            .map((p) => p.name)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
          if (names.length) setPeople(names);
        }
      } catch {}
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // derive dates sorted
  const dates = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.date))).sort(
        (a, b) => new Date(a) - new Date(b)
      ),
    [items]
  );

  // map for quick lookup
  const byKey = useMemo(() => {
    const m = new Map();
    for (const it of items) m.set(keyOf(it.date, it.section), it);
    return m;
  }, [items]);

  // filter dates by selected month for viewing
  const viewDates = useMemo(() => {
    if (!monthView) return dates;
    return dates.filter((d) => monthKey(d) === monthView);
  }, [dates, monthView]);

  const todayIso = useMemo(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  function resetForm() {
    setWl([]);
    setSinger([]);
    setMusik([]);
    setTari([]);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!date || !section) return;

    // Save to API
    const result = await saveSchedule(date, section, wl, singer, musik, tari);
    if (result) {
      // Update local state
      const rec = result.data;
      const next = items.filter((i) => i.id !== rec.id).concat(rec);
      setItems(next);
      resetForm();
      setDate("");
    }
  }

  async function handleDelete(dateDel, sectionDel) {
    const success = await deleteSchedule(dateDel, sectionDel);
    if (success) {
      const next = items.filter(
        (i) => !(i.date === dateDel && i.section === sectionDel)
      );
      setItems(next);
    }
  }

  async function handleExport() {
    // Prefer styled export; fall back to plain xlsx if needed
    let XLSX;
    try {
      XLSX = await import("xlsx-js-style");
    } catch {
      XLSX = await import("xlsx");
    }

    // Helper: build one styled sheet for a set of dates
    function buildSheet(datesSlice, sheetName) {
      // Header rows
      const header1 = ["Tanggal/ Bagian"];
      const header2 = [""];
      datesSlice.forEach((d) => {
        header1.push(fmtDateLabel(d), "", "", "");
        header2.push("WL", "SINGER", "MUSIK", "TARI");
      });

      const rows = SECTIONS.map((sec) => {
        const row = [sec];
        datesSlice.forEach((d) => {
          const it = byKey.get(keyOf(d, sec));
          row.push(
            Array.isArray(it?.wl) ? it.wl.join(", ") : (it?.wl ?? ""),
            (it?.singer || []).join(", "),
            (it?.musik || []).join(", "),
            (it?.tari || []).join(", ")
          );
        });
        return row;
      });

      const data = [header1, header2, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Merge top header cells for each date across 4 columns
      ws["!merges"] = ws["!merges"] || [];
      let col = 1; // after first column
      datesSlice.forEach(() => {
        ws["!merges"].push({ s: { r: 0, c: col }, e: { r: 0, c: col + 3 } });
        col += 4;
      });

      // Column widths
      const cols = [{ wch: 22 }];
      for (let i = 0; i < datesSlice.length * 4; i++) cols.push({ wch: 18 });
      ws["!cols"] = cols;

      // Row heights for headers
      ws["!rows"] = [{ hpt: 28 }, { hpt: 22 }];

      // Styles
      const border = {
        top: { style: "thin", color: { rgb: "888888" } },
        bottom: { style: "thin", color: { rgb: "888888" } },
        left: { style: "thin", color: { rgb: "888888" } },
        right: { style: "thin", color: { rgb: "888888" } },
      };
      const headerFill = { patternType: "solid", fgColor: { rgb: "E5E7EB" } };
      const subHeaderFill = { patternType: "solid", fgColor: { rgb: "F3F4F6" } };

      const range = XLSX.utils.decode_range(ws["!ref"] || `A1:A${data.length}`);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[addr] || (ws[addr] = { t: "s", v: "" });
          const isHeader1 = R === 0;
          const isHeader2 = R === 1;
          const base = {
            border,
            alignment: { vertical: "center", horizontal: C === 0 ? "left" : "left", wrapText: true },
          };
          if (isHeader1) {
            cell.s = {
              ...base,
              font: { bold: true },
              alignment: { horizontal: C === 0 ? "left" : "center", vertical: "center" },
              fill: headerFill,
            };
          } else if (isHeader2) {
            cell.s = {
              ...base,
              font: { bold: true },
              alignment: { horizontal: C === 0 ? "left" : "center", vertical: "center" },
              fill: subHeaderFill,
            };
          } else {
            cell.s = base;
            if (C === 0) cell.s.font = { bold: true };
          }
        }
      }

      // Freeze header rows and first column
      ws["!freeze"] = { xSplit: 1, ySplit: 2 };

      return { ws, sheetName };
    }

    // Group dates by month (YYYY-MM)
    const monthGroups = new Map();
    const monthName = (dStr) =>
      new Date(dStr + "T00:00:00").toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
    for (const d of dates) {
      const dt = new Date(d + "T00:00:00");
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      if (!monthGroups.has(key)) monthGroups.set(key, []);
      monthGroups.get(key).push(d);
    }

    // Create workbook with one sheet per month
    const wb = XLSX.utils.book_new();
    const usedNames = new Set();
    const sortedKeys = Array.from(monthGroups.keys()).sort();
    for (const key of sortedKeys) {
      const dlist = monthGroups.get(key).sort((a, b) => new Date(a) - new Date(b));
      // Sheet name: "Oktober" (append year if duplicated)
      const fullName = monthName(dlist[0]); // e.g., "Oktober 2025"
      let base = fullName.split(" ")[0]; // take month name only
      let name = base;
      let idx = 2;
      while (usedNames.has(name)) {
        name = `${base} (${idx++})`;
      }
      usedNames.add(name);

      const { ws } = buildSheet(dlist, name);
      XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
    }

    XLSX.writeFile(wb, "Laporan_Pelayanan_Ibadah.xlsx");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
  <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <h1 className="mb-6 text-2xl font-semibold">
          Dokumentasi Pelayanan Ibadah Raya
        </h1>

        {/* Form Input */}
        <form
          onSubmit={handleSave}
          className="mb-6 grid grid-cols-1 items-stretch gap-4 rounded-lg border bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-4">
            <span className="font-medium">Tanggal</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-2 outline-none focus:ring-2 focus:ring-zinc-600"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-4">
            <span className="font-medium">Bagian</span>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-2 outline-none focus:ring-2 focus:ring-zinc-600"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <MultiCheck
            label="WL (multi)"
            value={wl}
            onChange={setWl}
            options={people}
          />

          <MultiCheck
            label="Singer (multi)"
            value={singer}
            onChange={setSinger}
            options={people}
          />

          <MultiCheck
            label="Musik (multi)"
            value={musik}
            onChange={setMusik}
            options={people}
          />

          <MultiCheck
            label="Tari (multi)"
            value={tari}
            onChange={setTari}
            options={people}
          />

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Simpan / Update
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-100"
            >
              Bersihkan Form
            </button>
          </div>
        </form>

        {/* Actions + View Filters */}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Export ke Excel
          </button>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-zinc-700">Filter Bulan</label>
            <input
              type="month"
              value={monthView}
              onChange={(e) => setMonthView(e.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-zinc-600"
            />
            {monthView && (
              <button
                type="button"
                onClick={() => setMonthView("")}
                className="rounded border px-2 py-1 text-xs hover:bg-zinc-100"
              >
                Tampilkan semua
              </button>
            )}
          </div>
        </div>

        {/* Mobile-first cards */}
        <div className="md:hidden">
          {dates.length === 0 ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-zinc-600">
              Belum ada data.
            </div>
          ) : (
            <div className="space-y-4">
              {viewDates.map((d) => (
                <section key={d} className="rounded-lg border bg-white">
                  <div className="border-b p-3 text-sm font-medium">
                    {fmtDateLabel(d)}
                  </div>
                  <ul className="divide-y">
                    {SECTIONS.map((sec) => {
                      const it = byKey.get(keyOf(d, sec));
                      return (
                        <li key={`${d}-${sec}`} className="p-3 text-sm">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="font-medium">{sec}</span>
                            {it && (
                              <button
                                onClick={() => handleDelete(d, sec)}
                                className="text-xs text-red-600 underline"
                              >
                                hapus
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs text-zinc-700">
                            <div>
                              <div className="text-[10px] uppercase text-zinc-500">WL</div>
                              <div>{Array.isArray(it?.wl) ? it.wl.join(", ") : (it?.wl ?? "")}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-zinc-500">Singer</div>
                              <div>{(it?.singer || []).join(", ")}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-zinc-500">Musik</div>
                              <div>{(it?.musik || []).join(", ")}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase text-zinc-500">Tari</div>
                              <div>{(it?.tari || []).join(", ")}</div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Tabel Rekap (Desktop) */}
        <div className="hidden overflow-auto rounded-lg border bg-white shadow-sm md:block" id="table-container">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-zinc-100 text-left text-sm">
                <th className="sticky left-0 top-0 z-30 border bg-zinc-100 p-3">Tanggal/ Bagian</th>
                {viewDates.map((d) => (
                  <th
                    key={d}
                    data-date={d}
                    className={`sticky top-0 z-20 border p-3 text-center ${d === todayIso ? "bg-yellow-50" : "bg-zinc-100"}`}
                    colSpan={4}
                  >
                    {fmtDateLabel(d)}
                  </th>
                ))}
              </tr>
              <tr className="text-left text-xs text-zinc-600">
                <th className="sticky left-0 top-[44px] z-30 border bg-zinc-50 p-2"></th>
                {viewDates.map((d) => (
                  <>
                    <th key={`${d}-wl`} className={`sticky top-[44px] z-10 border p-2 ${d === todayIso ? "bg-yellow-50" : "bg-zinc-50"}`}>WL</th>
                    <th key={`${d}-s`} className={`sticky top-[44px] z-10 border p-2 ${d === todayIso ? "bg-yellow-50" : "bg-zinc-50"}`}>SINGER</th>
                    <th key={`${d}-m`} className={`sticky top-[44px] z-10 border p-2 ${d === todayIso ? "bg-yellow-50" : "bg-zinc-50"}`}>MUSIK</th>
                    <th key={`${d}-t`} className={`sticky top-[44px] z-10 border p-2 ${d === todayIso ? "bg-yellow-50" : "bg-zinc-50"}`}>TARI</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {SECTIONS.map((sec) => (
                <tr key={sec} className="even:bg-zinc-50">
                  <td className="sticky left-0 z-20 border bg-white p-2 font-medium">{sec}</td>
                  {viewDates.map((d) => {
                    const it = byKey.get(keyOf(d, sec));
                    const cell = (
                      <button
                        onClick={() => handleDelete(d, sec)}
                        className="ml-2 rounded border px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                        title="Hapus entri tanggal+bagian ini"
                      >
                        hapus
                      </button>
                    );
                    const wlEmpty = !it || isEmptyField(it.wl);
                    const sEmpty = !it || isEmptyField(it.singer);
                    const mEmpty = !it || isEmptyField(it.musik);
                    const tEmpty = !it || isEmptyField(it.tari);
                    return (
                      <>
                        <td key={`${sec}-${d}-wl`} className={`border p-2 align-top ${wlEmpty ? "bg-red-50" : d === todayIso ? "bg-yellow-50/50" : ""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span>{Array.isArray(it?.wl) ? it.wl.join(", ") : (it?.wl ?? "")}</span>
                            {it && cell}
                          </div>
                        </td>
                        <td key={`${sec}-${d}-s`} className={`border p-2 align-top ${sEmpty ? "bg-red-50" : d === todayIso ? "bg-yellow-50/50" : ""}`}>
                          {(it?.singer || []).join(", ")}
                        </td>
                        <td key={`${sec}-${d}-m`} className={`border p-2 align-top ${mEmpty ? "bg-red-50" : d === todayIso ? "bg-yellow-50/50" : ""}`}>
                          {(it?.musik || []).join(", ")}
                        </td>
                        <td key={`${sec}-${d}-t`} className={`border p-2 align-top ${tEmpty ? "bg-red-50" : d === todayIso ? "bg-yellow-50/50" : ""}`}>
                          {(it?.tari || []).join(", ")}
                        </td>
                      </>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <p className="mt-3 text-sm text-zinc-600">
            Belum ada data. Isi form di atas lalu klik Simpan.
          </p>
        )}
      </main>
    </div>
  );
}
