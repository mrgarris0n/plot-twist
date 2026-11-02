# Plot Twist

Plot Twist helps you plan a garden: draw your plot, see where the sun reaches through the year, and pick plants that suit your winters, soil and rainfall. Your gardens stay in your browser; export them to keep a copy.

Live at https://plot-twist-garden.vercel.app

## Open alpha

Plot Twist is in open alpha, so things may break. Please report problems and ideas at https://github.com/mrgarris0n/plot-twist/issues.

## Run it locally

```
npm install
npm run dev
npm test
npm run validate:plants
```

## Licenses

- Code: AGPL-3.0-or-later (see `LICENSE`), including `scripts/` and the AI-generated images in `public/landing/`.
- Plant data (`data/plants/*.json` and `data/companions.json`): CC BY-SA 4.0 (see `data/LICENSE`); reuse requires attribution and ShareAlike.
- `public/climate/`: redistributed under the Copernicus licence (CC BY 4.0) and not relicensed. Climate: modified from Copernicus Climate Change Service “Agroclimatic indicators” (WFDEI, 1981–2010; doi:10.24381/cds.dad6e055), CC BY 4.0. Winter low is the average yearly minimum; frost dates are estimated from 10-day minimum temperatures; rain is the precipitation sum added up over the year and over the growing season. Sunshine: modified from Copernicus Climate Change Service ERA5 monthly surface solar radiation (1981–2010), CC BY 4.0. We compare the solar radiation that reaches the ground with the clear-sky amount to estimate how much sunshine clouds block in the growing season. Neither the European Commission nor ECMWF is responsible for any use that may be made of the information it contains.
- `scripts/water/wording.json`: USDA, public domain.

## Credits

- Soil data: ISRIC SoilGrids (CC BY 4.0)
- Map tiles: OpenFreeMap, with © OpenMapTiles
- Map data: © OpenStreetMap contributors
- Place search: Photon (photon.komoot.io), run by komoot, using OpenStreetMap data (ODbL)
- Plant sources: see [`data/plants/SOURCES.md`](data/plants/SOURCES.md)

## Privacy

See [the privacy notice](https://plot-twist-garden.vercel.app/privacy.html).

## Contributing

Issues are welcome. If you want to send a pull request, please discuss it in an issue first.
