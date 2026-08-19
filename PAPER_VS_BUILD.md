# Paper versus build

An audit of Capstone_Project_Proposal.pdf (74 pages, May 2026) against the
code as it stands after Block 9.

Purpose is to know exactly what was promised, what exists, what was added
that nobody wrote down, and what quietly went away. Every deviation listed
here is something a panel can ask about, so each one should have an answer
before the defense rather than during it.

Status markers: (BUILT), (PARTIAL), (NOT BUILT), (CHANGED), (ADDED),
(DROPPED).

## 1. Legacy files

The short answer is that there are almost none. Every file in the
repository is either running, is a migration that a fresh database still
needs, or is an administrative script that will be needed to provision
student accounts for the defense session.

Checked by reference: both files in Assets/ are referenced by code,
teacher.html loads teacher.js and teacher.css, and no orphaned script or
stylesheet exists.

Safe to delete: nothing, with confidence.

Worth a decision, but not mine to make:

Capstone_Project_Proposal.pdf, 2.8 MB, sits in a public repository and is
not used by the application. Harmless, but it is the largest file in the
project and it does not need to ship to a student's phone. Keeping it
versioned alongside the code is also a reasonable choice.

enrollment_setup.sql overlaps with create_accounts.js. They are two routes
to the same outcome, one for accounts made by hand in the dashboard and one
for bulk creation. Both are still useful, and the diagnostic query in step 1
of enrollment_setup.sql is the fastest way to check the null class_id
problem that silently empties the teacher dashboard.

create_accounts.js should stay on disk and leave git. It is needed to create
the student accounts for the session, but it is tracked in a public
repository despite being in .gitignore, because it was committed before that
rule existed. Fix with git rm --cached create_accounts.js. Already on record
in TRACKER.md, still not done.

The real staleness is not files. It is content inside README.md, CLAUDE.md
and TRACKER.md, listed in section 12.

## 2. Functional requirements

The paper specifies seventeen.

| Requirement | Paper specifies | Status |
|---|---|---|
| User Authentication | Students and teachers create accounts, log in, role-specific functions | (CHANGED) Login and role routing built. Self-registration deliberately not built; accounts are administrator-created |
| Chapter Progression | Four sequential acts, linear progression | (PARTIAL) All four registered and unlock in order. Only Act I has content |
| Player Movement | Movement and jump controls | (BUILT) Block 6 |
| Combat Mechanics | Melee attack and special attack | (BUILT) Melee, takedown from behind, and a thrown projectile as the special attack |
| Stealth Mechanics | Stealth actions to avoid enemy detection during designated missions | (BUILT) Patrols, detection meter, hide spots |
| Interaction System | Interact with NPCs, dialogue prompts, scripted objects | (BUILT) |
| Narrative Delivery | Dialogue, scripted sequences, cutscene storytelling | (PARTIAL) Built for Act I only |
| Dynamic Difficulty | Progressively increase mission complexity, detection windows and combat challenge from Act I to Act IV | (BUILT) Guard speed scaled by act number, 1.00 through 1.45. Verified in the test harness; no act beyond Act I has guards yet |
| Health System | Track health, deplete on enemy attacks or environmental hazards, restore through collectible items | (BUILT) Health, damage, invulnerability, respawn, environmental hazards and heart pickups |
| Equipment System | Equip items that alter combat effectiveness and survivability | (NOT BUILT) Tables exist in schema v3. Block 10 |
| Cosmetic Reward | In-game currency for objectives, unlocking period-correct outfits | (NOT BUILT) Currency column exists in schema v3. Block 11 |
| Trivia | Historical trivia fact before each act's pre-test | (BUILT) Act I seeded; Acts II to IV not seeded |
| Act Assessment | Pre-test and post-test before and after each chapter | (BUILT) Act I seeded; Acts II to IV not seeded |
| Performance Scoring | Score from objective completion, stealth effectiveness, and combat efficiency | (BUILT) Weighted sum, 50 completion and 25 each for survival and stealth. Time recorded but not scored |
| Progress Tracking | Record act completion, assessment scores, gameplay performance | (BUILT) Completion, scores, damage taken, detections and elapsed time |
| Teacher Monitoring | View student progress, act completion, assessment results, performance scores | (BUILT) |
| Data Synchronization | Synchronize progress and assessment results to the teacher interface upon internet availability | (CHANGED) Writes go straight to Supabase and the game requires a connection. There is no offline queue, so "upon internet availability" is not implemented as worded |

## 3. Non-functional requirements

The paper specifies ten.

| Requirement | Status |
|---|---|
| Performance | (BUILT) No build step, no framework, plain script tags. Never measured on a real device |
| Reliability | (BUILT) Debounced save, ten second autosave backstop, beforeunload flush, and a logout flush added in Block 7 |
| Usability | (PARTIAL) Tagalog throughout and 44px touch targets, but the mobile control cluster overflows the viewport at phone width. Currently not met on the target device |
| Accessibility | (PARTIAL) Runs in Chrome on Android by design. Never opened on an Android phone |
| Online Functionality | (BUILT) Authentication and data require a connection |
| Compatibility | (PARTIAL) Never tested across Android screen sizes |
| Maintainability | (BUILT) Three layers with a strict dependency direction, documented in CLAUDE.md |
| Data Integrity | (BUILT) Row level security, unique constraints, server-side grading |
| Connectivity | (BUILT) |
| Readability | (BUILT) Plus a text size setting added in Block 7, which the paper does not ask for |

## 4. System modules

The paper names five.

Gameplay Module. (PARTIAL) Movement, jump, stealth, combat, events, health
and objectives built. Equipment and cosmetic rewards are the gap.

Narrative and Progression Module. (PARTIAL) Dialogue and cutscenes built.
Chronological four-act structure exists as a framework with one act filled.

Assessment and Evaluation Module. (PARTIAL) Trivia, pre-test, post-test and
performance scoring built. The paper also specifies "basic user feedback
collection to measure engagement", which appears in the third specific
objective as well. Nothing collects user feedback. This is the least visible
gap in the whole audit and it sits inside a stated objective.

Teacher and Analytics Module. (BUILT)

Authentication and Access Module. (BUILT)

## 5. ERD entities

The paper says fifteen entities, then describes seventeen. That
inconsistency is in the paper itself and will need fixing regardless of the
code.

Entities described: User, StudentProfile, TeacherProfile, ModuleAssessment,
GameSession, GameScore, PlayerAction, Act, ActObjective, PlayerProgress,
Enemy, Equipment, PlayerEquipment, CosmeticReward, UserCosmetic,
Achievement, UserAchievement.

Twelve tables exist after schema v3.

| ERD entity | Built as |
|---|---|
| User, StudentProfile, TeacherProfile | profiles, one table with a role column |
| ModuleAssessment | assessment_items plus assessment_scores |
| GameSession | game_sessions (created in v3, nothing writes to it yet) |
| GameScore | Not built. Satisfied by assessment_scores and act_progress.performance_score together |
| PlayerAction | player_actions (created in v3, nothing writes to it yet) |
| Act | Not a table. Lives in code as content/actN.js |
| ActObjective | Not a table. Lives in the act data files |
| PlayerProgress | game_progress plus act_progress |
| Enemy | Not a table. Guards are scene data in the act files |
| Equipment | Not a table by decision. Will be content/items.js in Block 10 |
| PlayerEquipment | player_equipment (created in v3) |
| CosmeticReward | Not a table by decision. Will be content/items.js |
| UserCosmetic | player_inventory covers it |
| Achievement | Not a table by decision. Will be content/achievements.js |
| UserAchievement | player_achievements (created in v3) |

Tables that exist but are not in the ERD at all: classes, act_trivia,
player_inventory.

The reason several entities are code rather than tables: they hold no
student data and no secret, so a database round trip on a low-end phone buys
nothing. assessment_items is a table precisely because it holds the answer
key.

## 6. Act storyboards

Act I, The Awakening. The paper specifies early life in Tondo, exposure to
colonial injustice, recruitment into the Katipunan, movement tutorials, NPC
dialogue, stealth navigation past Spanish patrols while delivering a secret
message, use of acting and tailoring work as a disguise, a scripted event
where guards harass civilians and trigger his political awakening, and a
Katipunan initiation ceremony with an oath of entry.

Built: the Tondo setting, NPC dialogue, the Katipunero recruitment, and the
stealth delivery past patrols. (PARTIAL)

Not built: the colonial injustice exposure, the disguise mechanic, the
guards harassing civilians event, and the initiation ceremony and oath.

Built but not in the paper: the stage performance cutscene with the day to
night transition and death animation. This is an addition, and its dialogue
is Sakay's execution speech, which belongs to Act IV chronologically.

Acts II, III and IV. (NOT BUILT) Storyboards exist in the paper in detail.
The framework is ready and each is a registered, loadable act with an empty
world.

## 7. Tools

| Paper declares | Reality |
|---|---|
| Unity, primary development platform | (DROPPED) Vanilla HTML, CSS and JavaScript |
| C# | (DROPPED) |
| Microsoft Visual Studio | (DROPPED) |
| MySQL / PostgreSQL / MongoDB | PostgreSQL, through Supabase |
| Aseprite | Still accurate for art |
| Audacity | Listed, but there are no sound assets and no audio in the build |
| Figma | Still accurate for UI prototypes |
| Not declared | Supabase, for auth, database and row level security |
| Not declared | GitHub Pages, for hosting |

The Unity deviation is the largest one in this document and is already on
the documentation debt list. The argument is in the paper's own literature
review: a comparable project was constrained by 3D performance on low-end
devices, and the target device here is a low-end Android phone.

## 8. Added since the paper

Things in the build that the paper never mentions. Most are consequences of
the stack change or of problems found while building.

Scenes, so one act can hold more than one location. The paper assumes one
world per act.

One-way platforms, and jump physics integrated against real frame delta
rather than counted frames, because the target device will not hold 60fps.

Takedown from behind an unalerted guard, and hide spots. The paper specifies
stealth and combat as separate mechanics; making melee read the guard's
facing is what makes them interlock.

No game over. Reaching zero health respawns at the start of the scene at
full health. The paper does not describe a fail state either way.

Health is not persisted and restores to full on load.

Title screen, pause, settings and logout. The paper's UI prototypes cover
only Login, Gameplay, Assessment and Progress screens.

A text size setting.

Act title cards and act transition screens.

Class-based enrollment with a join_code column, and administrator-assigned
class membership.

Server-side grading through security definer functions, so the answer key
never reaches the browser. The paper does not specify how grading works.

One attempt per student per act per test type, enforced by a unique
constraint and by the grading function.

A placeholder fallback system, so a missing sprite renders as a labelled box
rather than breaking the scene.

Cache-busting version strings on every script, stylesheet and asset.

Ten matched pre-test and post-test pairs for Act I, replacing five
unmatched items. Written but not yet seeded.

## 9. Changed since the paper

Self-registration became administrator-created accounts.

The special attack became a thrown projectile with a hold-to-charge control.

Performance scoring became objective completion percentage only. The name
promises more than it currently measures, which is worth saying out loud in
the documentation before a panel notices.

Data synchronization became a hard online requirement rather than
synchronizing when a connection becomes available.

Grade level framing is unchanged and is supported in the paper by the
resource person's own statement that Sakay is included in the Grade 8
Araling Panlipunan curriculum as part of Philippine-American War resistance.

## 10. Dropped since the paper

Unity, C# and Visual Studio.

Offline tolerance and deferred synchronization.

The four Act I story beats listed in section 6.

Three items listed as dropped when this audit was first written have since
been reinstated rather than abandoned, because each traces to a stated
requirement and none is expensive. Environmental hazards and collectible
items that restore health were built in Block 8, and user feedback
collection, which appears in both the Assessment module description and the
third specific objective, was built in Block 9. They are recorded
here so that a reader of an earlier copy of this file is not left
believing the project chose to lose them.

## 11. Still to build, mapped to the paper

Everything outstanding traces back to a stated requirement.

| Block | Closes |
|---|---|
| Block 10, inventory and equipment | Equipment System requirement, Equipment and PlayerEquipment entities |
| Block 11, currency and cosmetics | Cosmetic Reward requirement, CosmeticReward and UserCosmetic entities |
| Block 12, polish | The mobile control overflow, the outpost tuning, and Audacity in the tools list |
| Acts II to IV content | Chapter Progression requirement and three storyboards |
| Seed items for Acts II to IV | Act Assessment and Trivia requirements beyond Act I |

The block numbers above follow TRACKER.md, which was renumbered after the
scope decisions taken from this audit. An earlier copy of this file had
Block 8 as inventory and equipment and Block 10 as dynamic difficulty.
TRACKER.md is the authority on what a block number means.

PlayerAction, Achievement and UserAchievement no longer appear in this
table. They were dropped from the ERD rather than scheduled: a per-action
replay log costs writes on a phone on mobile data and would never be
queried, and achievements add nothing that currency and cosmetics do not
already cover.

## 12. Stale content in the context files

For the next step, not fixed here.

README.md. The Layout section omits shell.js, macario_schema_v3.sql,
macario_items_v3.sql, content/act3.js and content/act4.js, and describes
content/act2.js as covering Acts II to IV. The script order paragraph does
not mention shell.js. The Status section predates the outpost, the Block 6
systems and the Block 7 shell.

CLAUDE.md. The load order block omits shell.js. There is no description of
the shell, the window.Game facade, the pause state, or the entry gate that
now sits before Acts.syncStart. The Database section lists seven tables; there
are twelve. The Decisions on record section predates schema v3, so the
client-written currency column and the choice to keep item and achievement
catalogues in code are missing.

TRACKER.md. The housekeeping entry saying the proposal needs re-exporting as
a real PDF is done. The current file is a genuine 74 page PDF produced by
Word, not a ZIP of page images.
