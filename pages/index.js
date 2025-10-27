import { useEffect, useMemo, useState, useRef } from "react";

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


async function fetchSchedules() {
  try {
    const res = await fetch('/api/schedules');
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json?.data)) return [];
    // Format ulang agar kompatibel dengan frontend
    return json.data.map(item => ({
      id: item.id,
      date: item.tanggal,
      section: item.bagian,
      wl: item.wl ? [item.wl] : [],
      singer: item.singer || [],
      musik: item.musik || [],
      tari: item.tari || [],
    }));
  } catch {
    return [];
  }
}

async function saveSchedule(date, section, wl, singer, musik, tari) {
  try {
    // Pastikan array tidak null
    const singerArr = Array.isArray(singer) ? singer : [];
    const musikArr = Array.isArray(musik) ? musik : [];
    const tariArr = Array.isArray(tari) ? tari : [];
    const arr = await fetchSchedules();
    const existing = arr.find(item => item.date === date && item.section === section);
    let res;
    const wlId = Array.isArray(wl) ? wl[0] || null : wl;
    if (existing) {
      // Update jadwal
      res = await fetch('/api/schedules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existing.id,
          tanggal: date,
          bagian: section,
          wl: wlId,
          singer: singerArr,
          musik: musikArr,
          tari: tariArr,
        }),
      });
    } else {
      // Insert jadwal baru
      res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: date,
          bagian: section,
          wl: wlId,
          singer: singerArr,
          musik: musikArr,
          tari: tariArr,
        }),
      });
    }
    if (!res.ok) throw new Error('Gagal simpan jadwal');
    return { ok: true };
  } catch (error) {
    console.error('Error saving schedule:', error);
    return null;
  }
}

async function deleteSchedule(date, section) {
  try {
    const arr = await fetchSchedules();
    const existing = arr.find(item => item.date === date && item.section === section);
    if (!existing) return false;
    const res = await fetch('/api/schedules', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: existing.id }),
    });
    if (!res.ok) throw new Error('Gagal hapus jadwal');
    return true;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return false;
  }
}

function MultiCheck({ label, value, onChange, options }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => options.filter((o) => o.name.toLowerCase().includes(q.toLowerCase())),
    [options, q]
  );
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };
  return (
    <fieldset className="flex h-64 flex-col gap-2 rounded-lg border border-zinc-200 p-2 text-xs sm:h-72 sm:p-3 sm:text-sm">
      <legend className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-700 sm:text-sm">
        {label}
      </legend>
      <div className="flex items-center gap-1 sm:gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari..."
          className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-zinc-600 sm:py-2 sm:text-sm"
        />
        <button
          type="button"
          onClick={() => onChange([])}
          className="whitespace-nowrap rounded border px-2 py-1 text-xs hover:bg-zinc-100 sm:px-3"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-auto rounded-md border border-zinc-200 p-1.5 sm:p-2">
        <ul className="flex flex-col gap-0.5 sm:gap-1">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-center gap-1.5 sm:gap-2">
              <input
                id={`${label}-${p.id}`}
                type="checkbox"
                className="h-4 w-4 cursor-pointer"
                checked={value.includes(p.id)}
                onChange={() => toggle(p.id)}
              />
              <label htmlFor={`${label}-${p.id}`} className="select-none cursor-pointer text-xs sm:text-sm">
                {p.name}
              </label>
            </li>
          ))}
        </ul>
      </div>
      {value.length > 0 && (
        <div className="truncate pt-0.5 text-xs text-zinc-600 sm:pt-1">
          Terpilih: {options.filter(p => value.includes(p.id)).map(p => p.name).join(", ")}
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
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
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

// Helper untuk mapping id ke nama
function idToName(id, peopleArr) {
  const found = peopleArr.find(p => String(p.id) === String(id));
  return found ? found.name : id;
}
function idsToNames(ids, peopleArr) {
  if (!Array.isArray(ids)) return '';
  return ids.map(id => idToName(String(id), peopleArr)).join(', ');
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState("");
  const [section, setSection] = useState(SECTIONS[0]);
  const [wl, setWl] = useState([]); // now multi-select
  const [singer, setSinger] = useState([]);
  const [musik, setMusik] = useState([]);
  const [tari, setTari] = useState([]);
  const [people, setPeople] = useState([]); // [{id, name}]
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [personFormName, setPersonFormName] = useState("");
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [peopleQuery, setPeopleQuery] = useState("");
  const searchInputRef = useRef(null);
  const [monthView, setMonthView] = useState(""); // YYYY-MM or empty for all
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null); // {date, section, item}

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
          // Simpan array objek {id, name}
          const arr = json.data
            .filter((p) => p?.active !== false)
            .map((p) => ({ id: p.id, name: p.name }))
            .filter((p) => p.id && p.name)
            .sort((a, b) => a.name.localeCompare(b.name));
          if (arr.length) setPeople(arr);
        }
      } catch {}
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Reload people list from API and update state
  async function reloadPeople() {
    setPeopleLoading(true);
    try {
      const res = await fetch('/api/people');
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        const arr = json.data
          .filter((p) => p?.active !== false)
          .map((p) => ({ id: p.id, name: p.name }))
          .filter((p) => p.id && p.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        setPeople(arr);
      }
    } catch (err) {
      console.error('Failed to reload people', err);
    } finally {
      setPeopleLoading(false);
    }
  }

  // When modal opens, focus the search input and listen for Escape to close
  useEffect(() => {
    if (!showPeopleModal) return;
    // focus search input (after next paint)
    setTimeout(() => searchInputRef.current?.focus?.(), 0);
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowPeopleModal(false);
        setEditingPersonId(null);
        setPersonFormName("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPeopleModal]);

  function openAddPerson() {
    setEditingPersonId(null);
    setPersonFormName("");
  }

  function openEditPerson(p) {
    setEditingPersonId(p.id);
    setPersonFormName(p.name || "");
  }

  async function handleCreatePerson(e) {
    e && e.preventDefault();
    if (!personFormName || personFormName.trim() === "") return;
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: personFormName.trim() })
      });
      if (!res.ok) throw new Error('Gagal tambah');
      await reloadPeople();
      setPersonFormName("");
    } catch (err) {
      console.error(err);
      alert('Gagal menambah nama');
    }
  }

  async function handleUpdatePerson(e) {
    e && e.preventDefault();
    if (!editingPersonId) return;
    try {
      const res = await fetch(`/api/people/${editingPersonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: personFormName })
      });
      if (!res.ok) throw new Error('Gagal update');
      await reloadPeople();
      setEditingPersonId(null);
      setPersonFormName("");
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah nama');
    }
  }

  async function handleDeletePerson(id) {
    if (!confirm('Hapus nama ini?')) return;
    try {
      const res = await fetch(`/api/people/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('Gagal hapus');
      await reloadPeople();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus nama');
    }
  }

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

    // Save to localStorage
    const result = await saveSchedule(date, section, wl, singer, musik, tari);
    if (result && result.ok) {
      // Buat rec baru
      const rec = { id: `${date}::${section}`, date, section, wl, singer, musik, tari };
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
      // Update localStorage juga
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
          // Mapping id ke nama
          const wlName = idToName(it?.wl, people);
          const singerNames = idsToNames(it?.singer, people);
          const musikNames = idsToNames(it?.musik, people);
          const tariNames = idsToNames(it?.tari, people);
          row.push(
            wlName,
            singerNames,
            musikNames,
            tariNames
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
        <h1 className="mb-6 text-2xl font-semibold text-center">
          Dokumentasi Pelayanan Ibadah Raya
        </h1>

        {/* Form Input */}
        <form
          onSubmit={handleSave}
          className="mb-6 rounded-lg border bg-white p-3 shadow-sm sm:p-4"
        >
          {/* Date & Section Row */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Tanggal</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-600"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Bagian</span>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-600"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* MultiCheck Grid - Stack on mobile, 2x2 on tablet, 4x1 on desktop */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MultiCheck
              label="WL"
              value={wl}
              onChange={setWl}
              options={people}
            />

            <MultiCheck
              label="Singer"
              value={singer}
              onChange={setSinger}
              options={people}
            />

            <MultiCheck
              label="Musik"
              value={musik}
              onChange={setMusik}
              options={people}
            />

            <MultiCheck
              label="Tari (Optional)"
              value={tari}
              onChange={setTari}
              options={people}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-900"
            >
              Simpan / Update
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 active:bg-zinc-200"
            >
              Bersihkan Form
            </button>
          </div>
        </form>

        {/* Actions + View Filters */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            onClick={handleExport}
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 active:bg-green-800 sm:px-4"
          >
            Export ke Excel
          </button>

          <button
            onClick={() => {
              setShowPeopleModal(true);
              reloadPeople();
            }}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 sm:px-4"
          >
            Kelola Nama
          </button>

          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-2">
            <label className="text-xs text-zinc-700 sm:text-sm">Filter Bulan</label>
            <input
              type="month"
              value={monthView}
              onChange={(e) => setMonthView(e.target.value)}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-zinc-600 sm:text-sm"
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

  {/* Mobile-first cards (disabled, we use horizontal table even on mobile) */}

  {/* People management modal */}
  {showPeopleModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kelola Nama (People)</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowPeopleModal(false); setEditingPersonId(null); setPersonFormName(""); }}
              className="rounded border px-2 py-1 text-sm hover:bg-zinc-100"
            >
              Tutup
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex gap-2">
            <input
              ref={searchInputRef}
              value={peopleQuery}
              onChange={(e) => setPeopleQuery(e.target.value)}
              placeholder="Cari nama..."
              className="flex-1 rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => { setPeopleQuery(""); searchInputRef.current?.focus?.(); }}
              className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-100"
            >
              Clear
            </button>
          </div>

          <form onSubmit={editingPersonId ? handleUpdatePerson : handleCreatePerson} className="flex gap-2">
            <input
              value={personFormName}
              onChange={(e) => setPersonFormName(e.target.value)}
              placeholder="Nama baru / ubah..."
              className="flex-1 rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {editingPersonId ? 'Simpan' : 'Tambah'}
            </button>
            {editingPersonId && (
              <button
                type="button"
                onClick={() => { setEditingPersonId(null); setPersonFormName(""); }}
                className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-100"
              >
                Batal
              </button>
            )}
          </form>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-zinc-600">Daftar Nama</div>
            <div className="text-xs text-zinc-500">{peopleLoading ? 'Memuat...' : `${people.length} item`}</div>
          </div>
          <ul className="space-y-1">
            {people
              .filter((p) => p.name.toLowerCase().includes(peopleQuery.trim().toLowerCase()))
              .map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="truncate text-sm">{p.name}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditPerson(p)}
                      className="rounded border px-2 py-1 text-xs hover:bg-zinc-100"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => handleDeletePerson(p.id)}
                      className="rounded border border-red-400 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            {people.length === 0 && (
              <li className="rounded-md border p-2 text-sm text-zinc-600">Tidak ada data.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )}

  <div className="hidden">
          {dates.length === 0 ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-zinc-600">
              Belum ada data.
            </div>
          ) : (
            <div className="space-y-4">
              {viewDates.map((d) => (
                <section key={d} className="rounded-lg border bg-white">
                  {/* Date header */}
                  <div className="border-b p-3 text-sm font-medium">
                    {fmtDateLabel(d)}
                  </div>

                  {/* Subheader shown ONCE per date */}
                  <div className="grid grid-cols-5 items-center gap-2 border-b px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-500">
                    <div className="font-medium text-zinc-600">Bagian</div>
                    <div className="text-center">WL</div>
                    <div className="text-center">Singer</div>
                    <div className="text-center">Musik</div>
                    <div className="text-center">Tari</div>
                  </div>

                  {/* Rows */}
                  <ul className="divide-y">
                    {SECTIONS.map((sec) => {
                      const it = byKey.get(keyOf(d, sec));
                      const wl = Array.isArray(it?.wl) ? it.wl.join(", ") : (it?.wl ?? "");
                      const s = (it?.singer || []).join(", ");
                      const m = (it?.musik || []).join(", ");
                      const t = (it?.tari || []).join(", ");
                      return (
                        <li key={`${d}-${sec}`} className="grid grid-cols-5 items-start gap-2 px-3 py-2 text-[13px]">
                          <div className="pr-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{sec}</span>
                              {it && (
                                <button
                                  onClick={() => handleDelete(d, sec)}
                                  className="text-[11px] text-red-600 underline"
                                >
                                  hapus
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="min-h-[20px] break-words text-center text-xs">{wl || "—"}</div>
                          <div className="min-h-[20px] break-words text-center text-xs">{s || "—"}</div>
                          <div className="min-h-[20px] break-words text-center text-xs">{m || "—"}</div>
                          <div className="min-h-[20px] break-words text-center text-xs">{t || "—"}</div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Tabel Rekap - digunakan di semua ukuran layar (scroll horizontal di mobile) */}
        <div className="overflow-auto rounded-lg border bg-white shadow-sm" id="table-container">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-zinc-100 text-left text-sm">
                <th className="sticky left-0 top-0 z-30 w-36 sm:w-48 border bg-zinc-100 p-2 sm:p-3">Tanggal/ Bagian</th>
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
                  <td className="sticky left-0 z-20 w-36 sm:w-48 border bg-white p-2 font-medium whitespace-nowrap">{sec}</td>
                  {viewDates.map((d) => {
                    const it = byKey.get(keyOf(d, sec));
                    const cell = (
                      <button
                        onClick={() => setPendingDelete({ date: d, section: sec, item: it })}
                        className="ml-2 inline-flex items-center justify-center rounded p-1 text-red-600 hover:bg-red-50"
                        aria-label={`Hapus ${sec} pada ${fmtDateLabel(d)}`}
                        title="Hapus"
                      >
                        {/* trash icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path fillRule="evenodd" d="M9 2.25A2.25 2.25 0 0 0 6.75 4.5v.75H4.5a.75.75 0 0 0 0 1.5h.69l.8 12A2.25 2.25 0 0 0 8.24 21h7.52a2.25 2.25 0 0 0 2.25-2.25l.8-12h.69a.75.75 0 0 0 0-1.5h-2.25V4.5A2.25 2.25 0 0 0 15 2.25H9Zm6.75 3V4.5A.75.75 0 0 0 15 3.75H9A.75.75 0 0 0 8.25 4.5v.75h7.5Zm-6 4.5a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    );
                    const wlEmpty = !it || isEmptyField(it.wl);
                    const sEmpty = !it || isEmptyField(it.singer);
                    const mEmpty = !it || isEmptyField(it.musik);
                    const tEmpty = !it || isEmptyField(it.tari);
                    const wlName = idToName(it?.wl, people);
                    const singerNames = idsToNames(it?.singer, people);
                    const musikNames = idsToNames(it?.musik, people);
                    const tariNames = idsToNames(it?.tari, people);
                    return (
                      <>
                        <td key={`${sec}-${d}-wl`} className={`border p-2 align-top ${wlEmpty ? "bg-red-50" : d === todayIso ? "bg-yellow-50/50" : ""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span>{wlName}</span>
                            {it && cell}
                          </div>
                        </td>
                        <td key={`${sec}-${d}-s`} className={`border p-2 align-top ${sEmpty ? "bg-red-50" : d === todayIso ? "bg-yellow-50/50" : ""}`}>
                          {singerNames}
                        </td>
                        <td key={`${sec}-${d}-m`} className={`border p-2 align-top ${mEmpty ? "bg-red-50" : d === todayIso ? "bg-yellow-50/50" : ""}`}>
                          {musikNames}
                        </td>
                        <td key={`${sec}-${d}-t`} className={`border p-2 align-top ${tEmpty ? "bg-red-50" : d === todayIso ? "bg-yellow-50/50" : ""}`}>
                          {tariNames}
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
      {/* Confirm Delete Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b p-4 text-base font-semibold">Konfirmasi Hapus</div>
            <div className="space-y-2 p-4 text-sm">
              <p>Anda yakin ingin menghapus data berikut?</p>
              <div className="rounded-md border bg-zinc-50 p-3">
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Tanggal</span>
                  <span>{fmtDateLabel(pendingDelete.date)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Bagian</span>
                  <span>{pendingDelete.section}</span>
                </div>
                <hr className="my-2" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium text-zinc-700">WL</div>
                    <div>{(pendingDelete.item?.wl || []).join(", ") || "—"}</div>
                  </div>
                  <div>
                    <div className="font-medium text-zinc-700">Singer</div>
                    <div>{(pendingDelete.item?.singer || []).join(", ") || "—"}</div>
                  </div>
                  <div>
                    <div className="font-medium text-zinc-700">Musik</div>
                    <div>{(pendingDelete.item?.musik || []).join(", ") || "—"}</div>
                  </div>
                  <div>
                    <div className="font-medium text-zinc-700">Tari</div>
                    <div>{(pendingDelete.item?.tari || []).join(", ") || "—"}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t p-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded border px-3 py-2 text-sm hover:bg-zinc-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleDelete(pendingDelete.date, pendingDelete.section);
                  setPendingDelete(null);
                }}
                className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
