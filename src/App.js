import React, { useState, useEffect,  } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { Moon, Sun, HelpCircle, Pencil, Plus, Trash2 } from "lucide-react"




const DEFAULT_LOKASJON = "Lokalitet1";

export default function ForKalkisPreview() {
  const [brukMerder, setBrukMerder] = useState(false);
  const [dager, setDager] = useState(7);
  const [faktor, setFaktor] = useState(1.2);
  const [visDetaljer, setVisDetaljer] = useState([]);
  const [aktivLokasjon, setAktivLokasjon] = useState(DEFAULT_LOKASJON);
  const [lokasjoner, setLokasjoner] = useState({});
  const [visHjelp, setVisHjelp] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState("");
  const [tempLokasjonNavn, setTempLokasjonNavn] = useState("");
  const [redigerer, setRedigerer] = useState("");





  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const lagret = localStorage.getItem("forkalkisData");
    if (lagret) {
      const parsed = JSON.parse(lagret);
      setLokasjoner(parsed.lokasjoner || {});
      setAktivLokasjon(parsed.aktivLokasjon || DEFAULT_LOKASJON);
      setDager(parsed.dager || 7);
      setFaktor(parsed.faktor || 1.2);
      setBrukMerder(parsed.brukMerder || false);
    } else {
      setLokasjoner({
        [DEFAULT_LOKASJON]: [
          {
            navn: "Silo 1",
            fortype: "200",
            merder: [{ navn: "Merde 1", dagligForbruk: 0 }],
            manueltDagligForbruk: 0,
          },
        ],
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "forkalkisData",
      JSON.stringify({ lokasjoner, aktivLokasjon, dager, faktor, brukMerder })
    );
    localStorage.setItem("visDetaljer", JSON.stringify(visDetaljer));
    setToast("Lagret!");
    const t = setTimeout(() => setToast(""), 1500);
    return () => clearTimeout(t);
  }, [lokasjoner, aktivLokasjon, dager, faktor, brukMerder, visDetaljer]);

  const siloer = lokasjoner[aktivLokasjon] || [];

  const oppdaterSiloer = (nySiloer) => {
    setLokasjoner((prev) => ({ ...prev, [aktivLokasjon]: nySiloer }));
  };

  const leggTilSilo = () => {
    const ny = [
      ...siloer,
      {
        navn: `Silo ${siloer.length + 1}`,
        fortype: "",
        merder: [],
        manueltDagligForbruk: 0,
      },
    ];
    oppdaterSiloer(ny);
  };

  const leggTilLokasjon = () => {
    const nyLokasjon = `Lokalitet ${Object.keys(lokasjoner).length + 1}`;
    const nyLokasjoner = {
      ...lokasjoner,
      [nyLokasjon]: [
        {
          navn: "Silo 1",
          fortype: "200",
          merder: [{ navn: "Merde 1", dagligForbruk: 0 }],
          manueltDagligForbruk: 0,
        },
      ],
    };
    setLokasjoner(nyLokasjoner);
    setAktivLokasjon(nyLokasjon);
  };

  const fjernLokasjon = (lokasjonNavn) => {
    const nyLokasjoner = { ...lokasjoner };
    delete nyLokasjoner[lokasjonNavn];
    setLokasjoner(nyLokasjoner);
    if (aktivLokasjon === lokasjonNavn) {
      const lokasjonerNøkler = Object.keys(nyLokasjoner);
      setAktivLokasjon(lokasjonerNøkler[0] || DEFAULT_LOKASJON);
    }
  };

  const fjernSilo = (index) => {
    const ny = [...siloer];
    ny.splice(index, 1);
    oppdaterSiloer(ny);
  };
  const toggleDetaljer = (index) => {
    setVisDetaljer((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const leggTilMerde = (siloIndex) => {
    if (!brukMerder) return;
    const ny = [...siloer];
    const nyttNavn = `Merde ${ny[siloIndex].merder.length + 1}`;
    ny[siloIndex].merder.push({ navn: nyttNavn, dagligForbruk: 0 });
    oppdaterSiloer(ny);
  };

  const fjernMerde = (siloIndex, merdeIndex) => {
    const ny = [...siloer];
    ny[siloIndex].merder.splice(merdeIndex, 1);
    oppdaterSiloer(ny);
  };

  const oppdaterMerdeNavn = (siloIndex, merdeIndex, navn) => {
    const ny = [...siloer];
    ny[siloIndex].merder[merdeIndex].navn = navn;
    oppdaterSiloer(ny);
  };

  const oppdaterFortype = (siloIndex, verdi) => {
    const ny = [...siloer];
    ny[siloIndex].fortype = verdi;
    oppdaterSiloer(ny);
  };

  const oppdaterSilonavn = (siloIndex, verdi) => {
    const ny = [...siloer];
    ny[siloIndex].navn = verdi;
    oppdaterSiloer(ny);
  };

  const oppdaterLokasjonNavn = (lokasjonNavn, nyttNavn) => {
    if (nyttNavn.trim() === "") return;
    const nyeLokasjoner = { ...lokasjoner };
    if (nyeLokasjoner[lokasjonNavn]) {
      nyeLokasjoner[nyttNavn] = nyeLokasjoner[lokasjonNavn];
      delete nyeLokasjoner[lokasjonNavn];
      setLokasjoner(nyeLokasjoner);
      setAktivLokasjon(nyttNavn);
    }
  };

  const beregnSum = (silo) => {
    return brukMerder
      ? silo.merder.reduce((sum, m) => sum + m.dagligForbruk, 0)
      : silo.manueltDagligForbruk;
  };

  const beregnTotal = (silo) => {
    return Math.round(beregnSum(silo) * faktor);
  };

  const summerPerFortype = () => {
    const summer = {};
    siloer.forEach((silo) => {
      const total = beregnTotal(silo);
      const fortype = silo.fortype || "Ukjent";
      if (!summer[fortype]) summer[fortype] = 0;
      summer[fortype] += total;
    });
    return summer;
  };

  const summer = summerPerFortype();
  const totalSum = Object.values(summer).reduce((a, b) => a + b, 0);

  return (
    
    <div className="max-w-4xl mx-auto p-4 sm:my-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded shadow-md transition-colors duration-300">
       {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50">
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-lg font-bold sm:text-3xl">Fôrkalkulator</h1>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button  onClick={() => setDarkMode(!darkMode)}
  className="p-2 rounded-full 
             bg-gray-200 dark:bg-gray-700 
             hover:bg-blue-300 dark:hover:bg-blue-600 
             
             transition-colors"
>
  {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </Button>
          <Button
            onClick={() => setVisHjelp((prev) => !prev)} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800">
           <HelpCircle size={16} />
           Hjelp
          </Button>
        </div>
      </div>
  
      <div className="mb-4 space-y-1">
  <label className="block text-sm font-medium">Velg lokasjon</label>
  <div className="flex flex-wrap gap-2">
    {Object.keys(lokasjoner).map((navn) => (
      <div
      key={navn}
      className={`flex items-center gap-2 px-3 py-1 rounded border cursor-pointer
        ${navn === aktivLokasjon 
          ? "bg-blue-600 text-white" 
          : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        }`}
    >
    
        {redigerer === navn ? (
         <input
         className="w-32 h-8 px-2 rounded border bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
         value={tempLokasjonNavn}
         onChange={(e) => setTempLokasjonNavn(e.target.value)}
         onBlur={() => {
           oppdaterLokasjonNavn(navn, tempLokasjonNavn);
           setRedigerer("");
         }}
         onKeyDown={(e) => {
           if (e.key === "Enter") {
             oppdaterLokasjonNavn(navn, tempLokasjonNavn);
             setRedigerer("");
           } else if (e.key === "Escape") {
             setRedigerer("");
           }
         }}
         autoFocus
       />
       
        ) : (
          <span className="cursor-pointer" onClick={() => setAktivLokasjon(navn)}>
            {navn}
          </span>
        )}
        <button
          className="p-1 hover:bg-gray-300 rounded"
          onClick={() => {
            setRedigerer(navn);
            setTempLokasjonNavn(navn);
          }}
        >
          <Pencil size={14} />
        </button>
        <button
          className="p-1 hover:bg-red-200 rounded"
          onClick={() => fjernLokasjon(navn)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    ))}
    <button
      onClick={leggTilLokasjon}
      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
    >
      <Plus size={16} /> Ny lokasjon
    </button>
  </div>
</div>

               
              
  
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
  <div className="flex flex-wrap gap-4">
    <div className="flex items-center gap-2">
      <span>Dager:</span>
      <Input
        type="number"
        value={dager}
        onChange={(e) => setDager(Number(e.target.value))}
        className="w-24 bg-white text-black dark:bg-gray-800 dark:text-white border dark:border-gray-600 transition-colors duration-300"
      />
    </div>
    <div className="flex items-center gap-2">
      <span>Faktor:</span>
      <Input
        type="number"
        step="0.01"
        value={faktor}
        onChange={(e) => setFaktor(Number(e.target.value))}
        className="w-24 bg-white text-black dark:bg-gray-800 dark:text-white border dark:border-gray-600 transition-colors duration-300"
      />
    </div>
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <Switch checked={brukMerder} onCheckedChange={setBrukMerder} />
      <span className="text-sm font-medium">Bruk merder</span>
    </label>
  </div>

  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm space-y-1">
    <h2 className="font-semibold mb-1">Totaler per fôrtype:</h2>
    {Object.entries(summer).map(([fortype, kg]) => {
      const antallSekker = Math.ceil(kg / 750);
      const levertKg = antallSekker * 750;
      return (
        <p key={fortype}>
          {fortype}: {kg} kg → {antallSekker} sekker → Levert: {levertKg} kg
        </p>
      );
    })}
    <p className="mt-1 font-bold">Total fôrbehov: {totalSum} kg</p>
    <p className="font-bold">
      Faktisk bestilling:{" "}
      {Object.entries(summer).reduce(
        (sum, [, kg]) => sum + Math.ceil(kg / 750) * 750,
        0
      )}{" "}
      kg
    </p>
  </div>
</div>

  
      {siloer.map((silo, idx) => (
  <div
    key={idx}
    className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-4 mb-4 rounded transition-colors duration-300"
  >
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold">{silo.navn}</h3>
      <Button
  size="sm"
  variant="ghost"
  onClick={() => toggleDetaljer(idx)}
>
  {visDetaljer.includes(idx) ? "Skjul utregning" : "Vis utregning"}
</Button>

    </div>

    <Input
      value={silo.fortype}
      onChange={(e) => oppdaterFortype(idx, e.target.value)}
      placeholder="Fôrtype"
      className="mb-2 bg-white text-black dark:bg-gray-700 dark:text-white border dark:border-gray-600 transition-colors duration-300"
    />


{brukMerder ? (
  <>
    {silo.merder.map((merde, j) => (
      <div key={j} className="flex gap-2 items-center mb-2">
        <Input
          value={merde.navn}
          onChange={(e) => oppdaterMerdeNavn(idx, j, e.target.value)}
          className="w-32 bg-white text-black dark:bg-gray-700 dark:text-white border dark:border-gray-600 transition-colors duration-300"
        />
        <Input
          type="number"
          value={merde.dagligForbruk}
          onChange={(e) => {
            const ny = [...siloer];
            ny[idx].merder[j].dagligForbruk = Number(e.target.value);
            oppdaterSiloer(ny);
          }}
          className="w-24 bg-white text-black dark:bg-gray-700 dark:text-white border dark:border-gray-600 transition-colors duration-300"
        />
        <span className="text-sm">kg</span>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => fjernMerde(idx, j)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          ✕
        </Button>
      </div>
    ))}
    <Button
      size="sm"
      className="bg-green-700 text-white hover:bg-green-800 mt-1"
      onClick={() => leggTilMerde(idx)}
    >
      + Merde
    </Button>
  </>
) : (
  <div className="flex gap-2 items-center mb-2">
    <span className="w-24">Daglig forbruk</span>
    <Input
      type="number"
      value={silo.manueltDagligForbruk}
      onChange={(e) => {
        const ny = [...siloer];
        ny[idx].manueltDagligForbruk = Number(e.target.value);
        oppdaterSiloer(ny);
      }}
      className="w-24 bg-white text-black dark:bg-gray-700 dark:text-white border dark:border-gray-600 transition-colors duration-300"
    />
    <span className="text-sm">kg</span>
  </div>
)}




{visDetaljer.includes(idx) && (
  <div className="mt-2">
    <p>
      ({beregnSum(silo)} kg) × {faktor} = <strong>{beregnTotal(silo)} kg</strong> → {Math.ceil(beregnTotal(silo) / 750)} sekker
    </p>
  </div>
)}


    <Button variant="ghost" size="sm" onClick={() => fjernSilo(idx)}>
      Fjern silo
    </Button>
  </div>
))}

  
      <><Button onClick={leggTilSilo} className="bg-green-800 text-white hover:bg-green-00 mb-4">
    + Legg til silo
  </Button><div className="bg-gray-100 dark:bg-gray-800 p-4 rounded transition-colors duration-300">
  <h2 className="text-xl font-semibold mb-2">Totaler per fôrtype</h2>
  {Object.entries(summer).map(([fortype, kg]) => {
    const antallSekker = Math.ceil(kg / 750);
    const levertKg = antallSekker * 750;
    return (
      <p key={fortype}>
        {fortype}: {kg} kg → {antallSekker} sekker → Levert: {levertKg} kg
      </p>
    );
  })}
  <p className="mt-2 font-bold">
    Total fôrbehov: {totalSum} kg
  </p>
  <p className="font-bold">
    Faktisk bestilling:{" "}
    {Object.entries(summer).reduce(
      (sum, [, kg]) => sum + Math.ceil(kg / 750) * 750,
      0
    )}{" "}
    kg
  </p>
</div>
</>
  
{visHjelp && (
  <div className="mt-6 text-sm text-gray-800 dark:text-gray-200 border dark:border-gray-600 rounded p-4 transition-colors duration-300">
    <p className="mb-2 font-semibold">Hvordan bruke kalkulatoren</p>
    <ul className="list-disc ml-4 mb-2">
      <li>Legg inn ønsket antall dager og bufferfaktor.</li>
      <li>Registrer siloer med tilhørende fôrtype og daglig forbruk.</li>
      <li>Dersom du bruker <strong>merdebasert fordeling</strong>, trykk <strong>"+ Merde"</strong> for å legge til merder under hver silo.</li>
      <li>Kalkulatoren summerer forbruket og ganger det med bufferfaktoren.</li>
      <li>Resultatet vises som totalvekt og antall sekker som må bestilles.</li>
      <li>Trykk på <strong>"Vis utregning"</strong> for å se detaljer per silo.</li>
    </ul>

    <p className="mb-2 font-semibold">Hva betyr bufferfaktor?</p>
    <p className="mb-4">
      Fiskens biomasse øker når den fôres, som gjør at forbruket vokser over tid. Bufferfaktoren tar høyde for denne veksten. 
      For eksempel, hvis bufferfaktoren er <strong>1.2</strong>, betyr det at det reelle behovet økes med 20 % – for å unngå underbestilling i perioden.
    </p>

    <p className="mb-2 font-semibold">Hvorfor rundes det til 750 kg?</p>
    <p>
      Fôr leveres i bulksekker på 750 kg, og det må bestilles i hele sekker.
      Kalkulatoren runder derfor opp til nærmeste hele sekk. 
      Små avvik kan forekomme, men disse er innenfor toleransegrensen.
    </p>
    
  </div>
)}
    </div>
  );
}