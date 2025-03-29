import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
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
  const inputRef = useRef(null);




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
  
      <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Velg lokasjon</label>
      <div className="flex gap-2 flex-wrap">
        <select
          value={aktivLokasjon}
          onChange={(e) => setAktivLokasjon(e.target.value)}
          className="p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 appearance-none transition-colors duration-300"
          >
          {Object.keys(lokasjoner).map((lokasjon) => (
            <option
              key={lokasjon}
              value={lokasjon}
              className="bg-white text-black dark:bg-gray-700 dark:text-white"
            >
              {lokasjon}
            </option>
                    ))}
                    </select>
                    <Input
                      ref={inputRef}
                      value={tempLokasjonNavn || aktivLokasjon}
                      onChange={(e) => setTempLokasjonNavn(e.target.value)}
                      onBlur={() => oppdaterLokasjonNavn(aktivLokasjon, tempLokasjonNavn)}
                      className="w-40 bg-white text-black dark:bg-gray-800 dark:text-white border dark:border-gray-600 transition-colors duration-300"
                    />
                    <Button onClick={leggTilLokasjon} className="bg-green-600 text-white hover:bg-green-700">
                      + Lokasjon
                    </Button>
                    <Button onClick={() => fjernLokasjon(aktivLokasjon)} className="bg-red-600 text-white hover:bg-red-700">
                      Slett lokasjon
                    </Button>
                  </div>
                </div>
               
              );
  
      <div className="flex gap-4 mb-4">
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
        className="text-sm text-blue-700 dark:text-blue-300 hover:underline"
        onClick={() => toggleDetaljer(idx)}
      >
        {visDetaljer.includes(idx) ? "Skjul detaljer" : "Vis detaljer"}
      </Button>
    </div>

    <Input
      value={silo.fortype}
      onChange={(e) => oppdaterFortype(idx, e.target.value)}
      placeholder="Fôrtype"
      className="mb-2 bg-white text-black dark:bg-gray-700 dark:text-white border dark:border-gray-600 transition-colors duration-300"
    />

    {visDetaljer.includes(idx) && (
      <>
        {brukMerder ? (
          silo.merder.map((merde, j) => (
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
              <Button variant="ghost" size="sm" onClick={() => fjernMerde(idx, j)}>
                X
              </Button>
            </div>
          ))
        ) : (
          <div className="flex gap-2 items-center mb-2">
            <span className="w-28">Daglig forbruk</span>
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

        {brukMerder && (
          <Button
            size="sm"
            className="bg-green-700 text-white hover:bg-green-800 mt-1"
            onClick={() => leggTilMerde(idx)}
          >
            + Merde
          </Button>
        )}
      </>
    )}

    <div className="mt-2">
      <p>
        ({beregnSum(silo)} kg) × {faktor} = <strong>{beregnTotal(silo)} kg</strong> →{" "}
        {Math.ceil(beregnTotal(silo) / 750)} sekker
      </p>
    </div>

    <Button variant="ghost" size="sm" onClick={() => fjernSilo(idx)}>
      Fjern silo
    </Button>
  </div>
))}

  
      <><Button onClick={leggTilSilo} className="bg-green-800 text-white hover:bg-green-00 mb-4">
    + Legg til silo
  </Button><div className="bg-gray-100 dark:bg-gray-800 p-4 rounded transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-2">Totaler per fôrtype</h2>
      {Object.entries(summer).map(([fortype, kg]) => (
        <p key={fortype}>
          {fortype}: {kg} kg → {Math.ceil(kg / 750)} sekker
        </p>
      ))}
      <p className="mt-2 font-bold">Total fôrbehov: {totalSum} kg</p>
    </div></>
  
      {visHjelp && (
        <div className="mt-6 text-sm text-gray-800 dark:text-gray-200 border dark:border-gray-600 rounded p-4 transition-colors duration-300">
          <p className="mb-2 font-semibold">Hvorfor rundes det til 750 kg?</p>
          <p>Fordi sekker leveres i 750 kg bulk, og bestilling skjer i hele sekker.</p>
          <p className="mt-1">Små avvik kan forekomme, men de er innenfor toleransegrensen.</p>
          <hr className="my-2" />
          <p className="mb-2 font-semibold">Hvordan bruke kalkulatoren</p>
          <ul className="list-disc ml-4">
            <li>Legg inn ønsket antall dager og bufferfaktor</li>
            <li>Registrer siloer og tilhørende fôrtype og forbruk</li>
            <li>Klikk "+ Merde" for å registrere merder</li>
            <li>Systemet summerer og beregner bestilling</li>
          </ul>
          <p className="mt-2">Kontakt utvikler ved spørsmål eller forbedringsforslag.</p>
        </div>
      )}
    </div>
  );
}