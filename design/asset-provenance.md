# Asset provenance and art reference

Status: the creator approved the sample on 2026-09-07 and explicitly requested expansion. Created with the built-in image generation tool; no fallback CLI was used. The source paintings remain intact in assets/locations. Browser JPGs are delivery conversions, not retouched designs.

## Shared reference

Use the Kettle painting as the visual reference for subsequent places: brushed oil/gouache texture, slate lake colors, quiet amber practical light, worn wood, ordinary domestic detail, no gothic spectacle. Keep important objects in the central 70% for portrait crops. The existing six ink sketches are retained. A single definitive Wren portrait has been produced for her arrival; its likeness has not been separately approved for further pose variants. Keep the protagonist unresolved. Reserve Wren’s definitive portrait for arrival.

## Production record

| Asset | Method/reference | Source SHA-256 | Review |
| --- | --- | --- | --- |
| kettle.png | built-in image generation; initial reference | 7da4ae10584a6302c7b8a181123eea311cae1bfda6bf5fd7ff641c3dccfe8bc7 | Approved 2026-09-07 |
| shore.png | built-in image generation; Kettle reference | b49effdf6d096d6b059d89dbb0dfcc1a21822bf639c556747a62117bd958f6ea | Approved 2026-09-07 |
| general.png | built-in image generation; Kettle reference | d0afa6ae13b246dceb9ec62d0be7babf3eeaa9cc31f6b53ccb0d6bce148c9514 | Approved 2026-09-07 |

Web copies: apps/web/public/art/{kettle,shore,general}.jpg, JPEG quality 84. Original generated PNGs are retained in the Codex generated_images directory as well. These paths are documented in this task’s generation results.

## Final prompt set

### The Kettle

Use case: illustration-story. Create one landscape game background painting for NOT HERE, an intimate illustrated mystery set in a fictional small community on Okanagan Lake, British Columbia, early November, present day. Scene: THE KETTLE diner at closing time, seen from a seated guest's eye level near the entrance. A worn wood counter runs into depth, a couple of mismatched mugs, metal coffee machine, small handwritten register open on the counter, stools, chairs up on some tables. Wide windows on the left look out on a dark blue-grey foggy lake and a few orchard hillside lights. Amber shaded practical lamps and kitchen light make the diner hospitable, modest and lived in, with a quietly empty stool. No people; no spooky figures. Hand-painted editorial gouache and oil texture, sophisticated muted palette, strong simple shapes, restrained detail, visibly brushed edges. Tenderness and unease, grounded everyday life, not a horror poster. Wide cinematic 16:9 composition suitable for a responsive scene header, meaningful objects within central 70 percent; no text, no logos, no UI, no border. This is the first reference painting for a coherent small indie game art set.

### The shore

Generate a new matching illustration, not an edit of the room: NOT HERE game location, shore road on Okanagan Lake BC early November at blue hour. Use the reference only for its coherent hand-painted oil/gouache brushwork, muted grounded palette and tender unease. Wide 16:9 composition. Foreground rounded gravel beach, empty old ferry wharf and pilings to right with a tiny breakwater light; inland to left bare orchard rows up a dry hillside and the amber window of a modest diner/motel far along the road. Fog obscures the flat cold lake and opposite hills. First-person standing height, modest scale, no people or protagonist visible, no ghosts, no fantasy gothic buildings, no text/UI. Primary objects in central 70% for responsive crops. Cold desaturated slate blue with the single small amber window as invitation. Lived-in inland British Columbia, understated painterly artistry.

### The General bedroom

Generate a new matching illustration, not an edit of the diner: NOT HERE game location, a modest bedroom above a general store in Okanagan Lake BC. Use reference ONLY for oil/gouache brushwork, muted grounded palette, worn wood and tender unease. Wide 16:9. November grey daylight through one open sash window left, bare orchard slope and foggy lake faint beyond. A well-kept single bed with a faded patchwork quilt partly folded across it, blue dress-fabric patch among restrained ochre/rust/grey pieces. Small desk and an acoustic guitar in the shadow to right; a bare corkboard with faded rectangular marks where pictures once were. A cardboard storage box and clean folded sheets. This is an absent adult daughter's teenage room carefully kept for seven years. No people, no supernatural effects, no text/UI, no overgrown ruin, no elaborate mansion. First-person eye-level view from doorway. Central 70% contains quilt and window. Specific domestic tenderness, a place kept rather than used.

## Audio provenance

The sample is synthesized from authored score data in packages/music/scores/immersion.ts, derived from the game’s existing five-bar melody. Guitar and piano use damped modal synthesis; the reed uses FM. These are acoustic direction auditions, not recorded human performances. Ambient beds are deterministic noise/hum sketches, not claimed field recordings. No voice performance has been produced. No external music was copied. The reference to Kentucky Route Zero is a creative direction supplied by the creator, not source audio.

## Controlled revision

Record the accepted composition, palette and crop behavior before generating the other six places. Keep this reference, source art and hashes. Add an entry for each replacement with its prompt, reference inputs, tool/provider, edit history and approval status. Character approval must cover face, silhouette, age, clothing and expression before multiplying poses. Audition music at low volume, in silence transitions, on headphones and phone speakers; record acceptance separately from technical test results.

## Approved expansion — September 7

The creator accepted the sample paintings and musical direction, then asked to expand them. All nine locations now have paintings. Four separate compositions stage the quilt loss, potluck, letters and bus. A controlled Kettle variant adds the work the protagonist chose; a single Wren ink portrait first appears at physical arrival. The protagonist remains unpictured and the first touch remains in the ending prose. No external likeness or stock art was used.

- [Source hashes and browser delivery sizes](production-asset-manifest.json). All source PNGs live under assets/locations, assets/scenes and assets/portraits; browser JPEGs live under apps/web/public/art.
- [Six location prompts and reference inputs](production-prompts.json), [generated source paths](production-sources.json).
- [Major scene and Wren prompts](major-scene-prompts.json), [generated source paths](major-scene-sources.json).
- [Controlled Kettle revision prompt](kettle-work-prompt.txt), [source and reference](kettle-work-source.json).

Every image used the built-in image-generation tool. No fallback CLI was used. The new locations were inspected against the approved paintings; the hall and shelter then became references for their occupied/arrival compositions. The original three paintings remain intact. JPEG conversion is delivery encoding, not a design edit.

The expanded soundtrack is authored in packages/music/scores/production.ts: fourteen additional arrangements and seven acoustic ensemble stems, with six quarter-tone variants. The synchronized masters are 480,000 frames at 32 kHz (15 seconds). Notes and silence stay aligned when a variant replaces a layer. Ordinary cues use AAC delivery with a WAV fallback; ensemble playback stays lossless. The 23 compressed revised cues total 5,747,557 bytes, versus 116,193,600 bytes for the corresponding WAVs.

The room sounds in apps/web/src/environment-audio.ts are deterministic designed Foley: cutlery, heater ticks, paper, wood, label feed, compressor air, rope, sanding and engine pulse. They are not claimed field recordings. Guitar, piano, whistle, reed and horn remain synthesized performances in the approved direction; no human voice recording has been produced. Human fatigue and emotional auditions remain distinct from technical playback verification.
