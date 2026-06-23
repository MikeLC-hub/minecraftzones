/**
 * ============================================================================
 * SECTION 1: Fundamental Dimensions & Coordinate Systems
 * ============================================================================
 */

type BlockScale = number;

const enum CoordKind {
    Undeclared,
    Origin,
    Terminal,
    Delta,
    Anchor
}

const COORDNAME: string[] = [
    "Undeclared",
    "Origin",
    "Terminal",
    "Delta",
    "Anchor"
];

/**
 * REPRESENTATION FOR MC/EXTERNAL VECTORS
 * Stubbed to ensure compiling and seamless integrations with external positioning libraries.
 */
interface Position {
    toWorld(): Position;
    getValue(axis: Axis): number;
}

/**
 * GENERIC MUTABLE 3D COORDINATE
 * Default dynamic coordinate container.
 */
type Coord3D<C extends CoordKind> = {
    x: BlockScale;
    y: BlockScale;
    z: BlockScale;
    kind: C;
};

/**
 * GENERIC READONLY 3D COORDINATE
 * Enforces immutability constraints.
 */
interface LockedCoord<C extends CoordKind> {
    readonly x: BlockScale;
    readonly y: BlockScale;
    readonly z: BlockScale;
    readonly kind: C;
}

// Strongly-typed coordinate variants
type Origin = LockedCoord<CoordKind.Origin>;
type Terminal = LockedCoord<CoordKind.Terminal>;
type Delta = Coord3D<CoordKind.Delta>;
type Anchor = Coord3D<CoordKind.Anchor>;

// Discriminated union of all coordinate types
type Coord = Origin | Terminal | Delta | Anchor | Coord3D<CoordKind>;

/**
 * ============================================================================
 * SECTION 2: Spatial Enumerations & Mappings
 * ============================================================================
 */

const enum Plane { Xy, Zy, Zx }

const Abscissa: { [key: number]: Axis } = {
    [Plane.Xy]: Axis.X,
    [Plane.Zy]: Axis.Z,
    [Plane.Zx]: Axis.Z
};

const Ordinate: { [key: number]: Axis } = {
    [Plane.Xy]: Axis.Y,
    [Plane.Zy]: Axis.Y,
    [Plane.Zx]: Axis.X
};

const Applicate: { [key: number]: Axis } = {
    [Plane.Xy]: Axis.Z,
    [Plane.Zy]: Axis.X,
    [Plane.Zx]: Axis.Y
};

type Id = string;

const SurfaceIds: string[] = [
    "-Volume",
    "-Left",
    "-Right",
    "-Bottom",
    "-Top",
    "-Front",
    "-Back"
];

const enum Surface {
    Volume,
    Left,
    Right,
    Bottom,
    Top,
    Front,
    Back
}

const SurfacePlane: { [key: number]: Plane } = {
    [Surface.Left]: Plane.Zy,
    [Surface.Right]: Plane.Zy,
    [Surface.Bottom]: Plane.Zx,
    [Surface.Top]: Plane.Zx,
    [Surface.Front]: Plane.Xy,
    [Surface.Back]: Plane.Xy
};

const BoundIds: string[] = [
    "-Inner",
    "-Exact",
    "-Outer"
]
const enum Bound {
    Inner,
    Exact,
    Outer
}

const DesignIds: string[] = [
    "-Solid",
    "-HorizontalLines",
    "-VerticalLines",
    "-Dots"
]

const enum Design {
    Solid,
    HorizontalLines,
    VerticalLines,
    Dots
}

interface Pattern {
    readonly anchor: Anchor;
    readonly abscissa: Segment;
    readonly ordinate: Segment;
    readonly applicate: Segment;
}
function newPattern(anchor: Anchor, abscissa: Segment, ordinate: Segment, applicate: Segment): Pattern {
    return { anchor, abscissa, ordinate, applicate };
}

/**
 * ============================================================================
 * SECTION 3: Axial Representation & Configuration
 * ============================================================================
 */

type Axial = {
    readonly axis: Axis;
    length: BlockScale;
    count: number;
    interval: BlockScale;
    blocks: BlockScale;
};

interface Segment {
    count?: number;
    interval?: BlockScale;
    blocks?: BlockScale;
}

interface Configs {
    Id?: Id;
    Origin?: Origin;
    Terminal?: Terminal;
    Anchor?: Anchor;
    SegX?: Segment;
    SegY?: Segment;
    SegZ?: Segment;
    Surface?: Surface;
    Bound?: Bound;
    Design?: Design;
}

const AttrIds: string[] = [
    "Id",
    "Origin",
    "Terminal",
    "Anchor",
    "SegX",
    "SegY",
    "SegZ",
    "Surface",
    "Bound",
    "Design",
]
const enum Attr {
    Id,
    Origin,
    Terminal,
    Anchor,
    SegX,
    SegY,
    SegZ,
    Surface,
    Bound,
    Design,
}

type Space = {
    Id: Id;
    Origin: Origin;
    Terminal: Terminal;
};

interface ZoneSpace extends Space {
    readonly _Id0: Id;
    readonly _Origin0: Origin;
    readonly _Terminal0: Terminal;
    Anchor: Anchor;
    Zx: Axial;
    Zy: Axial;
    Zz: Axial;
    SegX: Segment;
    SegY: Segment;
    SegZ: Segment;
    Surface: Surface;
    Design: Design;
    Bound: Bound;
    config(configs: Configs): void;
    toString(): string;
    setSurface(surface: Surface): void;
    setDesign(newPattern: Design): void;
    reset(): void;
}

const DEFL_ID: Id = "MySpace_";
const DEFL_STATE: State = State.Defl;
const DEFL_SURFACE: Surface = Surface.Volume;
const DEFL_PATTERN: Design = Design.Solid;
const DEFL_BOUND: Bound = Bound.Exact;
const DEFL_AXIS: Axis = Axis.X;

function newSegment(): Segment { return {}; }
function newConfigs(): Configs { return {}; }

/**
 * ============================================================================
 * SECTION 4: State Management Engine
 * ============================================================================
 */

type Attribute = Id | Origin | Terminal | Surface | Design | Bound | Segment | Anchor | undefined;

type States<A extends Attribute> = {
    defl: A;
    current: A;
    update?: A;
};

const enum State { Defl, Current, Update }

function getState<A extends Attribute>(states: States<A>, state: State): A | undefined {
    const defl: A = states.defl;
    const current: A = states.current;
    const update: A = states.update;

    let stateConfig: A | undefined = undefined;

    switch (state) {
        case State.Defl:
            stateConfig = defl;
            break;
        case State.Current:
            stateConfig = current;
            break;
        case State.Update:
            stateConfig = update;
            break;
    }

    if (stateConfig !== undefined) {
        return stateConfig;
    } else if (current !== undefined) {
        return current;
    } else if (defl !== undefined) {
        return defl;
    }
    return undefined;
}

/**
 * ============================================================================
 * SECTION 5: Coordinate Logic & Calculations (Coords Namespace)
 * ============================================================================
 */

namespace Coords {
    export function toString(coord: Coord): string {
        return `{ kind: ${COORDNAME[coord.kind]}, x: ${coord.x}, y: ${coord.y}, z: ${coord.z} }`;
    }

    // Generics enabled: Automatically typing return coordinates safely to sub-types
    export function create<C extends Coord = Coord>(x: number, y: number, z: number, _kind?: CoordKind): C {
        const kind = _kind !== undefined ? _kind : CoordKind.Undeclared;
        const coord = {
            x: x | 0,
            y: y | 0,
            z: z | 0,
            kind: kind
        };
        return coord as any as C;
    }

    // Generics enabled: Defaults return type matching context demands
    export function getDefault<T extends Coord = Coord>(_kind?: CoordKind): T {
        return create<T>(0, 0, 0, _kind);
    }

    export function newAnchor(_x?: number, _y?: number, _z?: number): Anchor {
        return create<Anchor>(
            _x ? Math.abs(_x | 0) : 0,
            _y ? Math.abs(_y | 0) : 0,
            _z ? Math.abs(_z | 0) : 0,
            CoordKind.Anchor
        );
    }

    export function gridAnchor(plane?: Plane, _base?: number): Anchor {
        const base = _base !== undefined ? Math.abs(_base | 0) : 10;
        switch (plane) {
            case Plane.Xy: return newAnchor(base, base, undefined);
            case Plane.Zy: return newAnchor(undefined, base, base);
            case Plane.Zx: return newAnchor(base, undefined, base);
            default: return newAnchor(base, base, base);
        }
    }

    export function fromPosition(pos: Position): Coord {
        const world_pos: Position = pos.toWorld();
        return create(
            world_pos.getValue(Axis.X),
            world_pos.getValue(Axis.Y),
            world_pos.getValue(Axis.Z),
            CoordKind.Undeclared
        );
    }

    export function clone<C extends Coord>(coord: C): C {
        return create<C>(
            coord.x,
            coord.y,
            coord.z,
            coord.kind !== undefined ? coord.kind : CoordKind.Undeclared
        );
    }

    export function getOrigin(coord0: Coord, coord1: Coord): Origin {
        return create<Origin>(
            Math.min(coord0.x, coord1.x),
            Math.min(coord0.y, coord1.y),
            Math.min(coord0.z, coord1.z),
            CoordKind.Origin
        );
    }

    export function getTerminal(coord0: Coord, coord1: Coord): Terminal {
        return create<Terminal>(
            Math.max(coord0.x, coord1.x),
            Math.max(coord0.y, coord1.y),
            Math.max(coord0.z, coord1.z),
            CoordKind.Terminal
        );
    }

    export function getDelta(coord0: Coord, coord1: Coord): Delta {
        return create<Delta>(
            (Math.abs(coord0.x - coord1.x) + 1),
            (Math.abs(coord0.y - coord1.y) + 1),
            (Math.abs(coord0.z - coord1.z) + 1),
            CoordKind.Delta
        );
    }

    export function anchor<C extends Coord>(_anchor: Anchor, coord: C): C {
        const offset: number = (coord.kind === CoordKind.Terminal) ? 1 : 0;

        const Anchored = (anc: number, scalar: number): number => {
            const base: number = Math.abs(anc | 0);
            if (base < 1) { return scalar; }

            let multiple: number = (scalar / base) | 0;
            if (scalar % base !== 0) {
                multiple += offset;
            }
            return multiple * base;
        };

        return create<C>(
            Anchored(_anchor.x, coord.x),
            Anchored(_anchor.y, coord.y),
            Anchored(_anchor.z, coord.z),
            coord.kind
        );
    }
}

/**
 * ============================================================================
 * SECTION 6: Axial Logic & Calculations (Axials Namespace)
 * ============================================================================
 */

namespace Axials {
    export const BLOCK_LIMIT: BlockScale = 64;
    export const BLOCK_MINIMUM: BlockScale = 1;

    export const GridSegment: Segment = {
        interval: 10,
        blocks: 1
    };

    export function toString(axial: Axial): string {
        return `{ axis: ${axial.axis}, length: ${axial.length}, count: ${axial.count}, interval: ${axial.interval}, blocks: ${axial.blocks} }`;
    }

    export function segString(segment: Segment): string {
        const segStrings: string[] = []
        if (segment.count !== undefined) segStrings.push("count: " + segment.count);
        if (segment.interval !== undefined) segStrings.push("interval: " + segment.interval);
        if (segment.blocks !== undefined) segStrings.push("blocks: " + segment.blocks);
        return "{ " + segStrings.join(", ") + " }";
    }

    export function getDefault(_axis?: Axis): Axial {
        return {
            axis: _axis !== undefined ? _axis : DEFL_AXIS,
            length: 1,
            count: 1,
            interval: 1,
            blocks: 1
        };
    }

    export function configure(axial: Axial, _config?: Segment): void {
        const config: Segment = _config ? _config : {};
        const length: BlockScale = axial.length | 0;

        let count: number = Math.ceil(length / BLOCK_LIMIT);
        let interval: BlockScale = Math.ceil(length / count);
        let blocks: BlockScale = interval;

        if (config.count !== undefined) {
            count = Math.max(count, config.count);
            interval = Math.ceil(length / count);
            blocks = interval;
        }
        if (config.interval !== undefined) {
            interval = Math.max(BLOCK_MINIMUM, Math.min(BLOCK_LIMIT, config.interval));
            count = Math.ceil(length / interval);
            blocks = interval;
        }
        if (config.blocks !== undefined) {
            blocks = Math.max(BLOCK_MINIMUM, Math.min(interval, config.blocks));
        }

        axial.count = count;
        axial.interval = interval;
        axial.blocks = blocks;
    }

    export function updateDelta(axial: Axial, delta: Delta, _config?: Segment): void {
        const axis: Axis = axial.axis;
        switch (axis) {
            case Axis.X: axial.length = delta.x; break;
            case Axis.Y: axial.length = delta.y; break;
            case Axis.Z: axial.length = delta.z; break;
        }
        configure(axial, _config);
    }

    export function overlay(axial: Axial, source: Axial): void {
        const newLength: BlockScale = source.length | 0;
        const newCount: number = source.count | 0;
        const newInterval: BlockScale = source.interval | 0;
        const newBlocks: BlockScale = source.blocks | 0;

        axial.length = newLength;
        axial.count = newCount;
        axial.interval = newInterval;
        axial.blocks = newBlocks;
    }

    export function clone(axial: Axial, asAxis?: Axis): Axial {
        const axis: Axis = asAxis !== undefined ? asAxis : axial.axis;
        const axialClone: Axial = getDefault(axis);

        overlay(axialClone, axial);

        return axialClone;
    }
}

/**
 * ============================================================================
 * SECTION 7: ZoneSpace Configurations & Logic (ZoneSpaces Namespace)
 * ============================================================================
 */
namespace ZoneSpaces {

    export const BLOCK_LIMIT: BlockScale = 32768;

    export function toString(space: ZoneSpace, hidden?: boolean): string {
        const PublicStrings: string[] = [];
        PublicStrings.push("{");
        PublicStrings.push("  Id: " + space.Id);
        PublicStrings.push("  Origin: " + Coords.toString(space.Origin));
        PublicStrings.push("  Terminal: " + Coords.toString(space.Terminal));
        PublicStrings.push("  Zx: " + Axials.toString(space.Zx));
        PublicStrings.push("  Zy: " + Axials.toString(space.Zy));
        PublicStrings.push("  Zz: " + Axials.toString(space.Zz));
        PublicStrings.push("}");


        const HiddenStrings: string[] = [];
        HiddenStrings.push("{");
        HiddenStrings.push("  Initial Id: " + space._Id0)
        HiddenStrings.push("  Initial Origin: " + Coords.toString(space._Origin0));
        HiddenStrings.push("  Initial Terminal: " + Coords.toString(space._Terminal0));
        HiddenStrings.push("  Anchor: " + Coords.toString(space.Anchor));
        HiddenStrings.push("  SegX: " + Axials.segString(space.SegX));
        HiddenStrings.push("  SegY: " + Axials.segString(space.SegY));
        HiddenStrings.push("  SegZ: " + Axials.segString(space.SegZ));
        HiddenStrings.push("  Surface: " + SurfaceIds[space.Surface as number]);
        HiddenStrings.push("  Bound: " + BoundIds[space.Bound as number]);
        HiddenStrings.push("  Design: " + DesignIds[space.Design as number]);
        HiddenStrings.push("}");

        const SpaceStrings: string[] = hidden ? HiddenStrings : PublicStrings;

        return SpaceStrings.join("\n");
    }

    export function syncAxials(space: ZoneSpace): void {
        const delta: Delta = Coords.getDelta(space.Origin, space.Terminal);
        Axials.updateDelta(space.Zx, delta, space.SegX);
        Axials.updateDelta(space.Zy, delta, space.SegY);
        Axials.updateDelta(space.Zz, delta, space.SegZ);
    }

    export function applyVolumeLimit(space: ZoneSpace): void {
        const areaXZ = Math.max(Math.ceil(space.Zx.interval * space.Zz.interval), 1);
        const y_max_interval = (BLOCK_LIMIT / areaXZ) | 0;

        const limited_interval = Math.max(1, Math.min(y_max_interval, space.Zy.interval));
        const limited_blocks = (space.SegY.blocks !== undefined) ? Math.max(1, Math.min(limited_interval, space.SegY.blocks)) : undefined;

        space.SegY = {
            count: undefined,
            interval: limited_interval,
            blocks: limited_blocks
        };
        syncAxials(space);
    }

    export function calibrate(space: ZoneSpace, _state?: State, _config?: Configs): void {
        const state: State = _state !== undefined ? _state : DEFL_STATE;
        const config: Configs = _config ? _config : newConfigs();

        const Ids: States<Id | undefined> = {
            defl: space._Id0,
            current: space.Id || undefined,
            update: config.Id || undefined
        };
        const Origins: States<Origin | undefined> = {
            defl: space._Origin0,
            current: space.Origin || undefined,
            update: config.Origin || undefined
        };
        const Terminals: States<Terminal | undefined> = {
            defl: space._Terminal0,
            current: space.Terminal || undefined,
            update: config.Terminal || undefined
        };
        const Anchors: States<Anchor | undefined> = {
            defl: Coords.getDefault<Anchor>(CoordKind.Anchor),
            current: space.Anchor || undefined,
            update: config.Anchor || undefined
        };
        const SegXs: States<Segment | undefined> = {
            defl: newSegment(),
            current: space.SegX || undefined,
            update: config.SegX || undefined
        };
        const SegYs: States<Segment | undefined> = {
            defl: newSegment(),
            current: space.SegY || undefined,
            update: config.SegY || undefined
        };
        const SegZs: States<Segment | undefined> = {
            defl: newSegment(),
            current: space.SegZ || undefined,
            update: config.SegZ || undefined
        };
        const Surfaces: States<Surface | undefined> = {
            defl: DEFL_SURFACE as Surface,
            current: space.Surface !== undefined ? space.Surface : undefined,
            update: config.Surface !== undefined ? config.Surface : undefined
        };
        const Designs: States<Design | undefined> = {
            defl: DEFL_PATTERN as Design,
            current: space.Design !== undefined ? space.Design : undefined,
            update: config.Design !== undefined ? config.Design : undefined
        };
        const Bounds: States<Bound | undefined> = {
            defl: DEFL_BOUND as Bound,
            current: space.Bound !== undefined ? space.Bound : undefined,
            update: config.Bound !== undefined ? config.Bound : undefined
        };

        const coord0 = getState(Origins, state) || space._Origin0;
        const coord1 = getState(Terminals, state) || space._Terminal0;

        const origin: Origin = Coords.getOrigin(coord0, coord1);
        const terminal: Terminal = Coords.getTerminal(coord0, coord1);
        const anchor: Anchor = getState(Anchors, state);

        space.Origin = Coords.anchor(anchor, origin);
        space.Terminal = Coords.anchor(anchor, terminal);
        space.Anchor = anchor;

        space.Id = getState(Ids, state);
        space.SegX = getState(SegXs, state);
        space.SegY = getState(SegYs, state);
        space.SegZ = getState(SegZs, state);

        space.Surface = getState(Surfaces, state);
        space.Design = getState(Designs, state);
        space.Bound = getState(Bounds, state);

        // Resets the axials to match the current Origin and Terminal.
        syncAxials(space);
        // Applies the volume constraints (which also resyncs the axials afterwards).
        applyVolumeLimit(space);
    }

    export function setAnchor(space: ZoneSpace, _anchor?: Anchor): void {
        const anchor: Anchor = _anchor ? _anchor : space.Anchor;

        calibrate(space, State.Update, {
            Anchor: anchor
        });
    }

    export function setSurface(space: ZoneSpace, _surface?: Surface, _bound?: Bound): void {
        const surface: Surface = _surface !== undefined ? _surface : space.Surface;
        const bound: Bound = _bound !== undefined ? _bound : space.Bound;

        let offset: number = 0;
        switch (bound) {
            case Bound.Inner: offset = -1; break;
            case Bound.Exact: offset = 0; break;
            case Bound.Outer: offset = 1; break;
            default: offset = 0; break;
        }

        let ox: number = space._Origin0.x - offset;
        let oy: number = space._Origin0.y - offset;
        let oz: number = space._Origin0.z - offset;

        let tx: number = space._Terminal0.x + offset;
        let ty: number = space._Terminal0.y + offset;
        let tz: number = space._Terminal0.z + offset;

        switch (surface) {
            case Surface.Left: tx = ox; break;
            case Surface.Right: ox = tx; break;
            case Surface.Bottom: ty = oy; break;
            case Surface.Top: oy = ty; break;
            case Surface.Front: tz = oz; break;
            case Surface.Back: oz = tz; break;
            case Surface.Volume:
            default: break;
        }

        const id: Id = space._Id0 + SurfaceIds[surface as number];
        const origin: Origin = Coords.create<Origin>(ox, oy, oz, CoordKind.Origin);
        const terminal: Terminal = Coords.create<Terminal>(tx, ty, tz, CoordKind.Terminal);

        calibrate(space, State.Update, {
            Id: id,
            Origin: origin,
            Terminal: terminal,
            Surface: surface,
            Bound: bound
        });
    }

    export function setDesign(space: ZoneSpace, _design?: Design): void {
        const design: Design = _design !== undefined ? _design : space.Design;

        // Lookup plane safely
        const plane: Plane = (space.Surface !== undefined && SurfacePlane[space.Surface] !== undefined)
            ? SurfacePlane[space.Surface]
            : Plane.Xy;

        const abscissa: Axis = Abscissa[plane];
        const ordinate: Axis = Ordinate[plane];
        const applicate: Axis = Applicate[plane];

        const solidAnchor: Anchor = Coords.newAnchor();
        const gridAnchor: Anchor = Coords.gridAnchor(plane);

        const emptySegment: Segment = newSegment();
        const gridSegment: Segment = Axials.GridSegment;

        let pattern: Pattern;

        switch (design) {
            case Design.HorizontalLines: {
                pattern = newPattern(gridAnchor, emptySegment, gridSegment, emptySegment);
                break;
            }
            case Design.VerticalLines: {
                pattern = newPattern(gridAnchor, gridSegment, emptySegment, emptySegment);
                break;
            }
            case Design.Solid:
            default: {
                pattern = newPattern(solidAnchor, emptySegment, emptySegment, emptySegment);
                break;
            }
        }

        let segmentX: Segment = space.SegX;
        let segmentY: Segment = space.SegY;
        let segmentZ: Segment = space.SegZ;

        const setSegment = (axis: Axis, segment: Segment): void => {
            switch (axis) {
                case Axis.X: segmentX = segment; break;
                case Axis.Y: segmentY = segment; break;
                case Axis.Z: segmentZ = segment; break;
            }
        }
        setSegment(abscissa, pattern.abscissa);
        setSegment(ordinate, pattern.ordinate);
        setSegment(applicate, pattern.applicate);

        calibrate(space, State.Update, {
            Anchor: pattern.anchor,
            Design: design,
            SegX: segmentX,
            SegY: segmentY,
            SegZ: segmentZ
        });
    }
}

class SpaceZone implements ZoneSpace {
    private static SpaceCount: number = 0;
    private static newId(): Id {
        return DEFL_ID + SpaceZone.SpaceCount++;
    }
    public static create(pos0: Position, pos1: Position, _id?: string): SpaceZone {
        const id: string = _id ? _id : SpaceZone.newId();
        const coord0: Coord = Coords.fromPosition(pos0);
        const coord1: Coord = Coords.fromPosition(pos1);
        return new SpaceZone(id, coord0, coord1);
    }
    public readonly _Id0: Id;
    public readonly _Origin0: Origin;
    public readonly _Terminal0: Terminal;
    public readonly Zx: Axial;
    public readonly Zy: Axial;
    public readonly Zz: Axial;
    // Calibrated Properties
    public Id: Id;
    public Origin: Origin;
    public Terminal: Terminal;
    public SegX: Segment;
    public SegY: Segment;
    public SegZ: Segment;
    public Surface: Surface;
    public Design: Design;
    public Bound: Bound;
    public Anchor: Anchor;
    private constructor(id: Id, coord0: Coord, coord1: Coord) {
        this._Id0 = id;
        this._Origin0 = Coords.getOrigin(coord0, coord1);
        this._Terminal0 = Coords.getTerminal(coord0, coord1);
        this.Zx = Axials.getDefault(Axis.X);
        this.Zy = Axials.getDefault(Axis.Y);
        this.Zz = Axials.getDefault(Axis.Z);
        ZoneSpaces.calibrate(this, State.Defl);
    }
    public reset(): void {
        ZoneSpaces.calibrate(this, State.Defl);
    }
    public refresh(): void {
        ZoneSpaces.calibrate(this, State.Current);
    }
    public config(config?: Configs): void {
        ZoneSpaces.calibrate(this, State.Update, config);
    }
    public setAnchor(anchor?: Anchor): void {
        ZoneSpaces.setAnchor(this, anchor);
    }
    public setSurface(surface?: Surface, bound?: Bound): void {
        ZoneSpaces.setSurface(this, surface, bound);
    }
    public setDesign(design?: Design): void {
        ZoneSpaces.setDesign(this, design);
    }
    public toString(hidden?: boolean): string {
        return ZoneSpaces.toString(this, hidden);
    }
}


type ChunkScale = number;

function ExecuteCmd(cmd: string): void {
    player.execute(cmd);
}

const enum ChunkKind { Undeclared, Originus, Terminus, Span }
const CHUNKNAME: string[] = ["Undeclared", "Originus", "Terminus", "Span"];

type Chunk2D<K extends ChunkKind> = {
    readonly x: ChunkScale;
    readonly z: ChunkScale;
    readonly kind: K;
};

type Originus = Chunk2D<ChunkKind.Originus>;
type Terminus = Chunk2D<ChunkKind.Terminus>;
type Span = Chunk2D<ChunkKind.Span>;

type Chunk = Originus | Terminus | Span | Chunk2D<ChunkKind>;

type Sector = {
    Id: string;
    Originus: Originus;
    Span: Span;
};

interface SectorActive extends Sector {
    ActiveIdx: number;
    activate?(sectors: ActiveSector[]): void;
    deactivate?(): void;
    toString?(): string;
}

interface ZoneActive {
    ActiveSectors: ActiveSector[];
    SectorCount: number;
    Tile: Span;
    removeAll(): void;
    ensureActiveAround(x: BlockScale, z: BlockScale): void;
    toString?(): string;
}

const enum Adjacent { North, South, East, West }

namespace Chunks {
    export const enum Tile {
        Skinny, Tall, Long, Chunky, Broad, Flat, Squashed
    }

    export function create<C extends Chunk>(cx: ChunkScale, cz: ChunkScale, _kind?: ChunkKind): C {
        const kind = _kind !== undefined ? _kind : ChunkKind.Undeclared;
        return {
            x: (cx | 0) as ChunkScale,
            z: (cz | 0) as ChunkScale,
            kind: kind
        } as any as C;
    }

    export function getDefault<C extends Chunk>(_kind?: ChunkKind): C {
        return create(0, 0, _kind);
    }

    export function BlockToChunk(block_scale: BlockScale): ChunkScale {
        return (block_scale | 0) >> 4;
    }

    export function ChunkToBlock(chunk_scale: ChunkScale): BlockScale {
        return (chunk_scale | 0) << 4;
    }

    export function fromBlockScale(x: BlockScale, z: BlockScale): Originus {
        return create<Originus>(BlockToChunk(x), BlockToChunk(z), ChunkKind.Originus);
    }

    export function toCmdStr(chunk: Chunk): string {
        return `${ChunkToBlock(chunk.x)} 0 ${ChunkToBlock(chunk.z)}`;
    }

    export function toString(chunk: Chunk): string {
        return `${CHUNKNAME[chunk.kind]}: { x: ${chunk.x}, z: ${chunk.z} }`;
    }

    export const TILE: { [key: number]: Span } = {
        [Tile.Skinny]: create(3, 33, ChunkKind.Span),
        [Tile.Tall]: create(4, 25, ChunkKind.Span),
        [Tile.Long]: create(5, 20, ChunkKind.Span),
        [Tile.Chunky]: create(10, 10, ChunkKind.Span),
        [Tile.Broad]: create(20, 5, ChunkKind.Span),
        [Tile.Flat]: create(25, 4, ChunkKind.Span),
        [Tile.Squashed]: create(33, 3, ChunkKind.Span)
    };

    export const DEFAULT_TILE: Span = TILE[Tile.Chunky];

    export function getTile(ox: BlockScale, oz: BlockScale, tx: BlockScale, tz: BlockScale): Span {
        const origin_cX = BlockToChunk(ox | 0);
        const origin_cZ = BlockToChunk(oz | 0);
        const terminal_cX = BlockToChunk(tx | 0);
        const terminal_cZ = BlockToChunk(tz | 0);

        const reqZ = (terminal_cX - origin_cX + 1) | 0;
        let optimalFit = Tile.Skinny;

        if (reqZ < 33) {
            let tightestZ = 33;
            const options = [
                Tile.Skinny, Tile.Tall, Tile.Long, Tile.Chunky,
                Tile.Broad, Tile.Flat, Tile.Squashed
            ];

            for (let tileKey of options) {
                const tile = TILE[tileKey];
                if (((tile.z as number) >= reqZ) && ((tile.z as number) <= tightestZ)) {
                    tightestZ = tile.z as number;
                    optimalFit = tileKey;
                }
            }
        } else {
            optimalFit = Tile.Skinny;
        }

        return TILE[optimalFit];
    }
}

namespace Sectors {
    export function create(rx: number, rz: number, sx: number, sz: number, id: string): Sector {
        return {
            Id: id,
            Originus: Chunks.create(rx, rz, ChunkKind.Originus),
            Span: Chunks.create(sx, sz, ChunkKind.Span)
        };
    }

    export function getTerminal(sector: Sector): Originus {
        const tx = ((sector.Originus.x) + (sector.Span.x) - 1) | 0;
        const tz = ((sector.Originus.z) + (sector.Span.z) - 1) | 0;
        return Chunks.create(tx, tz, ChunkKind.Originus);
    }

    export function containsChunk(sector: Sector, chunk: Chunk): boolean {
        const dX = chunk.x - sector.Originus.x;
        const dZ = chunk.z - sector.Originus.z;
        return (dX >= 0 && dX < sector.Span.x) && (dZ >= 0 && dZ < sector.Span.z);
    }

    export function getAdjacentSector(sector: Sector, direction: Adjacent, newId: string): Sector {
        let cx = sector.Originus.x;
        let cz = sector.Originus.z;
        const sx = sector.Span.x;
        const sz = sector.Span.z;

        switch (direction) {
            case Adjacent.North: cz = (cz - sz); break;
            case Adjacent.South: cz = (cz + sz); break;
            case Adjacent.East: cx = (cx + sx); break;
            case Adjacent.West: cx = (cx - sx); break;
        }

        return create(cx, cz, sx, sz, newId);
    }

    export function toCmdStr(sector: Sector): string {
        return `${Chunks.toCmdStr(sector.Originus)} ${Chunks.toCmdStr(getTerminal(sector))}`;
    }

    export function toString(sector: Sector): string {
        return `Sector: { Id: "${sector.Id}", Originus: ${Chunks.toString(sector.Originus)}, Span: ${Chunks.toString(sector.Span)} }`;
    }

    export function activeSectorToString(sector: SectorActive): string {
        return `SectorActive: { Id: "${sector.Id}", ActiveIdx: ${sector.ActiveIdx}, Originus: ${Chunks.toString(sector.Originus)}, Span: ${Chunks.toString(sector.Span)} }`;
    }
}

class ActiveSector implements SectorActive {
    public static SectorCount: number = 0;

    public static NewId(): string {
        return "sector_" + ActiveSector.SectorCount++;
    }

    public Id: string;
    public Originus: Originus;
    public Span: Span;
    public ActiveIdx: number;

    constructor(originus: Originus, span: Span) {
        this.Id = ActiveSector.NewId();
        this.Originus = originus;
        this.Span = span;
        this.ActiveIdx = -1;
    }

    public activate(sectors: ActiveSector[]): void {
        const cmd = `tickingarea add ${Sectors.toCmdStr(this)} ${this.Id}`;
        ExecuteCmd(cmd);

        // Put this sector at the front of the active queue
        sectors.unshift(this);

        // Resolve indices and enforce the cap of 10 active sectors maximum
        for (let i = sectors.length - 1; i >= 0; i--) {
            const idx = i < 10 ? i : -1;
            sectors[i].ActiveIdx = idx | 0;

            if (sectors[i].ActiveIdx === -1) {
                sectors[i].deactivate();
                sectors.splice(i, 1);
            }
        }
    }

    public deactivate(): void {
        ExecuteCmd(`tickingarea remove ${this.Id}`);
        this.ActiveIdx = -1;
    }

    public toString(): string {
        return Sectors.activeSectorToString(this);
    }
}

namespace ZoneActives {
    export function removeAll(active: ZoneActive): void {
        for (let sector of active.ActiveSectors) {
            if (sector) {
                sector.deactivate();
            }
        }
        ExecuteCmd("tickingarea remove_all");
        active.ActiveSectors = [];
        active.SectorCount = 0;
    }

    export function ensureActiveAround(active: ZoneActive, x: BlockScale, z: BlockScale): void {
        const queryChunk = Chunks.fromBlockScale(x, z);
        ensureChunkIsActive(active, queryChunk);
    }

    export function ensureChunkIsActive(active: ZoneActive, chunk: Originus): void {
        for (let activeSector of active.ActiveSectors) {
            if (Sectors.containsChunk(activeSector, chunk)) return;
        }

        const dirs = [Adjacent.North, Adjacent.South, Adjacent.East, Adjacent.West];
        for (let activeSector of active.ActiveSectors) {
            for (let d of dirs) {
                const adj = Sectors.getAdjacentSector(activeSector, d, `temp_sector`);
                if (Sectors.containsChunk(adj, chunk)) {
                    activateSector(active, adj);
                    return;
                }
            }
        }

        // Failsafe condition: if the query chunk is completely disjointed from our 
        // existing contiguous web, we tear down all current sectors and start a new origin.
        removeAll(active);

        const span = active.Tile ? active.Tile : Chunks.DEFAULT_TILE;
        const sector = Sectors.create(chunk.x, chunk.z, span.x, span.z, `temp_sector`);
        activateSector(active, sector);
    }

    export function activateSector(active: ZoneActive, sector: Sector): void {
        if (findActiveIndex(active, sector.Originus, sector.Span) >= 0) return;

        const activeSector = indexSector(active, sector.Originus, sector.Span);
        activeSector.activate(active.ActiveSectors);
    }

    export function indexSector(active: ZoneActive, root: Originus, span: Span): ActiveSector {
        return new ActiveSector(root, span);
    }

    export function findActiveIndex(active: ZoneActive, root: Originus, span: Span): number {
        for (let s of active.ActiveSectors) {
            if (s.Originus.x === root.x && s.Originus.z === root.z && s.Span.x === span.x && s.Span.z === span.z) {
                return s.ActiveIdx;
            }
        }
        return -1;
    }

    export function toString(active: ZoneActive): string {
        const tileStr = active.Tile ? Chunks.toString(active.Tile) : "undefined";
        const ActiveStrings: string[] = [];
        ActiveStrings.push("{")
        ActiveStrings.push("Tile: " + Chunks.toString(active.Tile) + ",")
        ActiveStrings.push("SectorCount: " + active.SectorCount + ",")
        ActiveStrings.push("ActiveSectors: [")
        for (let sector of active.ActiveSectors) {
            ActiveStrings.push("  " + sector.toString() + ",")
        }
        ActiveStrings.push("  ]");
        return ActiveStrings.join("\n")
    }
}

class ActiveZone implements ZoneActive {
    public static create(space: ZoneSpace): ActiveZone {
        const ox: BlockScale = space.Origin.x;
        const oz: BlockScale = space.Origin.z;
        const tx: BlockScale = space.Terminal.x;
        const tz: BlockScale = space.Terminal.z;

        const tile = Chunks.getTile(ox, oz, tx, tz);
        return new ActiveZone(tile);
    }

    public ActiveSectors: ActiveSector[] = [];
    public Tile: Span;

    public get SectorCount(): number {
        return ActiveSector.SectorCount;
    }

    public set SectorCount(val: number) {
        ActiveSector.SectorCount = val;
    }

    private constructor(tile?: Span) {
        this.Tile = tile ? tile : Chunks.DEFAULT_TILE;
    }

    public removeAll(): void {
        ZoneActives.removeAll(this);
    }

    public ensureActiveAround(x: BlockScale, z: BlockScale): void {
        ZoneActives.ensureActiveAround(this, x, z);
    }

    public toString(): string {
        return ZoneActives.toString(this);
    }
}

interface ZoneRuntime {
    readonly Id: string;
    readonly LastZoneIndex: number;
    readonly StartTime: number;
    readonly CurrentZoneIndex: number;
    InProgress: boolean;
    getElapsedTime(): number;
    getCurrentRate(): number;
    getNextSubZoneID(): string;
    reportUpdate(): void;
    reportSummary(): void;
}
function CurrentGameTime(): number {
    return gameplay.timeQuery(GAME_TIME);
}
namespace Runtimes {
    export function toString(runtime: ZoneRuntime): string {
        const InfoStrings: string[] = [];
        InfoStrings.push("{");
        InfoStrings.push("Id: \"" + runtime.Id + "\",");
        InfoStrings.push("StartTime: " + runtime.StartTime + ",");
        InfoStrings.push("CurrentZoneIndex: " + runtime.CurrentZoneIndex + ",");
        InfoStrings.push("LastZoneIndex: " + runtime.LastZoneIndex + ",");
        InfoStrings.push("InProgress: " + runtime.InProgress + ",");
        InfoStrings.push("ElapsedTime: " + runtime.getElapsedTime() + ",");
        InfoStrings.push("CurrentRate: " + runtime.getCurrentRate() + ",");
        InfoStrings.push("}");
        return InfoStrings.join("\n");
    }

    const PROGRESS_BAR: string[] = [
        `[____________________]`,
        `[■___________________]`,
        `[■■__________________]`,
        `[■■■_________________]`,
        `[■■■■________________]`,
        `[■■■■■_______________]`,
        `[■■■■■■______________]`,
        `[■■■■■■■_____________]`,
        `[■■■■■■■■____________]`,
        `[■■■■■■■■■___________]`,
        `[■■■■■■■■■■__________]`,
        `[■■■■■■■■■■■_________]`,
        `[■■■■■■■■■■■■________]`,
        `[■■■■■■■■■■■■■_______]`,
        `[■■■■■■■■■■■■■■______]`,
        `[■■■■■■■■■■■■■■■_____]`,
        `[■■■■■■■■■■■■■■■■____]`,
        `[■■■■■■■■■■■■■■■■■___]`,
        `[■■■■■■■■■■■■■■■■■■__]`,
        `[■■■■■■■■■■■■■■■■■■■_]`,
        `[■■■■■■■■■■■■■■■■■■■■]`
    ];

    export function ticksToString(ticks: number): string {
        const total_seconds = (ticks * 0.05) | 0;
        const mins = (total_seconds / 60) | 0;
        const secs = (total_seconds % 60) | 0;
        return `${mins}m${secs < 10 ? "0" : ""}${secs}s`;
    }

    export function ReportSummary(runtime: ZoneRuntime): void {
        const elapsed = runtime.getElapsedTime();
        const count = runtime.LastZoneIndex;
        const rate = ((50 * runtime.getCurrentRate()) | 0) / 1000;

        const subzonesPerSecond = (10 * count / Math.max(elapsed * 0.05, 1) | 0) / 10;

        const NAME_STR = `MinecraftZoneHandler ${runtime.Id} Complete`;
        const TIME_STR = `${count} subzones in ${ticksToString(elapsed)}`;
        const TIMERATE_STR = `${rate} seconds per subzone`;
        const ZONERATE_STR = `${subzonesPerSecond} subzones per second`

        ExecuteCmd(`tell @s ${NAME_STR}\n${TIME_STR}\n${TIMERATE_STR}\n${ZONERATE_STR}`);
    }

    // HIGHLY OPTIMIZED HOT PATH: Fully inlined, utilizing zero-overhead property lookups
    export function ReportUpdate(runtime: ZoneRuntime): void {
        const currentIdx = runtime.CurrentZoneIndex;
        const lastIdx = runtime.LastZoneIndex;
        const rate = runtime.getCurrentRate();

        const percent = lastIdx > 0 ? ((100 * currentIdx / lastIdx) | 0) : 0;
        const barIdx = (percent / 5) | 0;

        const etaTicks = ((lastIdx - currentIdx) * rate) | 0;
        const total_seconds = (etaTicks * 0.05) | 0;
        const mins = (total_seconds / 60) | 0;
        const secs = (total_seconds % 60) | 0;

        // Assembly of raw titleraw command string via quick, static operations
        const cmd_str = "titleraw @s actionbar {\"rawtext\":[{\"text\":\"§7" +
            runtime.Id + "§r | §e" +
            PROGRESS_BAR[barIdx] + "§r | §e" +
            percent + "%§r | §7Eta: " +
            mins + "m" + (secs < 10 ? "0" : "") + secs + "s§r\"}]}";

        ExecuteCmd(cmd_str);
    }
}

class RuntimeZone implements ZoneRuntime {
    public static InProgress: boolean = false;
    public readonly Id: string;
    public readonly LastZoneIndex: number;
    protected _CurrentZoneIndex: number = -1;
    protected _StartTime: number = -1;

    public get CurrentZoneIndex(): number { return this._CurrentZoneIndex };
    public get StartTime(): number { return this._StartTime };

    public get InProgress(): boolean { return (this._StartTime > -1) };
    public set InProgress(bool: boolean) {
        if (bool) {
            this._StartTime = CurrentGameTime();
            this._CurrentZoneIndex = 0;
        } else {
            this._StartTime = -1;
            this._CurrentZoneIndex = -1;
        }
    };

    public getElapsedTime(): number {
        if (!this.InProgress) return -1;
        return (CurrentGameTime() - this.StartTime);
    }
    public getCurrentRate(): number {
        if (!this.InProgress) return -1;
        return ((1000 * this.getElapsedTime() / Math.max(this._CurrentZoneIndex + 1, 1)) | 0) / 1000;
    }

    public getNextSubZoneID(): string {
        const idx: number = this._CurrentZoneIndex++;
        return `${this.Id}_sub${idx}`;
    }
    public toString(): string {
        return Runtimes.toString(this);
    }

    public reportUpdate(): void { Runtimes.ReportUpdate(this) };

    public reportSummary(): void { Runtimes.ReportSummary(this) };

    private constructor(id: string, lastIndex: number) {
        this.Id = id;
        this.LastZoneIndex = lastIndex;
        this.InProgress = false;
    }
    public static create(space: SpaceZone): RuntimeZone {
        const lastIndex = (space.Zx.count * space.Zy.count * space.Zz.count) | 0;
        return new RuntimeZone(space.Id, lastIndex);
    }
}

function MinecraftZoneHandler(space: SpaceZone, active: ActiveZone, runtime: RuntimeZone, handler: (name: string, origin: Position, terminal: Position) => void): void {
    const ReportInterval: number = 4;
    const PauseInterval: number = 100;

    if (runtime.InProgress) return;
    runtime.InProgress = false;

    const space_x: number = space.Origin.x | 0;
    const space_y: number = space.Origin.y | 0;
    const space_z: number = space.Origin.z | 0;

    const x_count: number = space.Zx.count | 0;
    const y_count: number = space.Zy.count | 0;
    const z_count: number = space.Zz.count | 0;

    const x_interval: number = space.Zx.interval | 0;
    const y_interval: number = space.Zy.interval | 0;
    const z_interval: number = space.Zz.interval | 0;

    const net_x_blocks: number = ((space.Zx.blocks || 1) - 1) | 0;
    const net_y_blocks: number = ((space.Zy.blocks || 1) - 1) | 0;
    const net_z_blocks: number = ((space.Zz.blocks || 1) - 1) | 0;

    active.removeAll();
    runtime.InProgress = true;
    let PauseCounter = 0;
    let ReportCounter = 0;

    for (let x_index = 0; x_index < x_count; x_index++) {
        const origin_x = space_x + (x_index * x_interval);
        const terminal_x = origin_x + net_x_blocks;

        const move_left_to_right = ((x_index & 1) === 0);
        for (let z_index = 0; z_index < z_count; z_index++) {
            const z_multiplier = move_left_to_right ? z_index : (z_count - 1 - z_index);

            const origin_z = space_z + (z_multiplier * z_interval);
            const terminal_z = origin_z + net_z_blocks;

            active.ensureActiveAround(origin_x, origin_z);
            active.ensureActiveAround(terminal_x, terminal_z);

            for (let y_index = 0; y_index < y_count; y_index++) {
                const origin_y = space_y + (y_index * y_interval);
                const terminal_y = origin_y + net_y_blocks;

                const name: string = runtime.getNextSubZoneID();
                const origin: Position = world(origin_x, origin_y, origin_z);
                const terminal: Position = world(terminal_x, terminal_y, terminal_z);

                handler(name, origin, terminal);
                if (ReportCounter > ReportInterval) { runtime.reportUpdate(); ReportCounter = 0; }

                PauseCounter++
                ReportCounter++
            }
            if (PauseCounter > PauseInterval) { loops.pause(1); PauseCounter = 0; }
        }
    }
    runtime.reportSummary();
    active.removeAll();
    runtime.InProgress = false;
}




//% weight=500 icon="\uf0ac"
//% groups=[Zone, Space, Active, Runtime]
//% color=#201E57
namespace Zones {
    /**
     * Constructs a 3D block coordinate for a custom Minecraft voxel space layout.
     * @param x The X-coordinate scale position.
     * @param y The Y-coordinate scale position.
     * @param z The Z-coordinate scale position.
     */
    //% block="$x|$y|$z" blockId=minecraftSpacePosition
    //% blockHidden=true
    //% color=#39359C
    export function SpacePosition(x: number, y: number, z: number): Position {
        return world(x, y, z)
    }

    /**
     * Executes a callback loop over multiple partitioned sub-zones within a SpaceZone.
     * Automatically registers active chunk ticking areas to guarantee safe block updates.
     * @param space The defined SpaceZone representing the overall region boundaries.
     * @param handler Code to execute for each sequential sub-zone, providing its unique identifier, origin, and terminal positions.
     */
    //% block
    //% space.shadow=variables_get space.defl="space"
    //% handlerStatement
    //% draggableParameters="reporter, reporter, reporter"
    export function MinecraftZone(space: SpaceZone, handler: (name: string, origin: Position, terminal: Position) => void): void {
        const active = ActiveZone.create(space);
        const runtime = RuntimeZone.create(space);
        MinecraftZoneHandler(space, active, runtime, handler);
    }

    /**
     * Restructures a SpaceZone to focus on a single surface plane rather than the Default 3D volume.
     * Optionally adjusts bounding margins and applies repeating block patterns (such as grids or dots).
     * @param space The SpaceZone instance to configure.
     * @param face The target 3D surface plane (e.g. Default, Left, Right, Top, Front, etc.).
     * @param newPattern The decorative block distribution newPattern (e.g. Solid, Lines, Dots).
     * @param bound Adjusts the boundary margin relative to the coordinate limits (Inner, Exact, Outer).
     */
    //% block
    //% space.shadow=variables_get space.defl="space"
    //% inlineInputMode=inline
    //% group="Space"
    //% color=#131235
    export function ChooseFace(space: SpaceZone, face: Surface, newPattern: Design, bound?: Bound): void {
        space.setSurface(face, bound);
        space.setDesign(newPattern);
    }

    /**
     * Formats the structural details of a SpaceZone as a readable string log for debugging.
     * Prints current origin, terminal, anchor, and axial subdivisions.
     * @param space The SpaceZone to inspect.
     */
    //% block="$space|to string||:show hidden?|$hidden"
    //% space.shadow=variables_get space.defl="space"
    //% group="Space"
    //% color=#131235
    export function SpaceToString(space: SpaceZone, hidden?: boolean): string {
        return space.toString(hidden);
    }

    /**
     * Defines a new SpaceZone bounded between two corner coordinates, optionally assigning a unique tracking ID.
     * @param pos0 The starting coordinate of the diagonal boundary.
     * @param pos1 The ending coordinate of the diagonal boundary.
     * @param _id An optional text identifier to distinguish this space's reports.
     */
    //% block="$pos0=minecraftSpacePosition|$pos1=minecraftSpacePosition||id:$_id"
    //% blockId=minecraftCreateSpace
    //% blockSetVariable="space"
    //% group="Space"
    //% color=#131235
    export function space(pos0: Position, pos1: Position, _id?: string): SpaceZone {
        return SpaceZone.create(pos0, pos1, _id);
    }
}


// CartesianPair is a number[], but only the first two values will every be looked at.
type Cartesian = { abscissa: number; ordinate: number, applicate: number }
type CartesianPair = number[]
//% weight=495 icon="\uf279"
namespace Cartesians {
    function abstraction(x: number, y: number, z?: number): Cartesian {
        const abscissa: number = (x || 0) | 0;
        const ordinate: number = (y || 0) | 0;
        const applicate: number = (z || 0) | 0;
        return { abscissa, ordinate, applicate }
    }
    export function fromPair(pair: CartesianPair, applicate?: number): Cartesian {
        const abscissa = (pair[0] || 0) | 0;
        const terminal = (pair[1] || 0) | 0;
        return abstraction(abscissa, terminal, applicate);
    }
    //% block="series|x:|$abscissa|y:|$ordinate"
    //% blockSetVariable="series"
    export function series(abscissa: number, ordinate: number): CartesianPair[] {
        const firstPair: CartesianPair = [abscissa | 0, ordinate | 0]
        return [firstPair];
    }
    //% block="add|x:|$abscissa|y:|$ordinate|to|$series"
    //% series.shadow=variables_get series.defl="series"
    export function addPair(series: CartesianPair[], abscissa: number, ordinate: number): void {
        series.push([abscissa | 0, ordinate | 0]);
    }

    /**
     * Resolves an abstract Cartesian 2D coordinate pair (abscissa, ordinate) placed
     * at a depth (applicate) onto a flat plane on a target 3D Surface.
     * * Abstract Model Projection:
     * - Left/Right Surface: Lock X (depth). Map abstract plane horizontal to Z, vertical to Y.
     * - Bottom/Top Surface: Lock Y (depth). Map abstract plane horizontal to X, vertical to Z.
     * - Front/Back/Default Surface: Lock Z (depth). Map abstract plane horizontal to X, vertical to Y.
     */
    function toPosition(carte: Cartesian, surface?: Surface): Position {
        const { abscissa: u, ordinate: v, applicate: w } = carte;

        switch (surface) {
            case Surface.Left:
            case Surface.Right:
                // fixed X (depth = w), horizontal abstract is Z (u), vertical abstract is Y (v)
                return world(w, v, u);

            case Surface.Bottom:
            case Surface.Top:
                // fixed Y (depth = w), horizontal abstract is X (u), vertical abstract is Z (v)
                return world(u, w, v);

            case Surface.Front:
            case Surface.Back:
            case Surface.Volume:
            default:
                // fixed Z (depth = w), horizontal abstract is X (u), vertical abstract is Y (v)
                return world(u, v, w);
        }
    }

    //% block="$space" blockId=minecraftSpaceApplicate
    //% space.shadow=variables_get space.defl="space"
    //% blockHidden=true
    export function getSpaceApplicate(space: SpaceZone, _surface?: Surface, _bound?: Bound): number {
        const surface: Surface = _surface || space.Surface;
        const bound: Bound = _bound || (Bound.Inner as Bound);

        let offset: number = 0;
        switch (bound) {
            case Bound.Inner: offset = -1; break;
            case Bound.Exact: offset = 0; break;
            case Bound.Outer: offset = 1; break;
            default: offset = 0; break;
        }
        const oy = space.Origin.y - offset;
        const ox = space.Origin.x - offset;
        const oz = space.Origin.z - offset;
        const tx = space.Terminal.x + offset;
        const ty = space.Terminal.y + offset;
        const tz = space.Terminal.z + offset;

        switch (surface) {
            case Surface.Left: return ox;
            case Surface.Right: return tx;
            case Surface.Bottom: return oy;
            case Surface.Top: return ty;
            case Surface.Front: return oz;
            case Surface.Back: return tz;
            case Surface.Volume:
            default: return oy;
        }
    }

    //% block="draw|$series|within|$applicate|$block||on|$surface|surface"
    //% series.shadow=variables_get series.defl="series"
    //% applicate.shadow=minecraftSpaceApplicate
    //% block.shadow=minecraftBlock
    //% inlineInputMode=inline
    export function draw(series: CartesianPair[], applicate: number, block: number, surface?: Surface, closed?: boolean): void {
        const series_length = series.length;
        const last_index = series_length - 1

        for (let o = 0; o < series_length; o++) {
            let t: number = o + 1;
            if (t > last_index) {
                if (closed) { t = 0 } else { return };
            }
            const o_carte: Cartesian = fromPair(series[o], applicate);
            const t_carte: Cartesian = fromPair(series[t], applicate);

            // Minecraft MakeCode function.
            shapes.line(block, toPosition(o_carte, surface), toPosition(t_carte, surface))
        }

    }
}
