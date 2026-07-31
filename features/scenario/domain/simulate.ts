/**
 * Task 18: Scenario Simulator — immutable execution plan.
 */
import { type Exact, exact } from '@/core/domain/decimal';
import { canonicalJson, sha256Hex } from '@/core/domain/canonical-json';

export interface ScenarioAssumption {
  readonly key: string;
  readonly label: string;
  readonly baselineValue: Exact;
  readonly targetValue: Exact;
  readonly unit: string;
}

export interface ScenarioAction {
  readonly actionType: string;
  readonly description: string;
  readonly assumptions: readonly ScenarioAssumption[];
}

export interface SimulationInput {
  readonly companyId: string;
  readonly scenarioName: string;
  readonly actions: readonly ScenarioAction[];
  readonly baselineTco2e: Exact;
  readonly targetYear: number;
}

export interface SimulationResult {
  readonly projectedTco2e: Exact;
  readonly reductionTco2e: Exact;
  readonly reductionPct: Exact;
  readonly actionResults: readonly ActionResult[];
}

export interface ActionResult {
  readonly actionType: string;
  readonly reductionTco2e: Exact;
  readonly reductionPct: Exact;
}

export interface ExecutionPlan {
  readonly planHash: string;
  readonly createdAt: Date;
  readonly assumptions: readonly ScenarioAssumption[];
  readonly result: SimulationResult;
  readonly inputSnapshot: string;
}

/**
 * Run scenario simulation (simplified linear model for MVP).
 */
export function simulateScenario(input: SimulationInput): SimulationResult {
  let totalReduction = exact(0);
  const actionResults: ActionResult[] = [];

  for (const action of input.actions) {
    let actionReduction = exact(0);
    for (const assumption of action.assumptions) {
      const delta = assumption.baselineValue.minus(assumption.targetValue) as Exact;
      actionReduction = actionReduction.plus(delta.abs()) as Exact;
    }
    const reductionPct = input.baselineTco2e.isZero()
      ? exact(0)
      : (actionReduction.dividedBy(input.baselineTco2e).times(100) as Exact);

    actionResults.push({
      actionType: action.actionType,
      reductionTco2e: actionReduction,
      reductionPct,
    });
    totalReduction = totalReduction.plus(actionReduction) as Exact;
  }

  const projectedTco2e = input.baselineTco2e.minus(totalReduction) as Exact;
  const reductionPct = input.baselineTco2e.isZero()
    ? exact(0)
    : (totalReduction.dividedBy(input.baselineTco2e).times(100) as Exact);

  return { projectedTco2e, reductionTco2e: totalReduction, reductionPct, actionResults };
}

/**
 * Create an immutable execution plan.
 * This is what gets stored on adoption (Task 18.13).
 * MVP does NOT call Marketplace_Service.
 */
export function createExecutionPlan(
  input: SimulationInput,
  result: SimulationResult
): ExecutionPlan {
  const inputSnapshot = canonicalJson(input);
  const planHash = sha256Hex(inputSnapshot);
  const allAssumptions = input.actions.flatMap((a) => a.assumptions);

  return {
    planHash,
    createdAt: new Date(),
    assumptions: allAssumptions,
    result,
    inputSnapshot,
  };
}
