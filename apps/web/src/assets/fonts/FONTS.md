# Fonts

Self-hosted, subset (latin) woff2 files from the fontsource packages, all
under the SIL Open Font License 1.1 (see LICENSE-*.txt beside them).

| Family (CSS name)       | Source package            | Files                                   |
|-------------------------|---------------------------|-----------------------------------------|
| NH Serif (Literata)     | @fontsource/literata      | literata-400.woff2, literata-400i.woff2 |
| NH Hand (Kalam)         | @fontsource/kalam         | kalam-300/400/700.woff2                 |
| NH Hand Wren (Caveat)   | @fontsource/caveat        | caveat-400.woff2                        |
| NH Mono (IBM Plex Mono) | @fontsource/ibm-plex-mono | plex-mono-400/600.woff2                 |

The CSS family names are local aliases so the shipped files never collide
with a player's installed fonts; every `--serif/--hand/--hand-wren/--mono`
token keeps a system fallback stack. Budget: ≤ 250 KB total.
