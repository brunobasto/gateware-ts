import { IfStatement, ElseIfStatement, IfElseBlock } from './block-expressions';
import { SignalT, ConstantT, SliceT, WireT, BaseSignalLike, ConcatT, BooleanExpression } from './signals';
import { GWModule } from './gw-module';
import { VendorModule } from './vendor-module';

export enum Signedness {
  Signed,
  Unsigned
};

export enum Edge {
  Positive,
  Negative
};

export enum Operation {
  Plus,
  Minus,
  Not,
  LogicalNot,
  Bit,
};

export enum BooleanOperation {
  And,
  Or,
  Xor,
  LogicalAnd,
  LogicalOr,
  LeftShift,
  RightShift,
  LeftArithmeticShift,
  RightArithmeticShift,
};

export enum ComparrisonOperation {
  Equal,
  NotEqual,
  LessThan,
  GreaterThan,
  LessThanOrEqualTo,
  GreaterThanOrEqualTo,
};

export enum LogicExpressionType {
  If,
  Switch,
  Case
}

export interface ComparrisonExpression {
  a: SignalLike;
  b: SignalLikeOrValue;
  comparrisonOp: ComparrisonOperation;
  type: 'comparrisonExpression';
  width: 1;
};

export interface OperationExpression {
  a: SignalLike;
  b: SignalLikeOrValue;
  op: Operation;
  type: 'operationExpression';
  width: number;
};

export interface AssignmentExpression {
  a: SignalT;
  b: SignalLikeOrValue;
  type: 'assignmentExpression';
  width: number;
};

export interface UnaryExpression {
  a: SignalLike;
  op: Operation;
  type: 'unaryExpression';
  width: number;
}

export interface TernaryExpression {
  a: SignalLikeOrValue;
  b: SignalLikeOrValue;
  comparrison: ComparrisonExpression;
  type: 'ternaryExpression';
  width: number;
}

export interface SwitchExpression {
  type: 'switchExpression';
  subject: SignalLike;
  cases: CaseExpression[];
}

export interface SubjectiveCaseExpression {
  type: 'caseExpression';
  subject: SignalLikeOrValue;
  body: BlockExpression[];
};

export interface DefaultCaseExpression {
  type: 'defaultCaseExpression';
  body: BlockExpression[];
};

export type Port = SignalT | WireT;
export type SignalLike  = BaseSignalLike
                        | SignalT
                        | WireT
                        | SliceT
                        | ConcatT
                        | UnaryExpression
                        | ComparrisonExpression
                        | ConstantT
                        | OperationExpression
                        | TernaryExpression
                        | BooleanExpression;

export type SignalLikeOrValue = SignalLike | number;
export type Slicable = SignalT | SliceT | UnaryExpression | ConstantT | OperationExpression;
export type CaseExpression = SubjectiveCaseExpression | DefaultCaseExpression;
export type LogicExpression = IfStatement<BlockExpression>
                            | ElseIfStatement<BlockExpression>
                            | IfElseBlock<BlockExpression>
                            | SwitchExpression;
export type BlockExpression = LogicExpression | AssignmentExpression;

// TODO: In future, support generically-typed Switch and If expressions
// e.g. Switch<'combinational'> vs Switch<'sync'>
// not sure if this is possible
export type CombinationalLogic = AssignmentExpression;


export type SyncBlock  = {
  signal: SignalT;
  edge: Edge;
  block: BlockExpression[];
}

export type ModuleSignalDescriptor = {
  type: 'input' | 'internal' | 'output' | 'wire';
  signal: Port;
  name: string;
};

export interface ModuleCodeElements {
  type: "moduleCodeElements";
  header: string;
  internalRegisters: string;
  internalWires: string;
  wireDeclarations: string;
  initialBlock: string;
  assignments: string;
  vendorModules: string;
  submodules: string;
  combLogic: string;
  syncBlocks: string;
};

export interface SimulationCodeElements {
  type: "simulationCodeElements";
  timescale: string;
  header: string;
  registers: string;
  wires: string;
  submodules: string;
  everyTimescaleBlocks: string;
  simulationRunBlock: string;
  vcdBlock: string;
};

export type CodeElements = ModuleCodeElements | SimulationCodeElements;

export type GeneratedVerilogObject = {
  code: CodeElements;
  submodules: GWModule[];
};

export type SubmodulePortMappping = {
  inputs: { [input:string]: Port };
  outputs: { [output:string]: Port[] };
};

export type PortWiring = { [portName:string]: string; };

export type SubmoduleReference = {
  m: GWModule;
  mapping: SubmodulePortMappping;
  submoduleName: string;
};

export type VendorModuleReference = {
  m: VendorModule<any>;
  mapping: SubmodulePortMappping;
};

export type ModuleDescriptorObject = {
  m:GWModule,
  descriptor:ModuleSignalDescriptor,
};

export type SignalMap = {
  input: Map<Port, string>,
  internal: Map<Port, string>,
  output: Map<Port, string>,
  wire: Map<Port, string>
};

export type DrivenSignal = {
  signal: SignalT;
  name: string;
};

export type ParameterString = {
  type: 'parameterString',
  value: string;
};

export type VendorSignalMap = {
  input: Map<Port, string>,
  output: Map<Port, string>,
};


export type SimulationExpression  = BlockExpression
                                  | EdgeAssertion
                                  | RepeatedEdgeAssertion
                                  | DisplayExpression
                                  | FinishExpression
                                  | IfStatement<SimulationExpression>
                                  | ElseIfStatement<SimulationExpression>
                                  | IfElseBlock<SimulationExpression>;

export type IfStatementLike<BodyExprsT> = IfStatement<BodyExprsT> | ElseIfStatement<BodyExprsT>;

export type BlockExpressionsAndTime = [number, BlockExpression[]];
export interface EdgeAssertion {
  type: 'edgeAssertion';
  edgeType: Edge;
  signal: Port;
};
export interface RepeatedEdgeAssertion {
  type: 'repeatedEdgeAssertion';
  signal: Port;
  edgeType: Edge;
  n: number;
}
export interface DisplayExpression {
  type: 'displayExpression';
  messages: (string | SignalT)[];
}

export interface FinishExpression {
  type: 'finishExpression';
}

export enum TimeScale {
  Nanoseconds,
  Picoseconds,
  Milleseconds,
  Microseconds
};

export type TimeScaleValue = {
  type: 'timescaleValue';
  timescale: TimeScale;
  value: number;
};
