"""
MACARIO - _dev/tools/make-sfx.py

The game's small sound effects (Block 58): short retro tones made from
square, triangle and sine waves and a little noise, in the spirit of the
pixel art, written as 16-bit mono WAV files at 22050 Hz so each is a
few kilobytes. The loudness of each is baked into the file here, so the
engine plays them all at one volume (game.js, SFX_VOLUME) and a sound
that plays on every line of dialogue can simply be made quiet here.

Recorded or commissioned effects replace any of these by dropping a
file over the same name (and bumping ASSET_VERSION); the engine does not
care how a sound was made.

Usage, from the repository root (needs numpy, dev-time only):

    python3 _dev/tools/make-sfx.py
"""
import wave
import numpy as np

RATE = 22050
OUT = "assets/audio/sfx/"


def t_of(seconds):
    return np.arange(int(RATE * seconds)) / RATE


def square(freq, seconds, duty=0.5):
    t = t_of(seconds)
    f = np.broadcast_to(freq, t.shape) if np.ndim(freq) else np.full(t.shape, freq)
    phase = np.cumsum(f) / RATE
    return np.where((phase % 1.0) < duty, 1.0, -1.0)


def triangle(freq, seconds):
    t = t_of(seconds)
    f = np.broadcast_to(freq, t.shape) if np.ndim(freq) else np.full(t.shape, freq)
    phase = (np.cumsum(f) / RATE) % 1.0
    return 4 * np.abs(phase - 0.5) - 1


def sine(freq, seconds):
    t = t_of(seconds)
    f = np.broadcast_to(freq, t.shape) if np.ndim(freq) else np.full(t.shape, freq)
    return np.sin(2 * np.pi * np.cumsum(f) / RATE)


def noise(seconds, seed=7):
    return np.random.default_rng(seed).uniform(-1, 1, len(t_of(seconds)))


def env(n, attack=0.005, release=None, curve=2.0):
    """Quick attack, then a decay to silence over the rest."""
    a = max(1, int(RATE * attack))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    tail = np.linspace(1, 0, n - a) ** curve
    e[a:] = tail
    return e


def sweep(f0, f1, seconds):
    return np.linspace(f0, f1, len(t_of(seconds)))


def notes(parts):
    return np.concatenate(parts)


def write(name, sig, gain):
    sig = np.clip(sig * gain, -1, 1)
    # A few milliseconds of fade at both ends, so no sound clicks.
    k = int(RATE * 0.003)
    sig[:k] *= np.linspace(0, 1, k)
    sig[-k:] *= np.linspace(1, 0, k)
    data = (sig * 32767).astype("<i2").tobytes()
    with wave.open(OUT + name + ".wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(data)
    print("wrote", OUT + name + ".wav", len(data) // 1024, "KB")


def tone(kind, freq, seconds, curve=2.0):
    s = {"square": square, "triangle": triangle, "sine": sine}[kind](freq, seconds)
    return s * env(len(s), curve=curve)


# A line of dialogue: a soft tick. Heard on every line, so very quiet.
write("blip", tone("square", 740, 0.045, curve=1.5), 0.16)

# Barya earned: the classic two-note coin.
write("coin", notes([tone("square", 988, 0.07, 0.5), tone("square", 1319, 0.26, 1.8)]), 0.22)

# Something handed over (a gift button): a short rising triangle arpeggio.
write("give", notes([tone("triangle", f, 0.085, 1.2) for f in (523, 659, 784)] +
                    [tone("triangle", 1047, 0.22, 2.0)]), 0.5)

# A new task (Bagong gawain): brighter, a little longer.
write("quest", notes([tone("square", f, 0.08, 1.0) for f in (784, 988, 1175)] +
                     [tone("square", 1568, 0.3, 2.2)]), 0.14)

# An apple caught: a quick upward pop.
write("catch", tone("square", sweep(500, 1400, 0.09), 0.09, 1.5), 0.2)

# An apple on the ground: a soft low thud.
thud = tone("sine", sweep(180, 60, 0.18), 0.18, 2.5) + 0.25 * noise(0.18) * env(len(t_of(0.18)), curve=6)
write("miss", thud, 0.45)

# The jump is no longer made here: its square wave sweeping up read as a
# cartoon boing, and Block 93 replaced it with a scuff and a thump, made
# by _dev/tools/make-fun-sfx.js.

# A door, or any fade to another place: a low swoosh of filtered noise.
n = noise(0.5, seed=3)
n = np.convolve(n, np.ones(24) / 24, mode="same")
swoosh = n * np.sin(np.linspace(0, np.pi, len(n))) ** 1.5
write("door", swoosh, 1.3)

# The black card (intertitle) is no longer made here: its bell read as a
# phone's message chime, and Block 81 replaced it with a low drum and a
# curtain's swish, made by _dev/tools/make-scene-sfx.js.
