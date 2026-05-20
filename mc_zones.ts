import GametickQuery = gameplay.timeQuery
import ExecuteCmd = player.execute;
type JSONstr = string;
type CmdStr = string;

const OPENBRACKET = "{";
const CLOSEBRACKET = "}";
const NEWLINE = "/n";

type BlockScale = number;
namespace BlockScale {
    // Coord types, interfaces and enumerators.
    export const enum CoordKind { Raw, Origin, Terminal, Delta, Anchor };
    export const CoordName = ["Raw", "Origin", "Terminal", "Delta", "Anchor"];
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

    export type Raw = Coord<CoordKind.Raw> & {
        kind: CoordKind.Raw;
        x: X<CoordKind.Raw>;
        y: Y<CoordKind.Raw>;
        z: Z<CoordKind.Raw>;
    };
    export type Origin = Coord<CoordKind.Origin> & {
        readonly kind: CoordKind.Origin;
        readonly x: X<CoordKind.Origin>;
        readonly y: Y<CoordKind.Origin>;
        readonly z: Z<CoordKind.Origin>;
    };
    export type Terminal = Coord<CoordKind.Terminal> & {
        readonly kind: CoordKind.Terminal;
        readonly x: X<CoordKind.Terminal>;
        readonly y: Y<CoordKind.Terminal>;
        readonly z: Z<CoordKind.Terminal>;
    };
    export type Delta = Coord<CoordKind.Delta> & {
        readonly kind: CoordKind.Delta;
        readonly x: X<CoordKind.Delta>;
        readonly y: Y<CoordKind.Delta>;
        readonly z: Z<CoordKind.Delta>;
    };
    export interface AnchorConfig extends CoordConfig {
        xa?: BlockScale;
        ya?: BlockScale;
        za?: BlockScale;
    };
    export type Anchor = Coord<CoordKind.Anchor> & {
        kind: CoordKind.Anchor;
        x: X<CoordKind.Anchor>;
        y: Y<CoordKind.Anchor>;
        z: Z<CoordKind.Anchor>;
        config: AnchorConfig;
    };

    // Axial types, interfaces and enumerators.    
    export interface AxialConfig {
        count?: number;
        interval?: BlockScale;
        blocks?: BlockScale;
    };
    export const enum ConfigType { ANC, X_C, Y_C, Z_C }
    export interface SpaceConfigs {
        ANC?: AnchorConfig;
        X_C?: AxialConfig;
        Y_C?: AxialConfig;
        Z_C?: AxialConfig;
    };
    export type Axial<A extends CoordAxis> = {
        axis: A;
        length: BlockScale;
        count: number;
        interval: BlockScale;
        blocks: BlockScale;
        config: AxialConfig;
    };

    export type AxialX = Axial<CoordAxis.X>;
    export type AxialY = Axial<CoordAxis.Y>;
    export type AxialZ = Axial<CoordAxis.Z>;

    // Space types, interfaces and enumerators.
    export type Space = {
        Name: string;
        Origin: Origin;
        Terminal: Terminal;
        Anchor: Anchor;
        Delta: Delta;
        AxialX: AxialX;
        AxialY: AxialY;
        AxialZ: AxialZ;
    };

    export type InternalSpace = {
        _Name: string;
        _Origin: Origin;
        _Terminal: Terminal;
        AnchorSource: Coord<any>;
        Configs: SpaceConfigs;
    };

    /**
     * @description Bridges the internal tracking configurations and variables
     * with the external-facing geometric Space properties.
     */
    export type SpaceZone = Space & InternalSpace;

    export interface ModifySpace {
        Name?: string;
        Origin?: Origin;
        Terminal?: Terminal;
        Configs?: SpaceConfigs;
    };

    // Space Surface types, interfaces and enumerators.
    const enum FaceX { Left, Right };
    const enum FaceY { Bottom, Top };
    const enum FaceZ { Front, Back };
    export const enum Face { None, Left, Right, Bottom, Top, Front, Back };
    export const enum Pattern { Solid, Abscissa, Ordinate };
    const PATTERN_NAME = {
        [Pattern.Solid]: 'solid',
        [Pattern.Abscissa]: 'abscissa',
        [Pattern.Ordinate]: 'ordinate'
    };
    interface SpaceCorner {
        faceX: FaceX;
        faceY: FaceY;
        faceZ: FaceZ;
    };
    interface SurfaceInfo {
        name: string;
        abscissa: ConfigType;
        ordinate: ConfigType;
        origin: SpaceCorner;
        terminal: SpaceCorner;
        anc: AnchorConfig;
    };
    export namespace Coord {
        /**
         * @description Base low-level initializer renamed from 'create' to 'newCoord'.
         */
        function build<K extends CoordKind>(kind: K, x: number, y: number, z: number, _config?: CoordConfig): Coord<K> {
            return {
                kind: kind,
                x: (x | 0) as X<K>,
                y: (y | 0) as Y<K>,
                z: (z | 0) as Z<K>,
                config: _config || {}
            } as Coord<K>;
        }

        export const is = {
            Raw: (c: Coord<any>): c is Raw => c.kind === CoordKind.Raw,
            Origin: (c: Coord<any>): c is Origin => c.kind === CoordKind.Origin,
            Terminal: (c: Coord<any>): c is Terminal => c.kind === CoordKind.Terminal,
            Anchor: (c: Coord<any>): c is Anchor => c.kind === CoordKind.Anchor,
            Delta: (c: Coord<any>): c is Delta => c.kind === CoordKind.Delta
        };

        /**
         * @description Unified type casting factories map for clean spatial creations.
         */
        export const create = {
            Raw: (x: number, y: number, z: number) => build(CoordKind.Raw, x, y, z) as Raw,
            Origin: (x: number, y: number, z: number) => build(CoordKind.Origin, x, y, z) as Origin,
            Terminal: (x: number, y: number, z: number) => build(CoordKind.Terminal, x, y, z) as Terminal,
            Anchor: (x: number, y: number, z: number, config?: AnchorConfig) => build(CoordKind.Anchor, x, y, z, config) as Anchor,
            Delta: (x: number, y: number, z: number) => build(CoordKind.Delta, x, y, z) as Delta
        };

        export function clone<K extends CoordKind>(coord: Coord<K>): Coord<K> {
            const kind: K = coord.kind as K;
            const x: number = coord.x as number;
            const y: number = coord.y as number;
            const z: number = coord.z as number;
            const config: CoordConfig = coord.config || {};
            return build(kind, x, y, z, config) as Coord<K>;
        }

        export function toCmdStr<K extends CoordKind>(coord: Coord<K>): string {
            return `${coord.x} ${coord.y} ${coord.z}`;
        }

        export function toString<K extends CoordKind>(coord: Coord<K>): string {
            const kindName = CoordName[coord.kind as number] || "Unknown";
            return `{ kind: ${kindName}, x: ${coord.x}, y: ${coord.y}, z: ${coord.z} }`;
        }

        export function fromPosition(_pos: Position): Raw {
            const world_pos = _pos.toWorld();
            const rx: BlockScale = world_pos.getValue(Axis.X);
            const ry: BlockScale = world_pos.getValue(Axis.Y);
            const rz: BlockScale = world_pos.getValue(Axis.Z);
            return create.Raw(rx, ry, rz);
        }

        export function getOrigin<O extends CoordKind, T extends CoordKind>(coord0: Coord<O>, coord1: Coord<T>): Origin {
            const ox = Math.min(coord0.x, coord1.x) | 0;
            const oy = Math.min(coord0.y, coord1.y) | 0;
            const oz = Math.min(coord0.z, coord1.z) | 0;
            return create.Origin(ox, oy, oz);
        }

        export function getTerminal<O extends CoordKind, T extends CoordKind>(coord0: Coord<O>, coord1: Coord<T>): Terminal {
            const tx = Math.max(coord0.x, coord1.x) | 0;
            const ty = Math.max(coord0.y, coord1.y) | 0;
            const tz = Math.max(coord0.z, coord1.z) | 0;
            return create.Terminal(tx, ty, tz);
        }

        export function getDelta<O extends CoordKind, T extends CoordKind>(coord0: Coord<O>, coord1: Coord<T>): Delta {
            const dx = (Math.abs(coord1.x - coord0.x) + 1) | 0;
            const dy = (Math.abs(coord1.y - coord0.y) + 1) | 0;
            const dz = (Math.abs(coord1.z - coord0.z) + 1) | 0;
            return create.Delta(dx, dy, dz);
        }

        export function toAnchor<K extends CoordKind>(coord: Coord<K>, _config?: AnchorConfig): Anchor {
            const config: AnchorConfig = _config ? _config : {};
            const use_ceiling = is.Terminal(coord);
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

            return create.Anchor(_x, _y, _z, config);
        }
    }
    export namespace Axial {
        const INTERVAL_LIMIT = 64;
        export const GRID_CONFIG: AxialConfig = { interval: 10, blocks: 1 };

        /**
         * Configures an existing _Axis object in-place.
         */
        export function configure<A extends CoordAxis>(axial: Axial<A>, _config?: AxialConfig): void {
            const length: BlockScale = axial.length | 1;
            let count: number = Math.ceil(length / INTERVAL_LIMIT);
            let interval: BlockScale = Math.ceil(length / count);
            let blocks: BlockScale = interval;

            const config: AxialConfig = _config ? _config : axial.config;

            const config_count = config.count;
            const config_interval = config.interval;
            const config_blocks = config.blocks;

            if (config_count !== undefined) {
                count = Math.max(count, config_count);
                interval = Math.ceil(length / count);
                blocks = interval;
            }
            if (config_interval !== undefined) {
                interval = Math.max(1, Math.min(INTERVAL_LIMIT, config_interval));
                count = Math.ceil(length / interval);
                blocks = interval;
            }
            if (config_blocks !== undefined) {
                blocks = Math.max(1, Math.min(interval, config_blocks));
            }

            axial.count = count | 0;
            axial.interval = interval | 0;
            axial.blocks = blocks | 0;
            axial.config = config;
        }

        export function grid<A extends CoordAxis>(axial: Axial<A>): void {
            configure(axial, GRID_CONFIG);
        }

        /**
         * Factory function for creating a new _Axis object.
         */
        function build<A extends CoordAxis>(axis: A, delta: Delta, _config?: AxialConfig): Axial<A> {
            let axial: Axial<A> = { axis: axis, length: -1, count: 1, interval: 1, blocks: 1, config: {} };
            switch (axis) {
                case CoordAxis.X: axial.length = delta.x; break;
                case CoordAxis.Y: axial.length = delta.y; break;
                case CoordAxis.Z: axial.length = delta.z; break;
                default: axial.length = 0;
            }
            configure(axial, _config);
            return axial;
        }

        export const create = {
            X: (delta: Delta, config?: AxialConfig) => build(CoordAxis.X, delta, config) as AxialX,
            Y: (delta: Delta, config?: AxialConfig) => build(CoordAxis.Y, delta, config) as AxialY,
            Z: (delta: Delta, config?: AxialConfig) => build(CoordAxis.Z, delta, config) as AxialZ,
        };

        export function clone<A extends CoordAxis>(axial: Axial<A>): Axial<A> {
            const axis: CoordAxis = axial.axis;
            const length: BlockScale = axial.length | 0;
            const count: number = axial.count | 0;
            const interval: BlockScale = axial.interval | 0;
            const blocks: BlockScale = axial.blocks | 0;
            return { axis, length, count, interval, blocks, config: axial.config || {} } as Axial<A>;
        }

        export function toString<A extends CoordAxis>(axial: Axial<A>): string {
            return `{ axis: ${axial.axis}, length: ${axial.length}, count: ${axial.count}, interval: ${axial.interval}, blocks: ${axial.blocks} }`;
        }
    }
    export namespace InternalSpace {
        const VOLUME_LIMIT: number = 32768;

        function CloneAnchorConfig(config: AnchorConfig): AnchorConfig {
            return {
                xa: (config.xa | 0) || undefined,
                ya: (config.ya | 0) || undefined,
                za: (config.za | 0) || undefined,
            } as AnchorConfig;
        }

        function CloneAxialConfig(config: AxialConfig): AxialConfig {
            return {
                count: (config.count | 0) || undefined,
                interval: (config.interval | 0) || undefined,
                blocks: (config.blocks | 0) || undefined,
            } as AxialConfig;
        }

        function CloneSpaceConfigs(configs: SpaceConfigs): SpaceConfigs {
            return {
                ANC: configs.ANC ? CloneAnchorConfig(configs.ANC) : undefined,
                X_C: configs.X_C ? CloneAxialConfig(configs.X_C) : undefined,
                Y_C: configs.Y_C ? CloneAxialConfig(configs.Y_C) : undefined,
                Z_C: configs.Z_C ? CloneAxialConfig(configs.Z_C) : undefined,
            } as SpaceConfigs;
        }

        export function ApplyVolumeLimit(internal: InternalSpace): void {
            const x_interval: BlockScale = getAxialX(internal).interval | 0;
            const z_interval: BlockScale = getAxialZ(internal).interval | 0;

            const areaXZ: BlockScale = Math.max(x_interval * z_interval, 1) | 0;
            const y_max: BlockScale = (VOLUME_LIMIT / areaXZ) | 0;

            const y_interval: BlockScale = Math.clamp(1, y_max, (getAxialY(internal).interval | 0));

            if (internal.Configs.Y_C) {
                internal.Configs.Y_C.interval = y_interval;
                return;
            }
            internal.Configs.Y_C = { interval: y_interval };
        }

        export function modify(internal: InternalSpace, modifyObj: ModifySpace): void {
            const modify_name = modifyObj.Name || undefined;
            const modify_origin = modifyObj.Origin || undefined;
            const modify_terminal = modifyObj.Terminal || undefined;
            const modify_configs = modifyObj.Configs || undefined;

            if (modify_name) {
                internal._Name = modify_name;
            }

            if (modify_origin || modify_terminal) {
                const o = modify_origin || internal._Origin;
                const t = modify_terminal || internal._Terminal;

                internal._Origin = Coord.getOrigin(o, t);
                internal._Terminal = Coord.getTerminal(o, t);
            }

            if (modify_configs) {
                const intCfgs = internal.Configs;

                const modAnc = modify_configs.ANC || intCfgs.ANC || undefined;
                const modXax = modify_configs.X_C || intCfgs.X_C || undefined;
                const modYax = modify_configs.Y_C || intCfgs.Y_C || undefined;
                const modZax = modify_configs.Z_C || intCfgs.Z_C || undefined;

                internal.Configs.ANC = modAnc;
                internal.Configs.X_C = modXax;
                internal.Configs.Y_C = modYax;
                internal.Configs.Z_C = modZax;
            }
        }

        export function create(coord0: Coord<any>, coord1: Coord<any>, configs?: SpaceConfigs): InternalSpace {
            const _Name: string = 'RawSpace';
            const _Origin: Origin = Coord.getOrigin(coord0, coord1);
            const _Terminal: Terminal = Coord.getTerminal(coord0, coord1);
            const AnchorSource: Coord<any> = _Origin;

            const _Configs: SpaceConfigs = {
                ANC: configs.ANC || undefined,
                X_C: configs.X_C || undefined,
                Y_C: configs.Y_C || undefined,
                Z_C: configs.Z_C || undefined,
            };

            const internal: InternalSpace = { _Name, _Origin, _Terminal, AnchorSource, Configs: _Configs };
            ApplyVolumeLimit(internal);
            return internal;
        }

        export function clone(internal: InternalSpace): InternalSpace {
            return {
                _Name: `${internal._Name}_clone` as string,
                _Origin: Coord.clone(internal._Origin) as Origin,
                _Terminal: Coord.clone(internal._Terminal) as Terminal,
                AnchorSource: Coord.clone(internal.AnchorSource) as Coord<any>,
                Configs: CloneSpaceConfigs(internal.Configs) as SpaceConfigs,
            } as InternalSpace;
        }

        export function overlay(internal: InternalSpace, source: InternalSpace): void {
            internal._Name = source._Name;
            internal._Origin = source._Origin;
            internal._Terminal = source._Terminal;
            internal.AnchorSource = source.AnchorSource;
            internal.Configs = source.Configs;
        }
        export function getName(internal: InternalSpace): string {
            return internal._Name;
        }
        export function getOrigin(internal: InternalSpace): Origin {
            return internal._Origin;
        }
        export function getTerminal(internal: InternalSpace): Terminal {
            return internal._Terminal;
        }
        export function getDelta(internal: InternalSpace): Delta {
            return Coord.getDelta(internal._Origin, internal._Terminal);
        }
        export function getAnchor(internal: InternalSpace): Anchor {
            return Coord.toAnchor(internal.AnchorSource, internal.Configs.ANC);
        }
        export function getAxialX(internal: InternalSpace): AxialX {
            const delta: Delta = getDelta(internal);
            const x_config = internal.Configs.X_C || undefined;
            return Axial.create.X(delta, x_config);
        }
        export function getAxialY(internal: InternalSpace): AxialY {
            const delta: Delta = getDelta(internal);
            const y_config = internal.Configs.Y_C || undefined;
            return Axial.create.Y(delta, y_config);
        }
        export function getAxialZ(internal: InternalSpace): AxialZ {
            const delta: Delta = getDelta(internal);
            const z_config = internal.Configs.Z_C || undefined;
            return Axial.create.Z(delta, z_config);
        }
    }
    export namespace Space {
        export function toString(space: Space): string {
            const origin_str = Coord.toString(space.Origin);
            const terminal_str = Coord.toString(space.Terminal);
            const anchor_str = Coord.toString(space.Anchor);
            const AxialX_str = Axial.toString(space.AxialX);
            const AxialY_str = Axial.toString(space.AxialY);
            const AxialZ_str = Axial.toString(space.AxialZ);

            return ["{", origin_str, terminal_str, anchor_str, AxialX_str, AxialY_str, AxialZ_str, "}"].join("\n");
        }

        function GetRawCorner(space: Space, corner: SpaceCorner, outside?: boolean): Raw {
            const offset: number = outside ? 1 : 0;
            const x: number = (corner.faceX === FaceX.Left) ? space.Origin.x - offset : space.Terminal.x + offset;
            const y: number = (corner.faceY === FaceY.Bottom) ? space.Origin.y - offset : space.Terminal.y + offset;
            const z: number = (corner.faceZ === FaceZ.Front) ? space.Origin.z - offset : space.Terminal.z + offset;
            return Coord.create.Raw(x, y, z);
        }

        export namespace Surface {
            const ANCHOR_ON: number = 10;
            const FACE_INFO: { [key: number]: SurfaceInfo } = {
                [Face.None]: {
                    name: '',
                    abscissa: undefined, ordinate: undefined,
                    origin: { faceX: FaceX.Left, faceY: FaceY.Bottom, faceZ: FaceZ.Front },
                    terminal: { faceX: FaceX.Right, faceY: FaceY.Top, faceZ: FaceZ.Back },
                    anc: {}
                },
                [Face.Left]: {
                    name: "X-Left",
                    abscissa: ConfigType.Y_C, ordinate: ConfigType.Z_C,
                    origin: { faceX: FaceX.Left, faceY: FaceY.Bottom, faceZ: FaceZ.Front },
                    terminal: { faceX: FaceX.Left, faceY: FaceY.Top, faceZ: FaceZ.Back },
                    anc: { ya: ANCHOR_ON, za: ANCHOR_ON }
                },
                [Face.Right]: {
                    name: "X+Right",
                    abscissa: ConfigType.Y_C, ordinate: ConfigType.Z_C,
                    origin: { faceX: FaceX.Right, faceY: FaceY.Bottom, faceZ: FaceZ.Front },
                    terminal: { faceX: FaceX.Right, faceY: FaceY.Top, faceZ: FaceZ.Back },
                    anc: { ya: ANCHOR_ON, za: ANCHOR_ON }
                },
                [Face.Bottom]: {
                    name: "Y-Bottom",
                    abscissa: ConfigType.X_C, ordinate: ConfigType.Z_C,
                    origin: { faceX: FaceX.Left, faceY: FaceY.Bottom, faceZ: FaceZ.Front },
                    terminal: { faceX: FaceX.Right, faceY: FaceY.Bottom, faceZ: FaceZ.Back },
                    anc: { xa: ANCHOR_ON, za: ANCHOR_ON }
                },
                [Face.Top]: {
                    name: "Y+Top",
                    abscissa: ConfigType.X_C, ordinate: ConfigType.Z_C,
                    origin: { faceX: FaceX.Left, faceY: FaceY.Top, faceZ: FaceZ.Front },
                    terminal: { faceX: FaceX.Right, faceY: FaceY.Top, faceZ: FaceZ.Back },
                    anc: { xa: ANCHOR_ON, za: ANCHOR_ON }
                },
                [Face.Front]: {
                    name: "Z-Front",
                    abscissa: ConfigType.X_C, ordinate: ConfigType.Y_C,
                    origin: { faceX: FaceX.Left, faceY: FaceY.Bottom, faceZ: FaceZ.Front },
                    terminal: { faceX: FaceX.Right, faceY: FaceY.Top, faceZ: FaceZ.Front },
                    anc: { xa: ANCHOR_ON, ya: ANCHOR_ON }
                },
                [Face.Back]: {
                    name: "Z+Back",
                    abscissa: ConfigType.X_C, ordinate: ConfigType.Y_C,
                    origin: { faceX: FaceX.Left, faceY: FaceY.Bottom, faceZ: FaceZ.Back },
                    terminal: { faceX: FaceX.Right, faceY: FaceY.Top, faceZ: FaceZ.Back },
                    anc: { xa: ANCHOR_ON, ya: ANCHOR_ON }
                }
            };

            export function getFace(space: Space, face: Face, pattern: Pattern, outside?: boolean): InternalSpace {
                const face_info = FACE_INFO[face];
                if (!face_info) return null;
                const GRID_AXIAL_CONFIG = Axial.GRID_CONFIG;
                const Configs: SpaceConfigs = { ANC: face_info.anc }
                const GridConfig = (config_type: ConfigType) => {
                    switch (config_type) {
                        case ConfigType.X_C: Configs.X_C = GRID_AXIAL_CONFIG; break;
                        case ConfigType.Y_C: Configs.Y_C = GRID_AXIAL_CONFIG; break;
                        case ConfigType.Z_C: Configs.Z_C = GRID_AXIAL_CONFIG; break;
                        default: break;
                    }
                };
                const ANC: AnchorConfig = face_info.anc;
                const SpaceCorner = (_corner: SpaceCorner): Anchor => {
                    const corner = GetRawCorner(space, _corner, outside);
                    return Coord.toAnchor(corner, face_info.anc);
                };
                switch (pattern) {
                    case Pattern.Abscissa: GridConfig(face_info.abscissa); break;
                    case Pattern.Ordinate: GridConfig(face_info.ordinate); break;
                    case Pattern.Solid: break;
                    default: break;
                }

                const coord0 = SpaceCorner(face_info.origin);
                const coord1 = SpaceCorner(face_info.terminal);

                const _Name: string = [space.Name, face_info.name, PATTERN_NAME[pattern]].join("-");

                const _Origin = Coord.getOrigin(coord0, coord1);
                const _Terminal = Coord.getTerminal(coord0, coord1);
                const AnchorSource = _Origin;

                const SurfaceSpace: InternalSpace = { _Name, _Origin, _Terminal, AnchorSource, Configs }
                InternalSpace.ApplyVolumeLimit(SurfaceSpace);
                return SurfaceSpace


            }
        }
    }
    export type ZoneInput = { coord0: Coord<CoordKind>, coord1: Coord<CoordKind>, name?: string }
    const INITIAL_SPACE: string = "InitialSpace"
    /**
     * @description Zone class representing an actual 3D chunk boundary selection.
     * Implements SpaceZone to unify outer-facing properties and internal metadata representation.
     */
    export class Zone implements SpaceZone {
        public static fromPositions(pos0: Position, pos1: Position, name?: string): ZoneInput {
            const coord0 = Coord.fromPosition(pos0);
            const coord1 = Coord.fromPosition(pos1);
            return {coord0, coord1, name};
        };
        private readonly Origin_0: Origin;
        private readonly Terminal_0: Terminal;

        public _Name: string;
        public _Origin: Origin;
        public _Terminal: Terminal;

        public AnchorSource: Coord<any>;
        public Configs: SpaceConfigs;

        private overlay(internal: InternalSpace): void {
            InternalSpace.overlay(this as InternalSpace, internal);
        };
        public Reset(): void {
            const InternalDefl: InternalSpace = InternalSpace.create(this.Origin_0, this.Terminal_0, { ANC: {} });
            InternalDefl._Name = this._Name || INITIAL_SPACE;
            this.overlay(InternalDefl);
        };
        protected constructor(zone_input: ZoneInput) {
            this._Name = zone_input.name || INITIAL_SPACE;
            this.Origin_0 = Coord.getOrigin(zone_input.coord0, zone_input.coord1);
            this.Terminal_0 = Coord.getTerminal(zone_input.coord0, zone_input.coord1);
            this.Reset();
        };
        public get Name(): string {
            return InternalSpace.getName(this as InternalSpace);
        };
        public set Name(val: string) {
            this._Name = val;
        };
        public get Origin(): Origin {
            return InternalSpace.getOrigin(this as InternalSpace);
        };
        public get Terminal(): Terminal {
            return InternalSpace.getTerminal(this as InternalSpace);
        };
        public get Delta(): Delta {
            return InternalSpace.getDelta(this as InternalSpace);
        };
        public get Anchor(): Anchor {
            return InternalSpace.getAnchor(this as InternalSpace);
        };
        public get AxialX(): AxialX {
            return InternalSpace.getAxialX(this as InternalSpace);
        };
        public get AxialY(): AxialY {
            return InternalSpace.getAxialY(this as InternalSpace);
        };
        public get AxialZ(): AxialZ {
            return InternalSpace.getAxialZ(this as InternalSpace);
        };
        public setFace(face: Face, pattern: Pattern, outside?: boolean): void {
            this.Reset();
            if (face === Face.None) return;
            this.overlay(Space.Surface.getFace(this as Space, face, pattern, outside));
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
        protected constructor(zone_input: BlockScale.ZoneInput) {
            super(zone_input)
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
        info.LastZoneIndex = (info.AxialX.count * info.AxialY.count * info.AxialZ.count) | 0;
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
        protected constructor(zone_input: BlockScale.ZoneInput) {
            super(zone_input)
        };
        public static create(pos0: Position, pos1: Position, name?: string): Zone {
            const zone_input = this.fromPositions(pos0, pos1, name);
            return new this(zone_input)
        };
    };
};
//% weight=500
namespace MinecraftZone {
    type MinecraftZone = Runtime.Zone;
    //% block="zone|$pos0=minecraftCreateWorldPosition|$pos1=minecraftCreateWorldPosition||name:|$name"
    //% blockSetVariable="zone"
    export function zone(pos0: Position, pos1: Position, name?: string): MinecraftZone {
        return Runtime.Zone.create(pos0, pos1, name)
    };
    //% block
    //% zone.shadow=variables_get zone.defl="zone"
    export function SpaceString(zone: MinecraftZone) {
        return BlockScale.Space.toString(zone)
    };
}