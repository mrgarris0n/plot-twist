// All UI copy lives here. Main screens use gardener's words only; Latin names,
// pH numbers and similar belong under `details` / `credits`.
import type { RotationGroup, SunNeed } from '../model/plants.js'
import type { Drainage, SoilTexture } from '../model/project.js'
import { formatNumber } from './lang.js'

type AcidityClass = 'acidic' | 'neutral' | 'alkaline'

const NEED: Record<SunNeed, string> = { full: 'full sun (6+ hours a day)', part: 'part sun (3+ hours a day)', shade: 'some shade' }
const TEXTURE: Record<SoilTexture, string> = { sandy: 'sandy', loamy: 'loamy', clay: 'clay', silty: 'silty' }
const ROTATION_GROUP: Record<RotationGroup, string> = { potatoes: 'Potatoes & tomatoes', legumes: 'Peas & beans', brassicas: 'Cabbage family', roots: 'Onions & roots', any: 'Fits anywhere' }
const DRAINAGE: Record<Drainage, string> = { fast: 'drains fast', normal: 'drains normally', wet: 'stays wet' }

/** "Blueberry" → "Blueberries", "Fig" → "Figs", "Chives" stays. */
function plural(name: string): string {
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`
  if (/(s|x|ch|sh)$/i.test(name)) return name
  return `${name}s`
}

/** What shades a plant: a placed plant (by common name) or a shade object (by plain kind name). */
export type LightObstacle = { name: string; isPlant: boolean }
const theObstacle = (o: LightObstacle) => `the ${o.name.toLowerCase()}`

/** Same plant twice → "These two apples"; else "Apple and black currant". */
function pair(a: string, b: string): string {
  return a === b ? `These two ${plural(a).toLowerCase()}` : `${a} and ${b.toLowerCase()}`
}
export const english = {
  gardens: {
    title: 'My gardens',
    newGarden: 'New garden',
    openGarden: 'Open a garden',
    close: 'Close',
    current: 'Open now',
    newGardenName: 'My garden',
    nameLabel: 'Garden name',
    create: 'Create',
    cancel: 'Cancel',
    rename: 'Rename',
    save: 'Save',
    delete: 'Delete',
    confirmDelete: (name: string) => `Delete ‘${name}’? This can't be undone.`,
    empty: 'No gardens yet. Start one to begin planning.',
    storageUnavailable: "Your browser won't let us save here — use Export to keep a copy.",
    updated: (when: string) => `Last changed ${when}`,
    loadFailed: "We couldn't open that garden.",
    renameFailed: "We couldn't rename that garden.",
    nameTaken: (name: string) => `You already have a garden called ‘${name.trim()}’. Pick another name.`,
  },
  landing: {
    heroAlt: 'Plot Twist. Your garden’s next chapter. Planning, planting, and growing made simple with the Plot Twist garden planner.',
  },
  import: {
    button: 'Import a garden',
    notJson: "This file isn't a Plot Twist garden.",
    newer: 'This garden was made with a newer version of Plot Twist.',
  },
  exportUi: { button: 'Export' },
  phone: {
    readOnly: 'Viewing only — open on a tablet or computer to edit.',
  },
  settings: {
    button: 'Settings',
    units: 'Units',
    metric: 'Metric',
    imperial: 'Imperial',
    language: 'Language / Nyelv', // fixed and bilingual, so a user in the wrong language can find it
    // Same in both languages: each language is named in itself.
    langNames: { en: 'English', hu: 'Magyar' },
  },
  editor: {
    addLabel: 'Add',
    addMenu: 'Add to the garden',
    objects: 'Objects',
    add: {
      house: 'House',
      shed: 'Shed',
      wall: 'Wall',
      fence: 'Fence',
      hedge: 'Hedge',
      tree: 'Existing tree',
      bed: 'Raised bed',
    },
    kind: {
      house: 'House',
      shed: 'Shed',
      wall: 'Wall',
      fence: 'Fence',
      hedge: 'Hedge',
      tree: 'Existing tree',
      bed: 'Raised bed',
    },
    northLabel: 'N',
    northTitle: 'North',
    canvasLabel: 'Garden plan',
    backToGardens: 'My gardens',
  },
  selection: {
    title: (kind: string) => `Selected: ${kind}`,
    nothing: 'Click something in the garden to see its details.',
    width: 'Width',
    length: 'Length',
    crownWidth: 'Crown width',
    height: 'Height',
    canopy: 'Leaves',
    canopyDense: 'Dense leaves',
    canopyLight: 'Light, airy leaves',
    leafOff: 'Loses its leaves in winter',
    remove: 'Delete',
    invalidLength: 'Please enter a length like 3 m or 10 ft.',
  },
  setup: {
    title: 'Set up your garden',
    location: 'Location',
    plot: 'Plot',
    soil: 'Soil',
    gardenType: 'Garden type',
    shadeObjects: 'Shade objects',
    button: 'Setup',
    progress: (done: number, total: number) => `Setup ${done}/${total}`,
    done: 'done',
    todo: 'to do',
    doneMark: '✓',
    todoMark: '○',
    close: 'Close',
    next: 'Next',
    finish: 'Finish',
  },
  location: {
    title: 'Where is your garden?',
    searchLabel: 'Search for a town or address',
    searchPlaceholder: 'Start typing a place name',
    searching: 'Searching...',
    noResults: 'No places found. You can click the map to drop a pin instead.',
    searchDown: "Search isn't available right now — click the map to drop a pin instead.",
    mapHint: 'Click the map to place a pin on your garden.',
    attributionToggle: 'Toggle attribution',
    mapTitle: 'Map',
    mapLabel: 'Map for choosing your garden location',
    mapUnavailable: "The map couldn't load. Search for a place instead.",
    chosen: (lat: string, lon: string) => `Pin at ${lat}, ${lon}`,
    why: 'Your location tells us how much sun your garden gets and which plants can survive your winters.',
  },
  plot: {
    title: 'Your plot',
    width: 'Width',
    length: 'Length',
    northTitle: 'Which way is north?',
    northHelp: 'Turn the dial until the arrow on the plan points the way north lies from your plot.',
    northLabel: 'North direction',
    northDeg: (d: number) => `${d} degrees clockwise from the top of the plan`,
    slopeHeading: 'Slope',
    steepLabel: 'How steep is the ground?',
    steepness: {
      flat: 'Flat (under 3°)',
      gentle: 'Gentle (3–5°)',
      moderate: 'Moderate (5–8.5°)',
      strong: 'Strong (8.5–16.5°)',
      veryStrong: 'Very strong (16.5–24°)',
    },
    facingLabel: 'Which way does it face, going downhill?',
    facing: {
      N: 'North', NE: 'North-east', E: 'East', SE: 'South-east',
      S: 'South', SW: 'South-west', W: 'West', NW: 'North-west',
    },
    confirm: 'Looks right',
    confirmed: 'Plot confirmed',
    shapeTitle: 'Shape',
    rectangle: 'Rectangle',
    drawShape: 'Draw my own shape',
    editShape: 'Change my shape',
    drawHelp: 'Click on the plan to place each corner. Click the first corner again to finish, or drag a corner to move it.',
    editHelp: 'Drag a corner to move it.',
    drawCorners: (n: number) => (n === 1 ? '1 corner placed' : `${n} corners placed`),
    invalidShape: 'The edges cross — move a corner.',
    tooSmall: (minArea: string) => `The shape needs at least three corners and more than ${minArea}.`,
    done: 'Done',
    cancel: 'Cancel',
    undoCorner: 'Remove last corner',
    drawLabel: 'Plot outline being drawn',
    polygonNote: 'This plot has a custom outline, so its size is set on the plan.',
  },
  gardenType: {
    title: 'What kind of garden?',
    foodForest: 'Food forest',
    foodForestHint: 'Layers of fruit trees, shrubs and ground plants that look after each other.',
    vegBeds: 'Veggie beds',
    vegBedsHint: 'Raised beds of vegetables and herbs, rotated year by year.',
    orchard: 'Orchard',
    mixed: 'Mixed',
    comingSoon: 'Coming soon',
  },
  shadeObjects: {
    title: 'What casts shade?',
    intro: 'Add the houses, walls, fences and trees around your plot so we can work out where the sun reaches.',
    none: "There's nothing that casts shade",
    noneDone: 'Confirmed: nothing casts shade',
    beds: 'Beds',
  },
  beds: {
    name: 'Name',
    /** Default name of a new bed: a letter A–Z, then a number. */
    defaultName: (id: string) => `Bed ${id}`,
    perennial: 'Perennial bed (herbs stay, not rotated)',
    notInBed: "This plant isn't in a bed.",
    confirmDelete: (name: string, count: number) =>
      `${name} has ${count === 1 ? '1 plant' : `${count} plants`} in it. Deleting the bed deletes ${count === 1 ? 'it' : 'them'} too. Delete anyway?`,
  },
  soil: {
    looking: 'Looking up your soil...',
    lookupFailed: "We couldn't look up your soil. Tell us about it instead.",
    needLocation: 'Pick your location first and we can look up your soil. Or tell us about it below.',
    found: (desc: string) => `Your soil looks ${desc}.`,
    use: 'Use this',
    describe: "I'll describe it myself",
    haveTest: 'I have a soil test',
    unknown: 'unknown',
    current: (desc: string) => `Your soil: ${desc}`,
    textureLabel: 'Soil type',
    acidityLabel: 'How acidic is it?',
    drainageLabel: 'How does water drain?',
    texture: { sandy: 'Sandy', loamy: 'Loamy', clay: 'Clay', silty: 'Silty' },
    acidity: { acidic: 'Acidic', neutral: 'Neutral', alkaline: 'Alkaline' },
    drainage: { fast: 'Drains fast', normal: 'Normal', wet: 'Stays wet' },
    // Lower-case words inside sentences and detail lines ("loamy, slightly acidic").
    textureWord: { sandy: 'sandy', loamy: 'loamy', clay: 'clay', silty: 'silty' },
    acidityWord: { acidic: 'acidic', 'slightly acidic': 'slightly acidic', neutral: 'neutral', 'slightly alkaline': 'slightly alkaline', alkaline: 'alkaline' },
    drainageWord: { fast: 'fast', normal: 'normal', wet: 'wet' },
  },
  climate: {
    looking: 'Looking up your climate...',
    lookupFailed: "We couldn't look up your climate — add it yourself",
    winterLow: (temp: string) => `Coldest winter nights: about ${temp}`,
    rain: (yearly: string, warm: string) => `Rain: about ${yearly} a year, ${warm} of it in the growing season`,
    rainUnknown: 'Rain: not known',
    cloud: (pct: number) => `Clouds block about ${pct}% of the sunshine in the growing season`,
    lastFrost: (when: string) => `Last spring frost: usually ${when}`,
    firstFrost: (when: string) => `First autumn frost: usually ${when}`,
    frostFree: 'Frost-free: your garden rarely or never gets frost.',
    typical: 'Typical, about ±2 weeks',
    unknown: 'not known',
    edit: 'Edit',
    done: 'Done',
    winterLowLabel: 'Coldest winter nights',
    lastFrostLabel: 'Last spring frost',
    firstFrostLabel: 'First autumn frost',
    frostFreeLabel: 'My garden has no frost',
    monthLabel: 'Month',
    partLabel: 'Part of the month',
    notSet: 'Not set',
    parts: { early: 'early', mid: 'mid', late: 'late' },
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    when: (part: string, month: string) => `${part} ${month}`,
  },
  calendar: {
    button: 'Calendar',
    title: 'Seasonal calendar',
    needLocation: 'Set your location to get dates for your area',
    nothing: 'Nothing to do this month.',
    empty: 'Add some plants to see what to do and when.',
    thisMonth: 'This month',
    job: (task: 'plant' | 'prune' | 'harvest', name: string, count: number, isTree: boolean): string => {
      const verb = task === 'plant' ? 'Plant' : task === 'prune' ? 'Prune' : 'Harvest'
      const noun = `${name.toLowerCase()} ${isTree ? 'tree' : 'plant'}${count === 1 ? '' : 's'}`
      return count === 1 ? `${verb} the ${noun}` : `${verb} the ${count} ${noun}`
    },
    undated: (name: string): string => `Set your frost dates to see when to plant the ${name.toLowerCase()}`,
  },
  arrange: {
    button: '✨ Auto-arrange',
    busy: 'Finding plants that fit…',
    empty: 'Place a tree first — Auto-arrange fills in around your trees.',
    failed: 'Something went wrong while finding plants. Please try again.',
    barLabel: 'Suggested plants',
    acceptAll: 'Accept all',
    discard: 'Discard',
    addOne: 'Add this one',
  },
  year: {
    label: 'Years from now',
    now: 'Now',
    value: (n: number) => (n === 0 ? 'Now' : `Year ${n}`),
  },
  overlay: {
    toolbarLabel: 'Sun view',
    viewSwitchLabel: 'Sun map shows',
    showSun: 'Show sun',
    seasonLabel: 'Season',
    seasonButton: (current: string, next: string) => `Season: ${current} — click for ${next}`,
    sunOn: 'Sun view on — click to hide',
    sunOff: 'Sun view off — click to show',
    season: { spring: 'Spring', midsummer: 'Mid-summer', autumn: 'Autumn', midwinter: 'Mid-winter' },
    legendLabel: 'Sun key',
    full: 'Full sun, 6+ hours',
    part: 'Part sun, 3–6 hours',
    shade: 'Shade, under 3 hours',
    cloudNote: (pct: number) => `Clouds block about ${pct}% of the sunshine here in the growing season, so real sunshine is roughly ${100 - pct}% of the hours shown.`,
    needLocation: 'Pick your location first and we can show where the sun reaches.',
    viewHours: 'Hours',
    viewStrength: 'Strength',
    strength: {
      more: 'More than 110% of an open flat spot',
      same: '90–110%',
      less: '50–90%',
      low: 'Less than 50%',
    },
    strengthNote: 'Sun strength compares each spot with an open, flat spot here, counting strong midday sun more than low sun. Plant warnings still use hours.',
    steepWord: { flat: 'flat', gentle: 'gentle', moderate: 'moderate', strong: 'strong', veryStrong: 'very strong' },
    facingWord: {
      N: 'north', NE: 'north-east', E: 'east', SE: 'south-east',
      S: 'south', SW: 'south-west', W: 'west', NW: 'north-west',
    },
    slopeGain: (steep: string, facing: string, pct: number, more: boolean) =>
      `Your ${steep} ${facing}-facing slope catches about ${pct}% ${more ? 'more' : 'less'} sun than flat ground here.`,
    slopeSame: (steep: string, facing: string) => `Your ${steep} ${facing}-facing slope gets about the same sun as flat ground here.`,
  },
  contents: {
    button: (n: number) => (n === 1 ? '1 thing in the garden' : `${n} things in the garden`),
    title: 'In your garden',
    empty: 'Nothing here yet. Use Add to put in plants, or a house, wall or tree.',
    plants: 'Plants',
    objects: 'Buildings and shade',
    close: 'Close',
  },
  warningsUi: {
    listButton: (n: number) => (n === 0 ? 'No warnings' : n === 1 ? '1 warning' : `${n} warnings`),
    listTitle: 'Things to check',
    listEmpty: 'Nothing to flag right now.',
    close: 'Close',
    calloutLabel: 'About this plant',
    hintBadge: 'Good to know',
    warningBadge: 'Needs attention',
    moveToSunnier: 'Move to a sunnier spot',
    keepHere: 'Keep here',
    plantFallback: 'Plant',
  },
  warnings: {
    lightNow: (plant: string, need: SunNeed, hours: number, obstacle: LightObstacle | null = null) =>
      `${plant} needs ${NEED[need]}. It gets about ${Math.round(hours)} h here` +
      (obstacle ? ` because ${theObstacle(obstacle)} shades it.` : '.'),
    lightLater: (plant: string, need: SunNeed, hoursNow: number, year: number, hoursThen: number, obstacle: LightObstacle | null) =>
      `${plant} needs ${NEED[need]}. It gets about ${Math.round(hoursNow)} h now but only about ${Math.round(hoursThen)} h from year ${year}` +
      (!obstacle ? '.' : obstacle.isPlant ? `, when ${theObstacle(obstacle)} fills in.` : `, because of ${theObstacle(obstacle)}.`),
    crowding: (a: string, b: string, year: number, distance: string) =>
      `${pair(a, b)} will crowd each other ${year > 0 ? `by year ${year}` : 'from the start'}. Leave at least ${distance} between them.`,
    crowdingTrees: (a: string, b: string, distance: string) =>
      `${pair(a, b)} are planted too close together. Leave at least ${distance} between them.`,
    soilAcidity: (plant: string, needs: AcidityClass, yours: AcidityClass) => `${plural(plant)} need ${needs} soil. Yours is ${yours}.`,
    /** Both ranges fall in the same plain class, so only the direction can be named. */
    soilAcidityCloser: (plant: string, direction: 'more' | 'less') => `${plural(plant)} need ${direction} acidic soil than yours.`,
    soilTexture: (plant: string, texture: SoilTexture) =>
      `${plural(plant)} don't do well in ${TEXTURE[texture]} soil like yours.`,
    soilDrainage: (plant: string, drainage: Drainage) =>
      `${plural(plant)} don't do well in soil that ${DRAINAGE[drainage]}, like yours.`,
    climateCold: (plant: string, temp: string) => `Too cold here for ${plant}. Winters reach about ${temp}.`,
    waterShort: (plant: string) => `${plant} needs more rain than falls here — expect to water it in summer.`,
    rotation: (group: RotationGroup, bed: string, yearsAgo: number, gapYears = 3) => {
      const wait = gapYears + 1 - yearsAgo // years until the gap is clear
      const waitText = yearsAgo === 1 ? `${wait} years` : `${wait} more ${wait === 1 ? 'year' : 'years'}`
      return `${ROTATION_GROUP[group]} grew in ${bed} ${yearsAgo === 1 ? 'last year' : `${yearsAgo} years ago`}. Wait ${waitText} before growing it here again.`
    },
    companionBad: (a: string, b: string) => `${a} and ${b} don't grow well side by side — keep them apart.`,
    companionGood: (a: string, b: string) => `${a} and ${b} are good neighbours.`,
    setupIncomplete: 'Finish the garden setup to start adding plants.',
    balanceNitrogen: 'Nothing in your plan feeds the soil. Add a plant that does, like clover, to help the others grow.',
    balanceGroundcover: 'Nothing covers the bare ground. Low spreading plants keep the soil moist and the weeds down.',
  },
  details: {
    title: 'Details',
    goodNeighbours: 'Good neighbours',
    sourceSeparator: ', ',
    keepApart: 'Keep apart from',
    soilTestLabel: 'pH from your soil test',
    unknown: 'Unknown',
    waterUnknown: 'Water need not known',
    waterNeed: 'Water need',
    realSunLabel: 'Sunshine',
    waterUsda: (rain: string) => `${rain} a year (USDA)`,
    waterLevel: { low: 'Low', medium: 'Medium', high: 'High' },
    sunStrength: (pct: number) => `Sun strength: about ${pct}% of an open flat spot`,
    realSun: (hours: number) => `About ${Math.round(hours)} h of real sunshine`,
    latin: 'Latin name',
    family: 'Family',
    ph: 'Soil pH',
    phRange: (lo: string, hi: string) => `${lo} to ${hi}`,
    hardiness: 'Survives winters down to',
    hardinessTo: (temp: string) => temp,
    lifeCycle: 'Life cycle',
    annual: 'Annual: planted again each year',
    sources: 'Sources',
    pfaf: 'Learn more on PFAF',
    warning: {
      light: (hours: number, needHours: number, year: number, heightM: string) =>
        `Growing-season direct sun (mean of spring, mid-summer and autumn) at ${heightM} above ground in year ${year}: ${formatNumber(hours, 1)} h; needs at least ${needHours} h.`,
      crowding: (overlapPct: number, year: number, sameLayer: boolean, limitPct: number) =>
        `Crown overlap ${overlapPct}% of the smaller crown in year ${year} (${sameLayer ? 'same layer' : 'mature heights within 30%'}; limit ${limitPct}%).`,
      spacing: (distance: string, minSpacing: string) => `Trunks ${distance} apart; minimum spacing ${minSpacing}.`,
      acidity: (plantLo: number, plantHi: number, siteLo: number, siteHi: number) =>
        `Plant pH ${plantLo}–${plantHi}; site pH ${siteLo}–${siteHi}.`,
      texture: (plant: string, site: string) => `Plant soil textures: ${plant}; site texture: ${site}.`,
      drainage: (plant: string, site: string) => `Plant drainage: ${plant}; site drainage: ${site}.`,
      climate: (plantMin: string, siteMin: string) => `Hardy to ${plantMin}; site winter minimum ${siteMin}.`,
      waterNumber: (needRain: string, siteRain: string) => `Plant needs at least ${needRain} of rain a year; this site gets about ${siteRain}.`,
      waterLevel: (word: string, needRain: string, siteRain: string) =>
        `This plant's water need is listed as "${word}". The app's rule for that wording is at least ${needRain} of rain over the growing season (April–September, or October–March in the southern hemisphere); this site gets about ${siteRain}.`,
      rotation: (reason: string) => reason,
      companion: (reason: string) => reason,
      setupMissing: (steps: string) => `Steps left: ${steps}.`,
      nitrogen: 'No placed plant has the nitrogen-fixer role.',
      groundcover: 'No placed plant is in the ground-cover layer.',
    },
  },
  rotation: {
    group: ROTATION_GROUP,
    thisBed: 'this bed',
    suggest: 'Suggest next year',
    confirmReplace: 'Next year already has crops planted. Replace them with the new suggestion?',
    notPlaced: (list: string) => `Not placed: ${list}`,
    notPlacedItem: (count: number, name: string, bed: string | null) =>
      `${name}${count === 1 ? '' : ` × ${count}`} ${bed === null ? 'from outside the beds' : `from ${bed}`}`,
    reason: (group: RotationGroup, lastYear: number, gapYears: number) =>
      `${ROTATION_GROUP[group]} were last grown in this bed in year ${lastYear}. Keep a gap of ${gapYears} years between crops of the same family.`,
  },
  layers: {
    canopy: 'Tall trees',
    'sub-canopy': 'Small trees',
    shrub: 'Shrubs',
    herbaceous: 'Herbs & perennials',
    'ground-cover': 'Ground cover',
    root: 'Root crops',
    climber: 'Climbers',
  },
  palette: {
    title: 'Plants',
    searchLabel: 'Search plants',
    searchPlaceholder: 'Search by name',
    layerLabel: 'Plant layer',
    all: 'All',
    none: 'No plants match.',
    dragHint: 'Drag a plant onto the plan.',
    onlyFitting: 'Only plants that suit my garden',
    showWoody: 'Show trees and shrubs',
    markWater: 'Needs more rain than falls here',
    hidden: (n: number) => (n === 1 ? '1 plant hidden: your winters, soil or region don’t suit it.' : `${n} plants hidden: your winters, soil or region don’t suit them.`),
  },
  plant: {
    growthTypical: (layerLabel: string) => `Growth speed not known — using a typical speed for ${layerLabel.toLowerCase()}.`,
    variant: 'Size',
    height: 'Mature height',
    width: 'Mature width',
    reset: 'Reset',
    plantedYear: 'Planted in year',
    grownAsAnnual: 'Grown as an annual here.',
    notPlanted: (year: number) => `Not planted until year ${year}`,
  },
  credits: {
    title: 'About Plot Twist',
    about: 'Plot Twist helps you plan a garden: draw your plot, see where the sun reaches through the year, and pick plants that suit your winters, soil and rainfall. Your gardens stay in this browser; export them to keep a copy.',
    creditsHeading: 'Credits',
    soil: 'Soil data: ISRIC SoilGrids (CC BY 4.0)',
    open: 'About & credits',
    aboutLink: 'About',
    close: 'Close',
    intro: 'This planner is built on free, openly licensed data and services. Thank you to everyone behind them.',
    mapHeading: 'Map and place search',
    openFreeMap: 'OpenFreeMap',
    openMapTiles: '© OpenMapTiles',
    osm: '© OpenStreetMap contributors',
    mapTiles: 'Map tiles',
    mapData: 'Map data',
    separator: ': ',
    geocoder: 'Place search: Photon (photon.komoot.io), run by komoot, using OpenStreetMap data (ODbL).',
    soilHeading: 'Soil',
    soilLink: 'ISRIC SoilGrids',
    soilProcessed: 'We averaged two soil depth layers and rescaled the sand, silt and clay shares to add up to 100%, so the values shown are processed, not the original numbers.',
    climateHeading: 'Climate',
    climateSource: 'Copernicus Climate Change Service — Agroclimatic indicators (CC BY 4.0)',
    sunshineSource: 'Copernicus Climate Change Service — ERA5 monthly averaged data on single levels (CC BY 4.0)',
    shortcutsHeading: 'Keyboard shortcuts',
    // [keys, what they do] for the selected plant or object on the plan
    shortcuts: [
      ['Delete / Backspace', 'Delete it'],
      ['Ctrl+D (⌘D on a Mac)', 'Duplicate it'],
      ['Alt + drag', 'Drag a copy, leaving the original in place'],
      ['Arrow keys', 'Move it 10 cm (with Shift: 1 m)'],
      ['Esc', 'Deselect, or close the open menu or list'],
    ],
    plantsHeading: 'Plant information',
    plantsIntro: 'Plant facts come from these sources:',
    plantsToggle: (n: number) => `Show all ${n} plant sources`,
    pfaf: 'Links to PFAF (Plants For A Future) are for reading only. We do not copy their data.',
    privacy: 'Privacy notice',
    climate: 'Climate: modified from Copernicus Climate Change Service “Agroclimatic indicators” (WFDEI, 1981–2010; doi:10.24381/cds.dad6e055), CC BY 4.0. Winter low is the average yearly minimum; frost dates are estimated from 10-day minimum temperatures; rain is the precipitation sum added up over the year and over the growing season. Sunshine: modified from Copernicus Climate Change Service ERA5 monthly surface solar radiation (1981–2010), CC BY 4.0. We compare the solar radiation that reaches the ground with the clear-sky amount to estimate how much sunshine clouds block in the growing season. Neither the European Commission nor ECMWF is responsible for any use that may be made of the information it contains.',
  },
  alpha: {
    app: {
      notice: 'Plot Twist is in open alpha: things may change or break.',
      noticeLink: 'Report problems or ideas on GitHub',
      dismiss: 'Dismiss',
      feedback: 'Send feedback',
      version: (build: string) => `Version ${build}`,
    },
  },
} as const

/** Literal strings become `string`; objects keep their keys; builders keep their parameters and return `string`. */
export type Widen<T> = T extends string
  ? string
  : T extends (...a: infer A) => unknown
    ? (...a: A) => string
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T

export type Strings = Widen<typeof english>
