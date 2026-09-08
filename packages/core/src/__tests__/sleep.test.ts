import { describe, expect, it } from 'vitest';
import { analyzeSleep, coleKripke, sleepPerformance } from '../sleep';
import { syntheticNight } from '../synthetic';

describe('coleKripke', () => {
  it('scores stillness as sleep', () => {
    expect(coleKripke(Array(30).fill(0)).every(Boolean)).toBe(true);
  });

  it('scores sustained movement as wake', () => {
    const flags = coleKripke(Array(30).fill(50));
    expect(flags.some((f) => !f)).toBe(true);
  });

  it('is not fooled into calling one twitch an awakening', () => {
    const activity = Array(30).fill(0);
    activity[15] = 1;
    expect(coleKripke(activity)[15]).toBe(true);
  });
});

describe('analyzeSleep', () => {
  const night = syntheticNight(Date.parse('2026-01-01T23:00:00Z'), 8);

  it('declines to score a recording that is too short', () => {
    expect(analyzeSleep(night.hr.slice(0, 10), night.motion.slice(0, 40))).toBeNull();
  });

  it('finds roughly the right amount of sleep', () => {
    const summary = analyzeSleep(night.hr, night.motion);
    expect(summary).not.toBeNull();
    expect(summary!.asleepMin).toBeGreaterThan(6 * 60);
    expect(summary!.asleepMin).toBeLessThanOrEqual(8 * 60);
  });

  it('reports an efficiency between zero and one', () => {
    const summary = analyzeSleep(night.hr, night.motion)!;
    expect(summary.efficiency).toBeGreaterThan(0.8);
    expect(summary.efficiency).toBeLessThanOrEqual(1);
  });

  it('accounts for every minute across the stages', () => {
    const summary = analyzeSleep(night.hr, night.motion)!;
    const total =
      summary.stageMinutes.awake +
      summary.stageMinutes.light +
      summary.stageMinutes.deep +
      summary.stageMinutes.rem;
    expect(total).toBe(summary.inBedMin);
    expect(summary.epochs).toHaveLength(summary.inBedMin);
  });

  it('finds all four stages in a normal night', () => {
    const summary = analyzeSleep(night.hr, night.motion)!;
    expect(summary.stageMinutes.deep).toBeGreaterThan(0);
    expect(summary.stageMinutes.rem).toBeGreaterThan(0);
    expect(summary.stageMinutes.light).toBeGreaterThan(0);
  });

  it('still works from heart rate alone when there is no accelerometer', () => {
    const summary = analyzeSleep(night.hr, []);
    expect(summary).not.toBeNull();
    expect(summary!.asleepMin).toBeGreaterThan(4 * 60);
  });

  it('measures sleep performance against the need you set', () => {
    const summary = analyzeSleep(night.hr, night.motion)!;
    expect(sleepPerformance(summary, 8)).toBeLessThanOrEqual(1);
    expect(sleepPerformance(summary, 4)).toBe(1);
  });
});
