import GametickQuery = gameplay.timeQuery
import ExecuteCmd = player.execute;
type JSONstr = string;
type CmdStr = string;
//
//
//
type BlockScale = number;
namespace BlockScale {
    export const enum CoordKind { Raw, Origin, Terminal, Anchor, Delta };
    export const CoordName = ["Raw", "Origin", "Terminal", "Anchor", "Delta"];
    export const enum CoordAxis { X, Y, Z };
    export type BlockUnit<K extends CoordKind, A extends CoordAxis> = BlockScale & {
        readonly _Kind: K;
        readonly _Axis: A;
    };
    export type X<K extends CoordKind> = BlockUnit<K, CoordAxis.X>;
    export type Y<K extends CoordKind> = BlockUnit<K, CoordAxis.Y>;
    export type Z<K extends CoordKind> = BlockUnit<K, CoordAxis.Z>;

    export interface CoordConfig { }
    export type Coord<K extends CoordKind> = {
        kind: K;
        x: X<K>;
        y: Y<K>;
        z: Z<K>;
        config: CoordConfig;
    };
    export interface SegmentConfig {
        count?: number;
        interval?: BlockScale;
        blocks?: BlockScale;
    };
    export type Axial<A extends CoordAxis> = {
        axis: A;
        length: BlockScale;
        count: number;
        interval: BlockScale;
        blocks: BlockScale;
        config: SegmentConfig;
    };


    const enum SpaceX { Left, Right };
    const enum SpaceY { Bottom, Top };
    const enum SpaceZ { Front, Back };
    export const enum Face { Left, Right, Bottom, Top, Front, Back };
    export const enum Pattern { Solid, Abscissa, Ordinate };

    interface SpaceCorner {
        space_x: SpaceX;
        space_y: SpaceY;
        space_z: SpaceZ;
    };
    interface SurfaceInfo {
        name: string;
        abscissa_axis: CoordAxis;
        ordinate_axis: CoordAxis;
        origin_corner: SpaceCorner;
        terminal_corner: SpaceCorner;
        anchor_config: Coord.AnchorConfig;
    };
    export interface SpaceConfig {
        Name?: string;
    };
    namespace Coord {
        type Rx = X<CoordKind.Raw>; type Ry = Y<CoordKind.Raw>; type Rz = Z<CoordKind.Raw>;
        export type Raw = Coord<CoordKind.Raw> & {
            kind: CoordKind.Raw;
            x: Rx;
            y: Ry;
            z: Rz;
        };
        type Ox = X<CoordKind.Origin>; type Oy = Y<CoordKind.Origin>; type Oz = Z<CoordKind.Origin>;
        export interface Origin extends Coord<CoordKind.Origin> {
            kind: CoordKind.Origin;
            x: Ox;
            y: Oy;
            z: Oz;
        };
        type Tx = X<CoordKind.Terminal>; type Ty = Y<CoordKind.Terminal>; type Tz = Z<CoordKind.Terminal>;
        export interface Terminal extends Coord<CoordKind.Terminal> {
            readonly kind: CoordKind.Terminal;
            readonly x: Tx;
            readonly y: Ty;
            readonly z: Tz;
        };
        export interface AnchorConfig extends CoordConfig {
            xa?: BlockScale;
            ya?: BlockScale;
            za?: BlockScale;
        };
        type Ax = X<CoordKind.Anchor>; type Ay = Y<CoordKind.Anchor>; type Az = Z<CoordKind.Anchor>;
        export type Anchor = Coord<CoordKind.Anchor> & {
            kind: CoordKind.Anchor;
            x: Ax;
            y: Ay;
            z: Az;
            config: AnchorConfig;
        };
        type Dx = X<CoordKind.Delta>; type Dy = Y<CoordKind.Delta>; type Dz = Z<CoordKind.Delta>;
        export type Delta = Coord<CoordKind.Delta> & {
            readonly kind: CoordKind.Delta;
            readonly x: Dx;
            readonly y: Dy;
            readonly z: Dz;
        };


        export const isRaw = (c: Coord<any>): c is Raw => c.kind === CoordKind.Raw;
        export const isOrigin = (c: Coord<any>): c is Origin => c.kind === CoordKind.Origin;
        export const isTerminal = (c: Coord<any>): c is Terminal => c.kind === CoordKind.Terminal;
        export const isAnchor = (c: Coord<any>): c is Anchor => c.kind === CoordKind.Anchor;
        export const isDelta = (c: Coord<any>): c is Delta => c.kind === CoordKind.Delta;
        export function create<K extends CoordKind>(kind: K, x: number, y: number, z: number, _config?: CoordConfig): Coord<K> {
            return {
                kind: kind,
                x: (x | 0) as X<K>,
                y: (y | 0) as Y<K>,
                z: (z | 0) as Z<K>,
                config: _config || {}
            } as Coord<K>;
        };
        export function clone<K extends CoordKind>(coord: Coord<K>): Coord<K> {
            const kind: K = coord.kind as K;
            const x: number = coord.x as number;
            const y: number = coord.y as number;
            const z: number = coord.z as number;
            const config: CoordConfig = coord.config || {};
            return create(kind, x, y, z, config) as Coord<K>;
        }
        export function toCmdStr<K extends CoordKind>(coord: Coord<K>): string {
            return `${coord.x} ${coord.y} ${coord.z}`;
        };
        export function toString<K extends CoordKind>(coord: Coord<K>): string {
            const kindName = CoordName[coord.kind as number] || "Unknown";
            return `{ kind: ${kindName}, x: ${coord.x}, y: ${coord.y}, z: ${coord.z} }`;
        };
        export namespace Raw {
            export const create = (x: number, y: number, z: number) => Coord.create(CoordKind.Raw, x, y, z) as Raw;
            export function fromPosition(_pos: Position): Raw {
                const world_pos = _pos.toWorld();
                const rx: BlockScale = world_pos.getValue(Axis.X);
                const ry: BlockScale = world_pos.getValue(Axis.Y);
                const rz: BlockScale = world_pos.getValue(Axis.Z);
                return create(rx, ry, rz) as Raw;
            };
        }
        export namespace Origin {
            const create = (x: number, y: number, z: number) => Coord.create(CoordKind.Origin, x, y, z) as Origin;
            export function getOrigin<O extends CoordKind, T extends CoordKind>(coord0: Coord<O>, coord1: Coord<T>): Origin {
                const ox = Math.min(coord0.x, coord1.x) | 0;
                const oy = Math.min(coord0.y, coord1.y) | 0;
                const oz = Math.min(coord0.z, coord1.z) | 0;
                return create(ox, oy, oz);
            };
        }
        export namespace Terminal {
            const create = (x: number, y: number, z: number) => Coord.create(CoordKind.Terminal, x, y, z) as Terminal;
            export function getTerminal<O extends CoordKind, T extends CoordKind>(coord0: Coord<O>, coord1: Coord<T>): Terminal {
                const tx = Math.max(coord0.x, coord1.x) | 0;
                const ty = Math.max(coord0.y, coord1.y) | 0;
                const tz = Math.max(coord0.z, coord1.z) | 0;
                return create(tx, ty, tz);
            };
        }
        export namespace Anchor {
            const create = (x: number, y: number, z: number, config: AnchorConfig): Anchor => Coord.create(CoordKind.Anchor, x, y, z) as Anchor;
            export function fromCoord<K extends CoordKind>(coord: Coord<K>, _config?: AnchorConfig): Anchor {
                const config: AnchorConfig = _config ? _config : {};
                const use_ceiling = Coord.isTerminal(coord);
                const anchorCalc = (scalar: number, anchor_at: number): number => {
                    return use_ceiling
                        ? Math.ceil(scalar / anchor_at) * anchor_at
                        : Math.floor(scalar / anchor_at) * anchor_at;
                };

                let _x: number = coord.x | 0;
                let _y: number = coord.y | 0;
                let _z: number = coord.z | 0;

                if (config.xa) _x = anchorCalc(_x, config.xa) | 0;
                if (config.ya) _y = anchorCalc(_y, config.ya) | 0;
                if (config.za) _z = anchorCalc(_z, config.za) | 0;

                const kind: CoordKind = CoordKind.Anchor
                const x: Ax = _x as Ax;
                const y: Ay = _y as Ay;
                const z: Az = _z as Az;

                return create(x, y, z, config) as Anchor;
            };
        }
        export namespace Delta {
            const create = (x: number, y: number, z: number): Delta => Coord.create(CoordKind.Delta, x, y, z) as Delta;
            export function fromCoords<O extends CoordKind, T extends CoordKind>(coord0: Coord<O>, coord1: Coord<T>): Delta {
                const dx = (Math.abs(coord1.x - coord0.x) + 1) | 0;
                const dy = (Math.abs(coord1.y - coord0.y) + 1) | 0;
                const dz = (Math.abs(coord1.z - coord0.z) + 1) | 0;
                return create(dx, dy, dz) as Delta;
            };
        }
    }
    namespace Axial {
        const INTERVAL_LIMIT = 64;
        export const GRID_CONFIGURATION: SegmentConfig = { interval: 10, blocks: 1 };
        export type Zx = Axial<CoordAxis.X>;
        export type Zy = Axial<CoordAxis.Y>;
        export type Zz = Axial<CoordAxis.Z>;
        /**
         * Configures an existing _Axis object in-place.
         */
        export function configure<A extends CoordAxis>(axial: Axial<A>, _config?: SegmentConfig): void {
            const length: BlockScale = axial.length | 1;
            // Base calculation
            let count: number = Math.ceil(length / INTERVAL_LIMIT);
            let interval: BlockScale = Math.ceil(length / count);
            let blocks: BlockScale = interval;

            const config: SegmentConfig = _config ? _config : axial.config;

            const config_count = config.count;
            const config_interval = config.interval;
            const config_blocks = config.blocks;

            if (config_count !== undefined) {
                count = Math.max(count, config_count);
                interval = Math.ceil(length / count);
                blocks = interval;
            };
            if (config_interval !== undefined) {
                interval = Math.max(1, Math.min(INTERVAL_LIMIT, config_interval));
                count = Math.ceil(length / interval);
                blocks = interval;
            };
            if (config_blocks !== undefined) {
                blocks = Math.max(1, Math.min(interval, config_blocks));
            };

            // Apply mutation
            axial.count = count | 0;
            axial.interval = interval | 0;
            axial.blocks = blocks | 0;
            axial.config = config;
        };

        /**
         * Factory function for creating a new _Axis object.
         * Uses configure() internally to initialize values.
         */
        export function create<A extends CoordAxis>(axis: A, delta: Delta, _config?: SegmentConfig): Axial<A> {
            let axial: Axial<A> = { axis: axis, length: -1, count: 1, interval: 1, blocks: 1, config: {} };
            switch (axis) {
                case CoordAxis.X: axial.length = delta.x; break;
                case CoordAxis.Y: axial.length = delta.y; break;
                case CoordAxis.Z: axial.length = delta.z; break;
                default: axial.length = 0;
            };
            configure(axial, _config);
            return axial;
        };

        export function clone<A extends CoordAxis>(axial: Axial<A>): Axial<A> {
            const axis: CoordAxis = axial.axis;
            const length: BlockScale = axial.length | 0;
            const count: number = axial.count | 0;
            const interval: BlockScale = axial.interval | 0;
            const blocks: BlockScale = axial.blocks | 0;
            return { axis, length, count, interval, blocks } as Axial<A>;
        };

        export function toString<A extends CoordAxis>(axial: Axial<A>): string {
            return `{ axis: ${axial.axis}, length: ${axial.length}, count: ${axial.count}, interval: ${axial.interval}, blocks: ${axial.blocks} }`;
        };

        export namespace Zx {
            export function create(delta: Delta, _config?: SegmentConfig): Zx {
                return Axial.create(CoordAxis.X, delta, _config);
            };
        }
        export namespace Zy {
            export function create(delta: Delta, _config?: SegmentConfig): Zy {
                return Axial.create(CoordAxis.Y, delta, _config);
            };
        }
        export namespace Zz {
            export function create(delta: Delta, _config?: SegmentConfig): Zz {
                return Axial.create(CoordAxis.Z, delta, _config);
            };
        }
    }
    import Raw = Coord.Raw;
    import Origin = Coord.Origin;
    import Terminal = Coord.Terminal;
    import Delta = Coord.Delta;
    import Anchor = Coord.Anchor;
    import AnchorConfig = Coord.AnchorConfig;
    import Zx = Axial.Zx;
    import Zy = Axial.Zy;
    import Zz = Axial.Zz;
    export interface Space {
        Name: string;
        Origin: Origin;
        Terminal: Terminal;
        Anchor: Anchor;
        Delta: Delta;
        Zx: Zx;
        Zy: Zy;
        Zz: Zz;
    };
    namespace Space {
        const VOLUME_LIMIT: number = 32768;
        function applyVolumeLimit(space: Space): void {
            const area = (space.Zx.interval * space.Zz.interval) | 0;
            const y_max = (VOLUME_LIMIT / (area > 0 ? area : 1)) | 0;
            const y_interval = space.Zy.interval | 0;
            const y_bounded = y_max < y_interval ? y_max : y_interval;
            const interval = y_bounded > 0 ? y_bounded : 1;
            Axial.configure(space.Zy, { interval });
        };
        function getCorner(space: Space, corner: SpaceCorner, outside?: boolean): Raw {
            const offset: number = outside ? 1 : 0;
            const x: number = (corner.space_x === SpaceX.Left) ? space.Origin.x - offset : space.Terminal.x + offset;
            const y: number = (corner.space_y === SpaceY.Bottom) ? space.Origin.y - offset : space.Terminal.y + offset;
            const z: number = (corner.space_z === SpaceZ.Front) ? space.Origin.z - offset : space.Terminal.z + offset;
            return Raw.create(x, y, z);
        };
        export function clone(space: Space): Space {
            const Name: string = `${space.Name}_clone`
            const Origin: Origin = Coord.clone(space.Origin);
            const Terminal: Terminal = Coord.clone(space.Terminal);
            const Delta: Delta = Coord.clone(space.Delta);
            const Anchor: Anchor = Coord.clone(space.Anchor);
            const Zx: Zx = Axial.clone(space.Zx);
            const Zy: Zy = Axial.clone(space.Zy);
            const Zz: Zz = Axial.clone(space.Zz);
            return { Name, Origin, Terminal, Anchor, Delta, Zx, Zy, Zz } as Space;
        };
        export function getCalibrated(raw_space: Space, anchor_config?: AnchorConfig): Space {
            const calibrated = Space.fromCoords(raw_space.Origin, raw_space.Terminal);
            calibrated.Anchor = Anchor.fromCoord(calibrated.Origin, anchor_config);
            applyVolumeLimit(calibrated)
            return calibrated as Space;
        };
        export function configureZoneAxial(space: Space, axis: CoordAxis, config?: SegmentConfig): void {
            let axial: Axial<typeof axis>;
            switch (axis) {
                case CoordAxis.X: axial = space.Zx; break;
                case CoordAxis.Y: axial = space.Zy; break;
                case CoordAxis.Z: axial = space.Zz; break;
                default: return;
            };
            if (axial === null) return;

            Axial.configure(axial, config);
            applyVolumeLimit(space);
        };
        export function fromCoords<O extends CoordKind, T extends CoordKind>(coord0: Coord<O>, coord1: Coord<T>, config?: SpaceConfig): Space {
            const origin: Origin = Origin.getOrigin(coord0, coord1);
            const terminal: Terminal = Terminal.getTerminal(coord0, coord1);
            const delta: Delta = Delta.fromCoords(origin, terminal);
            const anchor: Anchor = Anchor.fromCoord(origin);
            const name: string = (config && config.Name) ? config.Name : 'MyZone';

            const zoned: Space = {
                Name: name,
                Origin: origin,
                Terminal: terminal,
                Anchor: anchor,
                Delta: delta,
                Zx: Zx.create(delta),
                Zy: Zy.create(delta),
                Zz: Zz.create(delta)
            };
            applyVolumeLimit(zoned);
            return zoned;
        };
        export function toString(space: Space): string {
            const origin_str = Coord.toString(space.Origin);
            const terminal_str = Coord.toString(space.Terminal);
            const anchor_str = Coord.toString(space.Anchor);
            const zx_str = Axial.toString(space.Zx);
            const zy_str = Axial.toString(space.Zy);
            const zz_str = Axial.toString(space.Zz);

            return ["{", origin_str, terminal_str, anchor_str, zx_str, zy_str, zz_str, "}"].join("\n")
        };
        export namespace Surface {
            const ANCHOR_ON: number = 10;
            const FACE_INFO: { [key: number]: SurfaceInfo } = {
                [Face.Left]: {
                    name: "X-Left",
                    abscissa_axis: CoordAxis.Z, ordinate_axis: CoordAxis.Y,
                    origin_corner: { space_x: SpaceX.Left, space_y: SpaceY.Bottom, space_z: SpaceZ.Front },
                    terminal_corner: { space_x: SpaceX.Left, space_y: SpaceY.Top, space_z: SpaceZ.Back },
                    anchor_config: { ya: ANCHOR_ON, za: ANCHOR_ON }
                },
                [Face.Right]: {
                    name: "X+Right",
                    abscissa_axis: CoordAxis.Z, ordinate_axis: CoordAxis.Y,
                    origin_corner: { space_x: SpaceX.Right, space_y: SpaceY.Bottom, space_z: SpaceZ.Front },
                    terminal_corner: { space_x: SpaceX.Right, space_y: SpaceY.Top, space_z: SpaceZ.Back },
                    anchor_config: { ya: ANCHOR_ON, za: ANCHOR_ON }
                },
                [Face.Bottom]: {
                    name: "Y-Bottom",
                    abscissa_axis: CoordAxis.X, ordinate_axis: CoordAxis.Z,
                    origin_corner: { space_x: SpaceX.Left, space_y: SpaceY.Bottom, space_z: SpaceZ.Front },
                    terminal_corner: { space_x: SpaceX.Right, space_y: SpaceY.Bottom, space_z: SpaceZ.Back },
                    anchor_config: { xa: ANCHOR_ON, za: ANCHOR_ON }
                },
                [Face.Top]: {
                    name: "Y+Top",
                    abscissa_axis: CoordAxis.X, ordinate_axis: CoordAxis.Z,
                    origin_corner: { space_x: SpaceX.Left, space_y: SpaceY.Top, space_z: SpaceZ.Front },
                    terminal_corner: { space_x: SpaceX.Right, space_y: SpaceY.Top, space_z: SpaceZ.Back },
                    anchor_config: { xa: ANCHOR_ON, za: ANCHOR_ON }
                },
                [Face.Front]: {
                    name: "Z-Front",
                    abscissa_axis: CoordAxis.X, ordinate_axis: CoordAxis.Y,
                    origin_corner: { space_x: SpaceX.Left, space_y: SpaceY.Bottom, space_z: SpaceZ.Front },
                    terminal_corner: { space_x: SpaceX.Right, space_y: SpaceY.Top, space_z: SpaceZ.Front },
                    anchor_config: { xa: ANCHOR_ON, ya: ANCHOR_ON }
                },
                [Face.Back]: {
                    name: "Z+Back",
                    abscissa_axis: CoordAxis.X, ordinate_axis: CoordAxis.Y,
                    origin_corner: { space_x: SpaceX.Left, space_y: SpaceY.Bottom, space_z: SpaceZ.Back },
                    terminal_corner: { space_x: SpaceX.Right, space_y: SpaceY.Top, space_z: SpaceZ.Back },
                    anchor_config: { xa: ANCHOR_ON, ya: ANCHOR_ON }
                }
            };
            export function getFace(space: Space, face: Face, pattern: Pattern, outside?: boolean): Space {
                const face_info = FACE_INFO[face];
                if (!face_info) return null;

                const GRID_AXIAL_CONFIG = Axial.GRID_CONFIGURATION;

                const FACE_NAME: string = `${space.Name}~${face_info.name}`;
                const ABSCISSA_AXIS: CoordAxis = face_info.abscissa_axis;
                const ORDINATE_AXIS: CoordAxis = face_info.ordinate_axis;
                const ORIGIN_CORNER: SpaceCorner = face_info.origin_corner;
                const TERMINAL_CORNER: SpaceCorner = face_info.terminal_corner;
                const ANCHOR_CONFIG: AnchorConfig = face_info.anchor_config;

                const SpaceCorner = (_corner: SpaceCorner): Raw => {
                    return getCorner(space, _corner, outside);
                };
                const AnchorToGrid = (_coord: Coord<any>): Anchor => {
                    return Anchor.fromCoord(_coord, ANCHOR_CONFIG);
                };
                const GridAxial = (grid_zone: Space, axis: CoordAxis) => {
                    Space.configureZoneAxial(grid_zone, axis, GRID_AXIAL_CONFIG);
                };

                const coord0: Coord<any> = AnchorToGrid(SpaceCorner(ORIGIN_CORNER));
                const coord1: Coord<any> = AnchorToGrid(SpaceCorner(TERMINAL_CORNER));

                const Surface: Space = Space.fromCoords(coord0, coord1, { Name: `${FACE_NAME} Surface` });

                const Abscissa: Space = Space.clone(Surface);
                GridAxial(Abscissa, ABSCISSA_AXIS);
                Abscissa.Name = `${FACE_NAME} Abscissa`;

                const Ordinate: Space = Space.clone(Surface);
                GridAxial(Ordinate, ORDINATE_AXIS);
                Ordinate.Name = `${FACE_NAME} Ordinate`;

                let surfaceSpace: Space = Surface;

                switch (pattern) {
                    case Pattern.Solid: surfaceSpace = Surface; break;
                    case Pattern.Abscissa: surfaceSpace = Abscissa; break;
                    case Pattern.Ordinate: surfaceSpace = Ordinate; break;
                };
                return surfaceSpace;
            };
        }
    }
    export class Zone implements Space {
        private readonly InitialOrigin: Origin;
        private readonly InitialTerminal: Terminal;

        private _Name: string;
        private _Origin: Origin;
        private _Terminal: Terminal;
        private _Anchor: Anchor;
        private _Zx: Zx;
        private _Zy: Zy;
        private _Zz: Zz;

        public get Name(): string { return this._Name };
        public get Origin(): Origin { return this._Origin };
        public get Terminal(): Terminal { return this._Terminal };
        public get Anchor(): Anchor { return this._Anchor };
        public get Delta(): Delta { return Delta.fromCoords(this.Terminal, this.Origin) };
        public get Zx(): Zx { return this._Zx };
        public get Zy(): Zy { return this._Zy };
        public get Zz(): Zz { return this._Zz };

        public constructor(pos0: Position, pos1: Position, _name?: string) {
            const coord0 = Raw.fromPosition(pos0);
            const coord1 = Raw.fromPosition(pos1);
            const config = _name ? { Name: _name } : undefined;
            this.setSpace(coord0, coord1, config);
            this.InitialOrigin = Coord.clone(this.Origin);
            this.InitialTerminal = Coord.clone(this.Terminal);
        };
        private overlaySpace(space: Space) {
            this._Name = space.Name;
            this._Origin = space.Origin;
            this._Terminal = space.Terminal;
            this._Anchor = space.Anchor;
            this._Zx = space.Zx;
            this._Zy = space.Zy;
            this._Zz = space.Zz;
        };
        private setSpace<O extends CoordKind, T extends CoordKind>(coord0: Coord<O>, coord1: Coord<T>, config?: SpaceConfig): void {
            const space = Space.fromCoords(coord0, coord1);
            this.overlaySpace(space);
        };
        public setSurface(face: Face, pattern: Pattern, outside?: boolean): void {
            this.reset();
            const faceZone = Space.Surface.getFace(this, face, pattern, outside);
            this.overlaySpace(faceZone);
        };
        public reset(): void {
            this.setSpace(this.InitialOrigin, this.InitialTerminal);
        };
    };
}
//
//
//
type SectorCount = number;
type ActiveIndex = number;
type ChunkScale = number;
namespace ChunkScale {
    export interface TickingSectors extends BlockScale.Space {
        TickingSectors: Sector[];
        SectorCount: number;
        Tile: Span;
        DeactivateSectors(): void;
        EnsureActiveAround(x: BlockScale, z: BlockScale): void;
    };

    const enum Pair { Origin, Offset }
    const enum Dimension { X, Z }
    /**
     * Branded Type: Zero-cost abstraction for type safety in Static TypeScript.
     */
    type ChunkUnit<P extends Pair, D extends Dimension> = ChunkScale & { readonly _pair: P; readonly _dimension: D; };

    type cX = ChunkUnit<Pair.Origin, Dimension.X>;
    type cZ = ChunkUnit<Pair.Origin, Dimension.Z>;
    type spanX = ChunkUnit<Pair.Offset, Dimension.X>;
    type spanZ = ChunkUnit<Pair.Offset, Dimension.Z>;

    export type Chunk = { cX: cX, cZ: cZ };
    export type Span = { spanX: spanX, spanZ: spanZ };
    export type Area = Chunk & Span;
    export type Sector = Area & { ID: string, ActiveIdx: number };

    namespace cX { export function create(val: number): cX { return (val | 0) as cX; } };
    namespace cZ { export function create(val: number): cZ { return (val | 0) as cZ; } };
    namespace spanX { export function create(val: number): spanX { return (val | 0) as spanX; } };
    namespace spanZ { export function create(val: number): spanZ { return (val | 0) as spanZ; } };
    function fromBlockScale(block_scale: BlockScale): ChunkScale { return (block_scale | 0) >> 4; };
    function toBlockScale(chunk_scale: ChunkScale): BlockScale { return (chunk_scale | 0) << 4; };

    namespace Chunk {
        export function fromXZ(x: BlockScale, z: BlockScale): Chunk {
            return {
                cX: cX.create(fromBlockScale(x)),
                cZ: cZ.create(fromBlockScale(z))
            };
        };
        export function toCmdStr(chunk: Chunk): string {
            return `${toBlockScale(chunk.cX)} 0 ${toBlockScale(chunk.cZ)}`;
        };
    }
    namespace Area {
        export const enum Tile {
            Skinny, Tall, Long, Chunky, Broad, Flat, Squashed
        };

        export const TILE: { [key: number]: Span } = {
            [Tile.Skinny]: { spanX: 3 as spanX, spanZ: 33 as spanZ },
            [Tile.Tall]: { spanX: 4 as spanX, spanZ: 25 as spanZ },
            [Tile.Long]: { spanX: 5 as spanX, spanZ: 20 as spanZ },
            [Tile.Chunky]: { spanX: 10 as spanX, spanZ: 10 as spanZ },
            [Tile.Broad]: { spanX: 20 as spanX, spanZ: 5 as spanZ },
            [Tile.Flat]: { spanX: 25 as spanX, spanZ: 4 as spanZ },
            [Tile.Squashed]: { spanX: 33 as spanX, spanZ: 3 as spanZ }
        };

        export function create(cx: number, cz: number, spanx: number, spanz: number): Area {
            return {
                cX: cX.create(cx),
                cZ: cZ.create(cz),
                spanX: spanX.create(spanx),
                spanZ: spanZ.create(spanz),
            } as Area;
        };

        export function getOrigin(area: Area): Chunk {
            return { cX: area.cX, cZ: area.cZ };
        };

        export function getTerminal(area: Area): Chunk {
            return {
                cX: cX.create((area.cX + (area as any).spanX - 1) | 0),
                cZ: cZ.create((area.cZ + (area as any).spanZ - 1) | 0)
            };
        };

        export function containsChunk(area: Area, chunk: Chunk): boolean {
            const dX = chunk.cX - area.cX;
            const dZ = chunk.cZ - area.cZ;
            return (dX >= 0 && dX < (area as any).spanX && dZ >= 0 && dZ < (area as any).spanZ);
        };

        export function getAdjacentArea(area: Area, direction: "N" | "S" | "E" | "W"): Area {
            let cx = area.cX;
            let cz = area.cZ;
            const sx = area.spanX;
            const sz = area.spanZ;

            if (direction === "N") cz = (cz - sz) as cZ;
            if (direction === "S") cz = (cz + sz) as cZ;
            if (direction === "W") cx = (cx - sx) as cX;
            if (direction === "E") cx = (cx + sx) as cX;

            return create(cx, cz, sx, sz);
        };

        export function toCmdStr(area: Area): string {
            return `${Chunk.toCmdStr(getOrigin(area))} ${Chunk.toCmdStr(getTerminal(area))}`;
        };

        export function getZoneTile(zone: TickingSectors): Span {
            const origin_cX: ChunkScale = fromBlockScale(zone.Origin.x | 0);
            const origin_cZ: ChunkScale = fromBlockScale(zone.Origin.z | 0);
            const terminal_cX: ChunkScale = fromBlockScale(zone.Terminal.x | 0);
            const terminal_cZ: ChunkScale = fromBlockScale(zone.Terminal.z | 0);

            const reqZ = (terminal_cX - origin_cX + 1) | 0;
            let optimalFit = Tile.Skinny;

            if (reqZ < 33) {
                let tightestZ = 33;
                const options = [
                    Tile.Skinny, Tile.Tall, Tile.Long, Tile.Chunky,
                    Tile.Broad, Tile.Flat, Tile.Squashed
                ];

                for (let tileKey of options) {
                    const config = TILE[tileKey];
                    if (config.spanZ >= reqZ && config.spanZ <= tightestZ) {
                        tightestZ = config.spanZ;
                        optimalFit = tileKey;
                    }
                }
            } else {
                optimalFit = Tile.Skinny;
            }

            return TILE[optimalFit];
        };
    }
    namespace Sector {
        const MAX_ACTIVE_SECTORS: number = 10;
        /**
         * Central management function. 
         * Iterates backwards to sync indices and remove deprecated sectors in one pass.
         */
        function refreshActiveIndices(zone: TickingSectors): void {
            const list = zone.TickingSectors;
            for (let i = list.length - 1; i >= 0; i--) {
                const idx = i < MAX_ACTIVE_SECTORS ? i : -1;
                list[i].ActiveIdx = idx | 0;

                // If index is -1, the sector is deprecated (LRU overflow)
                if (list[i].ActiveIdx === -1) {
                    // API Removal: Minecraft Command
                    // @ts-ignore
                    ExecuteCmd(`tickingarea remove ${list[i].ID}`);
                    // State Removal: Array Cleanup
                    list.splice(i, 1);
                }
            }
        };

        export function generateNextID(zone: TickingSectors): string { return "sector_" + zone.SectorCount++; }
        export function indexArea(zone: TickingSectors, area: Area): Sector {
            const sector = area as Sector;
            sector.ActiveIdx = -1;
            sector.ID = generateNextID(zone);
            return sector;
        };
        export function findActiveIndex(zone: TickingSectors, area: Area): number {
            for (let s of zone.TickingSectors) {
                if (s.cX === area.cX && s.cZ === area.cZ && (s as any).spanX === (area as any).spanX && (s as any).spanZ === (area as any).spanZ) {
                    return s.ActiveIdx;
                }
            }
            return -1;
        };
        export function activateArea(zone: TickingSectors, area: Area): void {
            if (findActiveIndex(zone, area) >= 0) return;

            const sector = (area as Sector).ID ? (area as Sector) : indexArea(zone, area);
            const cmd = `tickingarea add ${Area.toCmdStr(sector)} ${sector.ID}`;

            // @ts-ignore
            ExecuteCmd(cmd);

            // LRU Implementation: Unshift new sector to the front (Index 0)
            zone.TickingSectors.unshift(sector);
            refreshActiveIndices(zone);
        };
        export function deactivateAll(zone: TickingSectors): void {
            // @ts-ignore
            for (let sector of zone.TickingSectors) {
                sector.ActiveIdx = -1;
            };
            ExecuteCmd(`tickingarea remove_all`);
            zone.TickingSectors.length = 0;
        };
        export function ensureChunkIsActive(zone: TickingSectors, chunk: Chunk, _span?: Span): void {
            for (let active_area of zone.TickingSectors) {
                if (Area.containsChunk(active_area, chunk)) return;
            }

            const dirs: ("N" | "S" | "E" | "W")[] = ["N", "S", "E", "W"];
            for (let active_area of zone.TickingSectors) {
                for (let d of dirs) {
                    const adj = Area.getAdjacentArea(active_area, d);
                    if (Area.containsChunk(adj, chunk)) {
                        activateArea(zone, adj);
                        return;
                    }
                }
            }

            const span = _span ? _span : { spanX: spanX.create(10), spanZ: spanZ.create(10) };
            const area = Area.create(chunk.cX, chunk.cZ, span.spanX, span.spanZ);
            activateArea(zone, area);
        };
    }
    export function EnsureActiveXZ(zone: TickingSectors, x: BlockScale, z: BlockScale): void {
        const queryChunk = Chunk.fromXZ(x, z);
        Sector.ensureChunkIsActive(zone, queryChunk, zone.Tile);
    };
    export function DetermineZoneTile(zone: TickingSectors): void {
        zone.Tile = Area.getZoneTile(zone);
    };
    export function SetInactive(zone: TickingSectors) {
        Sector.deactivateAll(zone);
        zone.SectorCount = 0;
    };
    export class Zone extends BlockScale.Zone implements TickingSectors {
        public readonly TickingSectors: Sector[];
        public SectorCount: number;
        public Tile: Span;
        public DeactivateSectors(): void {
            ChunkScale.SetInactive(this);
        };
        public EnsureActiveAround(x: BlockScale, z: BlockScale): void {
            ChunkScale.EnsureActiveXZ(this, x, z)
        };
        public constructor(pos0: Position, pos1: Position, _name?: string) {
            super(pos0, pos1, _name);
            ChunkScale.DetermineZoneTile(this);
        };
    };
};

//
//
//
type GameTicks = number;
type ZoneIndex = number;
type InProgress = boolean;
namespace Runtime {
    export interface Info extends ChunkScale.TickingSectors {
        InProgress: InProgress;
        CurrentZoneIndex: ZoneIndex;
        LastZoneIndex: ZoneIndex;
        StartTime: GameTicks;
        ElapsedTime: GameTicks;
        CurrentRate: GameTicks;
        StartTracking(): void;
        ReportUpdate(): void;
        ReportSummary(): void;
        NextSubZoneID(): string;
    };
    const FONT = {
        GOLD: "§6",
        GREY: "§7",
        DGREY: "§8",
        GREEN: "§a",
        YELLOW: "§e",
        WHITE: "§f",
        DGOLD: "§g",
        RESET: "§r",
    };
    interface MSG_element { text: string, font?: JSONstr };
    const CMD_TITLE_RAW: JSONstr = 'titleraw @s actionbar';
    const MSG_HEADER: JSONstr = '{"rawtext":[{"text":"';
    const MSG_JOINER: JSONstr = " | ";
    const MSG_FOOTER: JSONstr = '"}]}';
    const PROGRESS_BAR: string[] = [
        `[____________________]`, `[■___________________]`, `[■■__________________]`, `[■■■_________________]`,
        `[■■■■________________]`, `[■■■■■_______________]`, `[■■■■■■______________]`, `[■■■■■■■_____________]`,
        `[■■■■■■■■____________]`, `[■■■■■■■■■___________]`, `[■■■■■■■■■■__________]`, `[■■■■■■■■■■■_________]`,
        `[■■■■■■■■■■■■________]`, `[■■■■■■■■■■■■■_______]`, `[■■■■■■■■■■■■■■______]`, `[■■■■■■■■■■■■■■■_____]`,
        `[■■■■■■■■■■■■■■■■____]`, `[■■■■■■■■■■■■■■■■■___]`, `[■■■■■■■■■■■■■■■■■■__]`, `[■■■■■■■■■■■■■■■■■■■_]`,
        `[■■■■■■■■■■■■■■■■■■■■]`,
    ];

    function ActionBarCmd(message: { text: string, font?: JSONstr }[]): CmdStr {
        const msg_array = [];
        for (let msg_element of message) {
            msg_array.push(`${msg_element.font || ""}${msg_element.text}${FONT.RESET}`);
        };
        return `${MSG_HEADER}${msg_array.join(MSG_JOINER)}${MSG_FOOTER}`
    };
    function ticksToString(ticks: GameTicks): string {
        const total_seconds = (ticks * 0.05) | 0;
        const mins = (total_seconds / 60) | 0;
        const secs = (total_seconds - (mins * 60)) | 0;
        return `${mins}m${secs < 10 ? "0" : ""}${secs}s`;
    };
    function getPercentageComplete(info: Info): number {
        return (100 * info.CurrentZoneIndex / info.LastZoneIndex) | 0;
    };
    function getETA(info: Info): GameTicks {
        return ((info.LastZoneIndex - info.CurrentZoneIndex) * info.CurrentRate) | 0;
    };
    function UpdateReporter(info: Info): void {
        info.ElapsedTime = (GametickQuery(GAME_TIME) - info.StartTime) | 0;
        info.CurrentRate = (info.ElapsedTime / (info.CurrentZoneIndex + 1)) | 0;
    };
    export function StartTracking(info: Info): void {
        info.InProgress = true;
        info.CurrentZoneIndex = 0;
        info.LastZoneIndex = (info.Zx.count * info.Zy.count * info.Zz.count) | 0;
        info.StartTime = GametickQuery(GAME_TIME) | 0;
        info.ElapsedTime = 0;
        info.CurrentRate = 0;
    };
    export function NextSubZoneID(info: Info): string {
        return `${info.Name}_sub${info.CurrentZoneIndex++}`;
    };
    export function ReportSummary(info: Info): void {
        UpdateReporter(info);
        info.InProgress = false;
        const NAME_STR = `Zoning ${info.Name} Complete`;
        const TIME_STR = `${info.LastZoneIndex} subzones in ${ticksToString(info.ElapsedTime)}`;
        const RATE_STR = `${ticksToString(info.CurrentRate)} per subzone`;

        const cmd_str = `tell @s ${[NAME_STR, TIME_STR, RATE_STR].join("\n")}`;
        ExecuteCmd(cmd_str);
    };
    export function ReportUpdate(info: Info): void {
        UpdateReporter(info);

        const PercentComplete = getPercentageComplete(info);
        const BarIndex = (PercentComplete / 5) | 0;
        const ETA = getETA(info);

        const fG = FONT.GREY;
        const fY = FONT.YELLOW;
        const rF = FONT.RESET;
        const MSG_NAME = { text: info.Name, font: fG };
        const MSG_BAR = { text: PROGRESS_BAR[BarIndex], font: fY };
        const MSG_PERCENT = { text: `${PercentComplete}%`, font: fY };
        const MSG_ETA = { text: `Eta: ${ticksToString(ETA)}`, font: fG };

        const cmd_str = ActionBarCmd([MSG_NAME, MSG_BAR, MSG_PERCENT, MSG_ETA]);
        ExecuteCmd(cmd_str);
    };
    export class Zone extends ChunkScale.Zone implements Info {
        public InProgress: boolean = false;
        public CurrentZoneIndex: ZoneIndex = -1;
        public LastZoneIndex: ZoneIndex = -1;
        public StartTime: GameTicks = -1;
        public ElapsedTime: GameTicks = -1;
        public CurrentRate: GameTicks = -1;
        public constructor(pos0: Position, pos1: Position, _name?: string) {
            super(pos0, pos1, _name);
        };
        public StartTracking(): void {
            StartTracking(this);
        };
        public ReportUpdate(): void {
            ReportUpdate(this);
        };
        public ReportSummary(): void {
            ReportSummary(this);
        };
        public NextSubZoneID(): string {
            return NextSubZoneID(this);
        };
    };
};
type Zone = Runtime.Info
function zone(pos0: Position, pos1: Position, _name?: string): Zone {
    return new Runtime.Zone(pos0, pos1, _name);
};