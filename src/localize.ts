import type { HomeAssistant, HassEntity } from "./types";

const nb = {
  "Card configuration must be an object.":
    "Kortkonfigurasjonen må være et objekt.",
  "Unsupported appliance card type.": "Apparatkorttypen støttes ikke.",
  "Select a Home Connect Local device (ID or name).":
    "Velg et Home Connect Local-apparat (ID eller navn).",
  "devices must be an array of device IDs or names.":
    "devices må være en liste med apparat-ID-er eller navn.",
  "appearance must be default or bubble.":
    "appearance må være default eller bubble.",
  "oven_modules must be auto or an array containing microwave and/or steam.":
    "oven_modules må være auto eller en liste som inneholder microwave og/eller steam.",
  "{field} must be a string.": "{field} må være en tekststreng.",
  "{field} must be true or false.": "{field} må være true eller false.",
  Preheating: "Forvarmer",
  Heating: "Varmer",
  Washing: "Vasker",
  Rinsing: "Skyller",
  Drying: "Tørker",
  Cleaning: "Rengjør",
  Descaling: "Avkalker",
  Brewing: "Brygger",
  Connected: "Tilkoblet",
  Ajar: "På gløtt",
  Off: "Av",
  Ready: "Klar",
  "Delayed start": "Utsatt start",
  Running: "Kjører",
  Paused: "Satt på pause",
  Finished: "Ferdig",
  Error: "Feil",
  "Needs attention": "Trenger oppmerksomhet",
  Stopping: "Stopper",
  Offline: "Frakoblet",
  "Status unknown": "Ukjent status",
  Oven: "Stekeovn",
  Dishwasher: "Oppvaskmaskin",
  "Coffee machine": "Kaffemaskin",
  Refrigerator: "Kjøleskap",
  Washer: "Vaskemaskin",
  Dryer: "Tørketrommel",
  Appliance: "Apparat",
  "Time unknown": "Ukjent tid",
  Cooling: "Kjøler",
  "Not reported": "Ikke rapportert",
  Unavailable: "Utilgjengelig",
  Unknown: "Ukjent",
  Open: "Åpen",
  Closed: "Lukket",
  Action: "Handling",
  Stop: "Stopp",
  Start: "Start",
  Pause: "Pause",
  Resume: "Fortsett",
  "Choose your drink": "Velg drikke",
  Programme: "Program",
  "Until start": "Til start",
  "Paused · remaining": "Satt på pause · gjenstår",
  Remaining: "Gjenstår",
  "Programme progress": "Programfremdrift",
  Microwave: "Mikrobølgeovn",
  Steam: "Damp",
  "Temperature zones": "Temperatursoner",
  Doors: "Dører",
  "Cooling modes": "Kjølemoduser",
  "Your coffee": "Din kaffe",
  "Wash options": "Vaskevalg",
  "Programme options": "Programvalg",
  "Door & temperature": "Dør og temperatur",
  "Programme timing": "Programtid",
  "Consumables & care": "Forbruksvarer og vedlikehold",
  Settings: "Innstillinger",
  "Remote start": "Fjernstart",
  Other: "Annet",
  Kitchen: "Kjøkken",
  "In progress": "Pågår",
  "No running programmes reported. Some appliance states are unavailable.":
    "Ingen programmer rapportert som kjørende. Status for enkelte apparater er utilgjengelig.",
  "Nothing is running.": "Ingen programmer kjører.",
  "Some appliance states are unavailable.":
    "Status for enkelte apparater er utilgjengelig.",
  "All clear.": "Alt i orden.",
  "All appliances": "Alle apparater",
  "Disconnected from Home Assistant.": "Frakoblet Home Assistant.",
  "Retry discovery": "Søk på nytt",
  "Finding your appliances…": "Søker etter apparatene dine …",
  "No matching Home Connect Local appliance.":
    "Fant ingen samsvarende Home Connect Local-apparater.",
  "Close details": "Lukk detaljer",
  "Confirm appliance command": "Bekreft apparatkommando",
  "This may start the appliance. Check that it is ready for remote operation.":
    "Dette kan starte apparatet. Kontroller at det er klart for fjernstyring.",
  Cancel: "Avbryt",
  Confirm: "Bekreft",
  "Remote-start permission is not exposed. The appliance must permit remote operation.":
    "Tillatelse til fjernstart er ikke tilgjengelig. Apparatet må tillate fjernstyring.",
  "This control is unavailable.": "Denne kontrollen er utilgjengelig.",
  "Device discovery is unavailable. Try again after reconnecting.":
    "Apparatsøk er utilgjengelig. Prøv igjen etter at tilkoblingen er gjenopprettet.",
  "Command sent. Waiting for appliance status.":
    "Kommando sendt. Venter på apparatstatus.",
  "The appliance changed. Review its current status and try again.":
    "Apparatet har endret seg. Kontroller gjeldende status og prøv igjen.",
  "Enter a valid value within the appliance limits.":
    "Angi en gyldig verdi innenfor apparatets grenser.",
  "Devices are discovered from Home Connect Local. Configured names stay unchanged until you select another device.":
    "Apparater hentes fra Home Connect Local. Konfigurerte navn beholdes til du velger et annet apparat.",
  "Home Assistant is disconnected. Reconnect to refresh devices.":
    "Home Assistant er frakoblet. Koble til igjen for å oppdatere apparatlisten.",
  "Loading appliance registries…": "Laster apparatregistre …",
  "Connect to Home Assistant to discover devices.":
    "Koble til Home Assistant for å finne apparater.",
  "No Home Connect Local appliances found. Check the integration and enabled entities.":
    "Fant ingen Home Connect Local-apparater. Kontroller integrasjonen og aktiverte entiteter.",
  "Appliance selection": "Apparatvalg",
  "All devices or area": "Alle apparater eller område",
  "Choose devices": "Velg apparater",
  Devices: "Apparater",
  "An empty selection displays no appliances. Use Ctrl/Command or Shift to select multiple devices.":
    "Et tomt utvalg viser ingen apparater. Bruk Ctrl/Command eller Shift for å velge flere apparater.",
  Area: "Område",
  "All areas": "Alle områder",
  Device: "Apparat",
  "Select a Local appliance": "Velg et Local-apparat",
  "Configured device not found. Choose a Home Connect Local appliance or check its name and integration.":
    "Fant ikke konfigurert apparat. Velg et Home Connect Local-apparat, eller kontroller navnet og integrasjonen.",
  "A device is required before this card can display an appliance.":
    "Du må velge et apparat før kortet kan vise det.",
  Title: "Tittel",
  Appearance: "Utseende",
  Default: "Standard",
  Bubble: "Boble",
  "Expand appliance details": "Utvid apparatdetaljer",
  "Confirm programme selection and start": "Bekreft programvalg og start",
  "Oven modules": "Stekeovnmoduler",
  "Module detection": "Modulregistrering",
  "Detect automatically": "Oppdag automatisk",
  "Choose modules": "Velg moduler",
  "Both modules can be enabled together. No modules selected means a standard oven. Controls appear only when exposed by your appliance.":
    "Begge modulene kan aktiveres samtidig. Ingen valgte moduler betyr en vanlig stekeovn. Kontroller vises bare når apparatet tilbyr dem.",
  "(configured name or missing ID)": "(konfigurert navn eller manglende ID)",
  "Appliance offline": "Apparatet er frakoblet",
  "Appliance status unknown": "Ukjent apparatstatus",
  "Action required": "Handling kreves",
  On: "På",
  Low: "Lav",
  Medium: "Middels",
  High: "Høy",
  Full: "Full",
  Empty: "Tom",
  Normal: "Normal",
  Mild: "Mild",
  Strong: "Sterk",
  Due: "Forfalt",
  Locked: "Låst",
  Required: "Påkrevd",
  Present: "Til stede",
  Nearlyempty: "Nesten tom",
  Notinserted: "Ikke satt inn",
  Unplugged: "Frakoblet",
  Alarm: "Alarm",
  Confirmed: "Bekreftet",
  None: "Ingen",
  Manualremotestart: "Manuell fjernstart",
  Permanentremotestart: "Permanent fjernstart",
  Standby: "Hvilemodus",
  "This appliance is disabled.": "Dette apparatet er deaktivert.",
  "The control is missing or ambiguous on this appliance.":
    "Kontrollen mangler eller er tvetydig på dette apparatet.",
  "The control does not belong to this Home Connect Local appliance.":
    "Kontrollen tilhører ikke dette Home Connect Local-apparatet.",
  "This control is disabled in Home Assistant.":
    "Denne kontrollen er deaktivert i Home Assistant.",
  "This entity is read-only; its domain has no supported appliance action.":
    "Denne entiteten er skrivebeskyttet. Domenet støtter ingen apparathandling.",
  "This control is unavailable or its state is unknown.":
    "Denne kontrollen er utilgjengelig eller har ukjent status.",
  "This transport control has an unsupported entity domain.":
    "Denne programkontrollen har et entitetsdomene som ikke støttes.",
  "This programme entity is not a supported selector.":
    "Denne programentiteten er ikke en støttet velger.",
  "Choose an option currently exposed by this selector.":
    "Velg et alternativ som er tilgjengelig i denne velgeren.",
  "Enter a finite numeric value.": "Angi en endelig tallverdi.",
  "Home Connect Local requires an integer value for this number control.":
    "Home Connect Local krever et heltall for denne tallkontrollen.",
  "This control does not expose valid numeric limits or step.":
    "Denne kontrollen tilbyr ikke gyldige tallgrenser eller trinn.",
  "Switch controls require an explicit on or off value.":
    "Brytere krever en uttrykkelig på- eller av-verdi.",
  "The appliance is offline.": "Apparatet er frakoblet.",
  "Abort is available only for an active or interrupted programme.":
    "Stopp er bare tilgjengelig for et aktivt eller avbrutt program.",
  "Pause requires a running or delayed programme.":
    "Pause krever et kjørende eller utsatt program.",
  "Remote control is disabled or unavailable.":
    "Fjernstyring er deaktivert eller utilgjengelig.",
  "Remote control permission is unverified; confirm this action.":
    "Tillatelse til fjernstyring er ikke bekreftet. Bekreft denne handlingen.",
  "Resume requires a paused programme.":
    "Fortsett krever et program som er satt på pause.",
  "This action requires a ready or finished appliance.":
    "Denne handlingen krever at apparatet er klart eller ferdig.",
  "Remote start is disabled, unknown or unavailable.":
    "Fjernstart er deaktivert, ukjent eller utilgjengelig.",
  "Remote control is disabled, unknown or unavailable.":
    "Fjernstyring er deaktivert, ukjent eller utilgjengelig.",
  "Remote permission is unverified; this action may start the appliance. Confirm before proceeding.":
    "Fjerntillatelsen er ikke bekreftet. Denne handlingen kan starte apparatet. Bekreft før du fortsetter.",
  "This action may start the appliance. Confirm before proceeding.":
    "Denne handlingen kan starte apparatet. Bekreft før du fortsetter.",
  "Home Assistant is disconnected. Reconnect before controlling this appliance.":
    "Home Assistant er frakoblet. Koble til igjen før du styrer apparatet.",
  "This action is not permitted.": "Denne handlingen er ikke tillatt.",
  "Confirm this action before proceeding.":
    "Bekreft denne handlingen før du fortsetter.",
  "Home Assistant service calls are unavailable.":
    "Tjenestekall til Home Assistant er utilgjengelige.",
  "Finished {time} ago": "Ferdig for {time} siden",
  "Starts in {time}": "Starter om {time}",
  "{count} appliances": "{count} apparater",
  "{count} disabled entity": "{count} deaktivert entitet",
  "{count} disabled entities": "{count} deaktiverte entiteter",
  "Enable needed capabilities in Home Assistant.":
    "Aktiver nødvendige funksjoner i Home Assistant.",
  "Across these appliances.": "På disse apparatene.",
  "Last reported: {time}": "Sist rapportert: {time}",
  "Enter a value between {min} and {max}.":
    "Angi en verdi mellom {min} og {max}.",
  "Enter a value aligned with the {step} step from {min}.":
    "Angi en verdi i trinn på {step} fra {min}.",
  "Area name is ambiguous: {name}": "Områdenavnet er tvetydig: {name}",
  "Area not found: {name}": "Fant ikke området: {name}",
  "Device name is ambiguous: {name}": "Apparatnavnet er tvetydig: {name}",
  "Device not found: {name}": "Fant ikke apparatet: {name}",
  Program: "Program",
  "Oven setpoint temperature": "Måltemperatur for stekeovn",
  "Microwave power": "Mikrobølgeeffekt",
  "Oven microwave power": "Mikrobølgeeffekt for stekeovn",
  "Steam level": "Dampnivå",
  "Oven steam level": "Dampnivå for stekeovn",
  "Added steam": "Tilført damp",
  "Oven water tank": "Vanntank for stekeovn",
  "Water tank": "Vanntank",
  Salt: "Salt",
  "Rinse aid": "Skyllemiddel",
  "Drip tray": "Dryppbrett",
  "Bean amount": "Bønnemengde",
  "Fridge temperature": "Kjøleskapstemperatur",
  "Freezer temperature": "Frysertemperatur",
  "Super mode fridge": "Superkjøling",
  "Super mode freezer": "Superfrysing",
  "Refrigerator vacation": "Feriemodus",
  "Fridge door state": "Kjøleskapsdør",
  "Door state": "Dørstatus",
  "Start in": "Start om",
  Duration: "Varighet",
  "Elapsed program time": "Medgått programtid",
  "Remote control level": "Fjernstyringsnivå",
  "Power state": "Strømstatus",
  "Child lock": "Barnesikring",
  "Oven child lock setting": "Barnesikring for stekeovn",
  "Remaining program time": "Gjenstående programtid",
  "Program progress": "Programfremdrift",
  "Active program": "Aktivt program",
  "Start program": "Start program",
  "Pause program": "Sett program på pause",
  "Resume program": "Fortsett program",
  "Abort program": "Stopp program",
  "Remote start allowed": "Fjernstart tillatt",
  "Start allowed": "Start tillatt",
  "Vario speed plus": "Vario Speed Plus",
  "Oven current temperature": "Gjeldende ovnstemperatur",
  Connection: "Tilkobling",
  "Countdown cleaning": "Tid til rengjøring",
  "Countdown descaling": "Tid til avkalking",
  "Countdown water filter": "Tid til filterbytte",
  "Countdown calc n clean": "Tid til Calc’nClean",
  "Machinecare remaining runs": "Kjøringer til maskinpleie",
  "Coffee temperature": "Kaffetemperatur",
  "Beverage size": "Drikkestørrelse",
  "Coffee milk ratio": "Forhold mellom kaffe og melk",
  "Hot water temperature": "Varmtvannstemperatur",
  "Flow rate": "Gjennomstrømning",
  Coarsness: "Malegrad",
  "Coffee strength": "Kaffestyrke",
  "Aroma select": "Aromavalg",
  "Bean container": "Bønnebeholder",
  "Shot count": "Antall shots",
  Cups: "Kopper",
  "Fill quantity": "Fyllmengde",
  "Multiple beverages": "Flere drikker",
  "Cup warmer": "Koppvarmer",
  "Extra dry option": "Ekstra tørking",
  "Hygiene plus": "Hygiene Plus",
  "Intensiv zone": "Intensivsone",
  "Silence on demand": "Stillemodus",
  "Brilliance dry": "Glanstørking",
  "Zeolite dry": "Zeolittørking",
  "Half load": "Halv maskin",
  "Extra rinse": "Ekstra skylling",
  Pretreatment: "Forbehandling",
  "Oven level": "Ovnsnivå",
  "Oven used heating mode": "Oppvarmingsmodus",
  "Pyrolysis level": "Pyrolysenivå",
  "Oven fast pre heat": "Hurtigoppvarming",
} as const;
export type TranslationKey = keyof typeof nb;
type LanguageSource = Pick<HomeAssistant, "language" | "locale"> | undefined;
export function language(hass: LanguageSource): "en" | "nb" {
  const code = (hass?.language ?? hass?.locale?.language ?? "en")
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];
  return ["nb", "no", "nn"].includes(code) ? "nb" : "en";
}
/** Formatting keeps regional preferences independently of the text dictionary. */
export function formattingLocale(hass: LanguageSource): string {
  const requested = (hass?.language ?? hass?.locale?.language ?? "en")
    .toLowerCase()
    .replace(/_/g, "-");
  const [base, ...subtags] = requested.split("-");
  if (!["en", "nb", "no", "nn"].includes(base)) return "en";
  const candidate = [
    base === "no" || base === "nn" ? "nb" : base,
    ...subtags,
  ].join("-");
  try {
    const canonical = Intl.getCanonicalLocales(candidate)[0];
    if (Intl.DateTimeFormat.supportedLocalesOf(canonical).length)
      return canonical;
  } catch {
    // Malformed HA language values must not prevent the card from rendering.
  }
  return language(hass);
}
export function localize(
  hass: LanguageSource,
  key: TranslationKey,
  values: Record<string, string | number> = {},
): string {
  const text = language(hass) === "nb" ? nb[key] : key;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    String(values[name] ?? match),
  );
}
/** Only for messages authored by the card/model/policy; never arbitrary names. */
export function message(hass: LanguageSource, text: string): string {
  if (Object.prototype.hasOwnProperty.call(nb, text))
    return localize(hass, text as TranslationKey);
  const patterns: [RegExp, TranslationKey, string[]][] = [
    [
      /^(device|area|title) must be a string\.$/,
      "{field} must be a string.",
      ["field"],
    ],
    [
      /^(expand|confirm_start) must be true or false\.$/,
      "{field} must be true or false.",
      ["field"],
    ],
    [
      /^Enter a value between (.+) and (.+)\.$/,
      "Enter a value between {min} and {max}.",
      ["min", "max"],
    ],
    [
      /^Enter a value aligned with the (.+) step from (.+)\.$/,
      "Enter a value aligned with the {step} step from {min}.",
      ["step", "min"],
    ],
    [
      /^Area name is ambiguous: (.*)$/,
      "Area name is ambiguous: {name}",
      ["name"],
    ],
    [/^Area not found: (.*)$/, "Area not found: {name}", ["name"]],
    [
      /^Device name is ambiguous: (.*)$/,
      "Device name is ambiguous: {name}",
      ["name"],
    ],
    [/^Device not found: (.*)$/, "Device not found: {name}", ["name"]],
  ];
  for (const [pattern, key, names] of patterns) {
    const match = text.match(pattern);
    if (match)
      return localize(
        hass,
        key,
        Object.fromEntries(names.map((name, i) => [name, match[i + 1]])),
      );
  }
  return text;
}
/** HA owns integration translations. Preserve unknown firmware/program values. */
export function stateLabel(
  hass: HomeAssistant | undefined,
  state: HassEntity,
  value = state.state,
  program = false,
): string {
  const formatted = hass?.formatEntityState?.(state, value);
  if (formatted && formatted !== value) return formatted;
  if (program) return value;
  const labels: Record<string, TranslationKey> = {
    ready: "Ready",
    run: "Running",
    running: "Running",
    pause: "Paused",
    paused: "Paused",
    finished: "Finished",
    delayed: "Delayed start",
    aborting: "Stopping",
    actionrequired: "Action required",
    connected: "Connected",
    disconnected: "Offline",
    preheating: "Preheating",
    heating: "Heating",
    washing: "Washing",
    rinsing: "Rinsing",
    drying: "Drying",
    cleaning: "Cleaning",
    descaling: "Descaling",
    brewing: "Brewing",
    ajar: "Ajar",
    on: "On",
    off: "Off",
    low: "Low",
    medium: "Medium",
    high: "High",
    full: "Full",
    empty: "Empty",
    normal: "Normal",
    mild: "Mild",
    strong: "Strong",
    due: "Due",
    unknown: "Unknown",
    unavailable: "Unavailable",
    open: "Open",
    closed: "Closed",
    locked: "Locked",
    required: "Required",
    present: "Present",
    nearlyempty: "Nearlyempty",
    notinserted: "Notinserted",
    unplugged: "Unplugged",
    alarm: "Alarm",
    error: "Error",
    confirmed: "Confirmed",
    none: "None",
    manualremotestart: "Manualremotestart",
    permanentremotestart: "Permanentremotestart",
    standby: "Standby",
  };
  const key = value.split(".").pop()!.toLowerCase().replace(/[ _-]/g, "");
  if (state.attributes.device_class === "door" && ["on", "off"].includes(key))
    return localize(hass, key === "on" ? "Open" : "Closed");
  return labels[key] ? localize(hass, labels[key]) : value;
}
