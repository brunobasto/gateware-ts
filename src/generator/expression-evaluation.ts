import { COMPARRISON_EXPRESSION, OPERATION_EXPRESSION, SLICE, BOOLEAN_EXPRESSION, CONCAT } from './../constants';
import { UnaryExpression, Operation, SignalLikeOrValue, TernaryExpression, ComparrisonExpression, ComparrisonOperation, OperationExpression, SignalLike, BooleanOperation } from './../main-types';
import { GWModule } from "../gw-module"
import { SignalT, WireT, ConstantT, SliceT, ConcatT, BooleanExpression } from "../signals";
import { SIGNAL, WIRE, CONSTANT, UNARY_EXPRESSION, TERNARY_EXPRESSION } from '../constants';

const parenthize = (s:SignalLike, fn:(s:SignalLikeOrValue) => string):string =>
  (s.type === SIGNAL || s.type === WIRE) ? fn(s) : `(${fn(s)})`;

export class ExpressionEvaluator {
  private workingModule: GWModule;
  private signalResolver: (s:SignalT) => string;

  constructor(m:GWModule, resolveSignal?:(s:SignalT) => string) {
    this.workingModule = m;

    this.signalResolver = resolveSignal
      ? resolveSignal
      : s => this.workingModule.getModuleSignalDescriptor(s).name;

    this.evaluate = this.evaluate.bind(this);
  }

  setWorkingModule(m:GWModule) {
    this.workingModule = m;
  }

  evaluate(expr:SignalLikeOrValue) {
    if (typeof expr === 'number') {
      return expr.toString();
    }

    switch (expr.type) {
      case SIGNAL:{
        return this.signalResolver(expr as SignalT);
      }
      case WIRE:{
        return this.evaluateWire(expr as WireT);
      }
      case CONSTANT:{
        return this.evaluateConstant(expr as ConstantT);
      }
      case CONCAT:{
        return this.evaluateConcat(expr as ConcatT);
      }
      case UNARY_EXPRESSION:{
        return this.evaluateUnaryExpression(expr as UnaryExpression);
      }
      case COMPARRISON_EXPRESSION:{
        return this.evaluateComparrisonExpression(expr as ComparrisonExpression);
      }
      case TERNARY_EXPRESSION:{
        return this.evaluateTernaryExpression(expr as TernaryExpression);
      }
      case TERNARY_EXPRESSION:{
        return this.evaluateTernaryExpression(expr as TernaryExpression);
      }
      case BOOLEAN_EXPRESSION:{
        return this.evaluateBooleanExpression(expr as BooleanExpression);
      }
      case OPERATION_EXPRESSION: {
        return this.evaluateOperationExpression(expr as OperationExpression);
      }
      case SLICE: {
        return this.evaluateSlice(expr as SliceT);
      }
      default: {
        debugger;
        throw new Error('Unrecognised expression type');
      }
    }
  }

  evaluateWire(s:SignalT | WireT) {
    return this.workingModule.getModuleSignalDescriptor(s).name;
  }

  evaluateConstant(c:ConstantT) {
    return `${c.width}'b${c.value.toString(2).padStart(c.width, '0')}`;
  }

  evaluateConcat(c:ConcatT) {
    return `{${c.signals.map(this.evaluate).join(', ')}}`;
  }

  evaluateUnaryExpression(u:UnaryExpression) {
    switch (u.op) {
      case Operation.Not: {
        return `~${parenthize(u.a, this.evaluate)}`;
      }

      case Operation.LogicalNot: {
        return `!${parenthize(u.a, this.evaluate)}`;
      }

      default: {
        throw new Error(`Unrecognised unary operation`);
      }
    }
  }

  evaluateComparrisonExpression(c:ComparrisonExpression) {
    let op:string;

    if (c.comparrisonOp === ComparrisonOperation.Equal)
      op = '==';
    else if (c.comparrisonOp === ComparrisonOperation.GreaterThan)
      op = '>';
    else if (c.comparrisonOp === ComparrisonOperation.GreaterThanOrEqualTo)
      op = '>=';
    else if (c.comparrisonOp === ComparrisonOperation.LessThan)
      op = '<';
    else if (c.comparrisonOp === ComparrisonOperation.LessThanOrEqualTo)
      op = '<=';
    else if (c.comparrisonOp === ComparrisonOperation.NotEqual)
      op = '!=';
    else
      throw new Error(`Unrecognised comparrison operation`);

    return `${parenthize(c.a, this.evaluate)} ${op} ${this.evaluate(c.b)}`;
  }

  evaluateBooleanExpression(expr:BooleanExpression) {
    let op:string;

    switch (expr.op) {
      case BooleanOperation.And: {
        op = '&';
        break;
      }
      case BooleanOperation.Or: {
        op = '|';
        break;
      }
      case BooleanOperation.LogicalAnd: {
        op = '&&';
        break;
      }
      case BooleanOperation.LogicalOr: {
        op = '||';
        break;
      }
      case BooleanOperation.Xor: {
        op = '^';
        break;
      }
      case BooleanOperation.LeftShift: {
        op = '<<';
        break;
      }
      case BooleanOperation.LeftArithmeticShift: {
        op = '<<<';
        break;
      }
      case BooleanOperation.RightShift: {
        op = '>>';
        break;
      }
      case BooleanOperation.RightArithmeticShift: {
        op = '>>>';
        break;
      }
      default: {
        throw new Error(`Unrecognised boolean operation`);
      }
    }

    return `${parenthize(expr.a, this.evaluate)} ${op} ${this.evaluate(expr.b)}`;
  }

  evaluateTernaryExpression(t:TernaryExpression) {
    return `${this.evaluateComparrisonExpression(t.comparrison)} ? ${this.evaluate(t.a)} : ${this.evaluate(t.b)}`;
  }

  evaluateOperationExpression(o:OperationExpression) {
    let op:string;
    if (o.op === Operation.Plus)
      op = '+';
    else if (o.op === Operation.Minus)
      op = '-';
    else
      throw new Error('Unrecognised binary operation');

    return `${parenthize(o.a, this.evaluate)} ${op} ${this.evaluate(o.b)}`;
  }

  evaluateSlice(s:SliceT) {
    return (s.fromBit === s.toBit)
      ? `${parenthize(s.a, this.evaluate)}[${s.fromBit}]`
      : `${parenthize(s.a, this.evaluate)}[${s.fromBit}:${s.toBit}]`;
  }
}
