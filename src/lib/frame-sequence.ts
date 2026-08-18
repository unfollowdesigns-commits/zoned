/**
 * Preloading a frame sequence, properly.
 *
 * WHY THIS IS NOT `frames.map(src => new Image())`.
 *
 * Firing 120 requests at once does not make them arrive sooner. The browser
 * caps parallel connections per origin, and over HTTP/2 you get one connection
 * whose flow-control window is then shared 120 ways, so every frame arrives
 * slowly and in an order nobody chose. Frame 1 — the only one needed to render
 * anything at all — finishes alongside frame 120. A small concurrency window
 * means early frames land first and the sequence becomes drawable early.
 *
 * AND WHY `decode()` RATHER THAN `onload`.
 *
 * `onload` fires when the bytes are in and the header is parsed. The actual
 * JPEG decode still has to happen, and it happens lazily, on the main thread,
 * inside the first `drawImage` that touches it. Preloading on `onload` alone
 * therefore moves the network wait off the scroll but leaves every decode on
 * it: the sequence stutters exactly once per frame, on the frame you first
 * reach it, which reads as a permanently janky scrub on first pass and a
 * perfectly smooth one on second pass. That signature is the giveaway.
 * `img.decode()` resolves once the bitmap is ready to paint, so by the time
 * the gate opens there is no decode work left anywhere in the scroll.
 */

export type SequenceProgress = {
  loaded: number;
  total: number;
  /** 0 to 1. */
  ratio: number;
};

export type LoadSequenceOptions = {
  /** Total number of frames. */
  count: number;
  /** Maps a 1-based frame number to its URL. */
  src: (frame: number) => string;
  /**
   * How many to fetch at once. Six matches what browsers historically allowed
   * per origin over HTTP/1.1 and stays well inside a sensible HTTP/2 window;
   * higher numbers measurably delay the first drawable frame without improving
   * total time.
   */
  concurrency?: number;
  onProgress?: (progress: SequenceProgress) => void;
  signal?: AbortSignal;
};

/** Thrown when the caller aborts. Distinguishable from a genuine load failure. */
export class SequenceAborted extends Error {
  constructor() {
    super("Frame sequence loading was aborted");
    this.name = "SequenceAborted";
  }
}

function loadOne(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    /* Lets the sequence be served from a CDN and still be drawable into a
       canvas without tainting it. Harmless same-origin. */
    img.crossOrigin = "anonymous";
    /* These two are the difference between the browser treating the sequence as
       page-critical or as decoration it can defer behind everything else. */
    img.decoding = "async";
    img.fetchPriority = "high";
    img.src = url;

    /* `decode()` is the real signal, but it is not universally implemented for
       every image type and it rejects on some browsers for images that will in
       fact paint. Falling back to the load event keeps a stubborn frame from
       stalling the whole gate. */
    if (typeof img.decode === "function") {
      img
        .decode()
        .then(() => resolve(img))
        .catch(() => {
          if (img.complete && img.naturalWidth > 0) resolve(img);
          else reject(new Error(`Failed to decode frame: ${url}`));
        });
      return;
    }

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load frame: ${url}`));
  });
}

/**
 * Loads every frame, resolving only once all of them are decoded and paintable.
 *
 * Frames come back in an array indexed 0..count-1, so `frames[i]` is frame
 * `i + 1` on disk.
 */
export async function loadSequence({
  count,
  src,
  concurrency = 6,
  onProgress,
  signal,
}: LoadSequenceOptions): Promise<HTMLImageElement[]> {
  const frames = new Array<HTMLImageElement>(count);
  let loaded = 0;
  /* A shared cursor rather than chunked batches. Batching makes every worker
     wait for the slowest member of its batch before any of them start the next
     one, which on a flaky connection idles five workers behind one straggler.
     A cursor keeps all of them saturated. */
  let cursor = 0;

  const report = () => {
    loaded += 1;
    onProgress?.({ loaded, total: count, ratio: count === 0 ? 1 : loaded / count });
  };

  async function worker() {
    for (;;) {
      if (signal?.aborted) throw new SequenceAborted();
      const index = cursor;
      cursor += 1;
      if (index >= count) return;

      frames[index] = await loadOne(src(index + 1));
      report();
    }
  }

  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, count)) },
    worker,
  );
  await Promise.all(workers);

  if (signal?.aborted) throw new SequenceAborted();
  return frames;
}

/**
 * Pads a frame number the way image sequences are conventionally named, so
 * `frameUrl("/sequence/hero", 7, 3, "jpg")` gives `/sequence/hero/frame_007.jpg`.
 *
 * Zero-padding is not cosmetic: unpadded names sort lexically as 1, 10, 100, 2,
 * which silently scrambles the sequence in any tool that globs the directory,
 * including the ffmpeg call that produced it.
 */
export function frameUrl(
  dir: string,
  frame: number,
  pad = 3,
  ext = "jpg",
  prefix = "frame_",
): string {
  return `${dir}/${prefix}${String(frame).padStart(pad, "0")}.${ext}`;
}
