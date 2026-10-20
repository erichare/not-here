# Lorn Bay map geography

The map combines a fictional village plan with a regional inset based on the real outline of Okanagan Lake. North is up. Lorn Bay occupies the lake's western shore, with water to the east and orchard terraces rising inland to the west. The village plan is an illustration of story relationships, not a surveyed settlement.

The shipped vector artwork is [lorn-bay-map.svg](../apps/web/public/art/lorn-bay-map.svg). The retained [regional source and projection data](../assets/maps/okanagan-inset.json) contains the selected lake polygon, projected path, and city anchors for future map revisions.

## Regional reference

The [Okanagan Basin Water Board](https://obwb.ca/wsd-index/about/state-of-the-basin/) describes a narrow basin containing Okanagan Lake and surrounding mountains. The [BC Ministry of Transportation's Summerland–Peachland map](https://www2.gov.bc.ca/assets/gov/transportation-infrastructure-projects/south-okanagan-summerland/p23_geo1039_summerland_h97_detour1_2.pdf) provides the regional road and shoreline context. The [Peachland transportation study](https://www2.gov.bc.ca/gov/content/transportation/transportation-reports-and-reference/reports-studies/okanagan/peachland-study) is a further reference for Highway 97 through the western lakeshore corridor. These sources informed the orientation and terrain; they do not establish a real location for Lorn Bay.

The inset's lake outline comes from [Natural Earth's 1:10 million lakes dataset, North America supplement](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-lakes/). Okanagan Lake is absent from the basic lakes file and present in the supplement:

- [Source GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes_north_america.geojson), retrieved October 20, 2026.
- Feature name: `Okanagan Lake`; Natural Earth ID: `1159120757`.
- Download SHA-256: `76f49d4b698f3529e690136a989713bcd3c028ade150346f4b358de9815cfc43`.
- Original exterior ring: 111 vertices, including the repeated closing point.
- Projection: north-up equirectangular, longitude multiplied by `cos(50°)`, with uniform scaling into a 150 × 300 viewport. The fitting bounds include the lake and the city anchors below. This preserves approximate regional proportions.
- Path simplification: Douglas–Peucker tolerance of 0.45 viewport units, applied to two arcs of the closed ring; 82 resulting vertices, including closure. SVG coordinates are rounded to one decimal place.

Natural Earth is [public-domain map data](https://www.naturalearthdata.com/about/terms-of-use/), including commercial use and modification. Attribution is optional; the map credits “Made with Natural Earth.”

City anchors use official place-name coordinates, not hand-positioned guesses. Their labels may be offset for legibility.

| Place | Latitude | Longitude | Inset x, y | Source |
| --- | ---: | ---: | --- | --- |
| Vernon | 50.2655556 | -119.2713889 | 130.68, 25.76 | [Canadian Geographical Names Database](https://geonames.nrcan.gc.ca/search-place-names/unique?id=JBOAP) |
| Kelowna | 49.888056 | -119.495556 | 79.00, 161.13 | [Canadian Geographical Names Database](https://geonames.nrcan.gc.ca/search-place-names/unique?id=JAFUV) |
| Peachland | 49.773889 | -119.736389 | 23.49, 202.08 | [Canadian Geographical Names Database](https://geonames.nrcan.gc.ca/search-place-names/unique?id=JCVCF) |
| Summerland | 49.6019444 | -119.6816667 | 36.10, 263.74 | [BC Geographical Names](https://apps.gov.bc.ca/pub/bcgnws/names/13335.html) |
| Penticton | 49.500833 | -119.593889 | 56.33, 300.00 | [Canadian Geographical Names Database](https://geonames.nrcan.gc.ca/search-place-names/unique?id=JCVCH) |

## Story constraints

The [setting specification](retheme-lorn-bay.md) places Lorn Bay on the west side of Okanagan Lake, roughly forty minutes from Penticton in the story. The bus travels south with the lake on its left ([Day 5](../packages/story/src/scenes/day5.ts), [Day 9](../packages/story/src/scenes/day9.ts)), confirming the east-facing shore.

| Relationship | Story evidence |
| --- | --- |
| The Kettle and Unit One share a property; the six motel units are behind the diner and look toward the lake. | [Night 1](../packages/story/src/scenes/night1.ts) |
| Dianne's house is above the General. | [Day 3](../packages/story/src/scenes/day3.ts) |
| The clinic occupies the old manse behind the community hall. | [Day 3](../packages/story/src/scenes/day3.ts) |
| Sam's boathouse stands at the head of a boat launch, reached by the shore road. | [Day 3](../packages/story/src/scenes/day3.ts) |
| The walk from the motel to the wharf passes the General and then the hall. The hall also occupies a local rise. | [Day 7](../packages/story/src/scenes/day7.ts), [Day 13](../packages/story/src/scenes/day13.ts) |
| The road climbs from the wharf to the highway pull-in. | [Day 7](../packages/story/src/scenes/day7.ts) |
| The gravel beach lies below the breakwater light; the old wharf extends over it. | [Night 1](../packages/story/src/scenes/night1.ts), [Day 18](../packages/story/src/scenes/day18.ts) |

The village's curved streets, building footprints, orchard parcels, contours, and exact north–south ordering are authored illustrations. Contours indicate rising terrain without asserting measured elevations. No measured village scale or walking times are implied. A regional Lorn Bay indication represents a fictional area, not an exact geographic coordinate.

The map must not fix the canoe's discovery site. Conflicting accounts of where it came ashore are intentional evidence in [Day 8](../packages/story/src/scenes/day8.ts). The map also must not reveal new story facts or turn location inspection into unrestricted travel: the current scene's authored choices remain the only visit opportunities.
