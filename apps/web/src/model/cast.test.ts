import { describe, expect, it } from 'vitest';
import { advance, initialState, type WorldState } from '@not-here/engine';
import { buildContent, OPENING_SCENE } from '@not-here/story';
import {
  castFor,
  FIRST_MEETING,
  metCharacters,
  sketchOpacity,
  visibleCast,
  WREN_FRAME_OPACITY,
} from './cast.ts';
import { sceneToken } from './places.ts';

const content = buildContent();
const scene = (id: string) => {
  const s = content.scenes.get(id);
  if (s === undefined) throw new Error(`no such scene ${id}`);
  return s;
};
const present = (id: string): readonly string[] => castFor(scene(id)).present;

describe('castFor — who is in the room', () => {
  it('never identifies the horn operator on Night 1', () => {
    expect(present('n1-312')).toEqual([]);
    expect(present('n1-beach')).toEqual([]);
    expect(present('n1-walk')).toEqual([]);
  });

  it('keeps Night 1 to Barb alone', () => {
    const night1 = [...content.scenes.values()].filter((s) => s.id.startsWith('n1-'));
    for (const s of night1) {
      for (const who of castFor(s).present) expect(who, s.id).toBe('barb');
    }
  });

  it('agrees with the first-meeting table at the intro scenes', () => {
    for (const [id, who] of Object.entries(FIRST_MEETING)) {
      if (who === 'wren') {
        expect(castFor(scene(id)).wrenFrame).toBe(true);
        continue;
      }
      expect(present(id), id).toContain(who);
    }
  });

  it('reads the @line speakers the view loses', () => {
    expect(present('d15-supper')).toEqual(['dianne']);
    expect(present('d13-morning')).toContain('barb');
    expect(present('d5-evening')).toEqual(['barb', 'tam']);
  });

  it('puts the speaker of the verdict first at the potluck', () => {
    expect(present('d13-verdict')[0]).toBe('sam');
    expect(present('d13-hall')).toEqual(['dianne', 'sam']);
  });

  it('leaves the player alone where the prose does', () => {
    for (const id of ['d2-night', 'd9-night', 'd14-night', 'd17-reveal', 'd7-walk', 'd22-after']) {
      expect(present(id), id).toEqual([]);
    }
  });

  it('never names more than two', () => {
    for (const s of content.scenes.values()) expect(castFor(s).present.length).toBeLessThanOrEqual(2);
  });

  it('only raises the empty frame where the act closes', () => {
    const frames = [...content.scenes.values()].filter((s) => castFor(s).wrenFrame).map((s) => s.id);
    expect(frames).toEqual(['act1-end']);
  });

  it('never names a character before the day of their intro', () => {
    const introDay = (id: string): number => {
      const m = /^d(\d+)-/.exec(id);
      return id.startsWith('n1-') ? 1 : m ? Number(m[1]) : 99;
    };
    const firstDayOf: Record<string, number> = {};
    for (const [id, who] of Object.entries(FIRST_MEETING)) {
      if (who !== 'wren') firstDayOf[who] = Math.min(firstDayOf[who] ?? 99, introDay(id));
    }
    for (const s of content.scenes.values()) {
      const day = introDay(s.id);
      for (const who of castFor(s).present) {
        expect(day, `${s.id} names ${who} before ${firstDayOf[who]}`).toBeGreaterThanOrEqual(firstDayOf[who] ?? 0);
      }
    }
  });
});

describe('metCharacters — the first-meeting gate survives', () => {
  const base = initialState(3, OPENING_SCENE);

  it('meets nobody at the opening', () => {
    expect([...metCharacters(base, content.scenes)]).toEqual([]);
  });

  it('does not meet Wade from Night 1 alone', () => {
    const night1: WorldState = {
      ...base,
      sceneId: 'n1-312',
      choiceLog: ['n1-title', 'n1-beach', 'n1-walk', 'n1-diner', 'n1-meal', 'n1-room'].map((s) => ({
        scene: s,
        choice: 'x',
        day: 1,
        slot: 'night' as const,
      })),
    };
    const met = metCharacters(night1, content.scenes);
    expect(met.has('barb')).toBe(true);
    expect(met.has('wade')).toBe(false);
  });

  it('meets Sam at the shed on Day 8 if Day 3 was skipped', () => {
    const later: WorldState = { ...base, sceneId: 'd8-shed', choiceLog: [] };
    expect(metCharacters(later, content.scenes).has('sam')).toBe(true);
  });
});

describe('visibleCast — a first-choice walk keeps visible ⊆ met', () => {
  it('holds for forty steps from the opening', () => {
    let state = initialState(11, OPENING_SCENE);
    let step = advance(content, state, { kind: 'enter' });
    for (let i = 0; i < 40; i += 1) {
      state = step.state;
      const current = content.scenes.get(state.sceneId);
      if (current === undefined) break;
      const met = metCharacters(state, content.scenes);
      for (const sketch of visibleCast(current, state, content.scenes)) {
        if (sketch.who !== 'wren') expect(met.has(sketch.who), `${state.sceneId}: ${sketch.who}`).toBe(true);
      }
      const open = step.view.choices.find((c) => !c.locked);
      if (open === undefined || step.view.ending !== undefined) break;
      step = advance(content, state, { kind: 'choose', choiceId: open.id });
    }
  });

  it('uses bounded trust opacity and a fixed frame opacity', () => {
    expect(sketchOpacity(0)).toBe(0.22);
    expect(sketchOpacity(10)).toBe(0.55);
    expect(sketchOpacity(5)).toBe(0.385);
    expect(sketchOpacity(-4)).toBe(0.22);
    expect(sketchOpacity(40)).toBe(0.55);
    expect(WREN_FRAME_OPACITY).toBe(0.45);
  });

  it('tokens with a cast always resolve to real character ids', () => {
    for (const s of content.scenes.values()) {
      expect(typeof sceneToken(s.id)).toBe('string');
      for (const who of castFor(s).present) expect(['dianne', 'wade', 'priya', 'sam', 'barb', 'tam']).toContain(who);
    }
  });
});
