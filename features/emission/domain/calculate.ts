/**
 * Task 10: Emission Calculation Engine — core calculation logic.
 * Performs tCO2e calculation using rational arithmetic only.
 */
import { type Exact, exact, sumExact } from '@/core/domain/decimal';
import { type Result, ok, err } from '@/core/domain/result';
import { canonicalJson, sha256Hex } from '@/core/domain/canonical-json';

export interface CalculationInput {
  readonly activityDataId: string;
  readonly canonicalValue: Exact;
  readonly canonicalUnit: string;
  readonly factorValue: Exact;
  readonly factorUnit: string;
  readonly gasCode: string;
  readonly gwpValue: Exact;
  readonly netCalorificValue?: Exact;
  readonly unitConversionFactor: Exact;
}

export interface CalculationOutput {
  readonly gasCode: string;
  readonly massT: Exact;
  readonly gwpApplied: Exact;
  readonly tco2e: Exact;
  readonly isBiogenic: boolean;
}

export interface EmissionCalculationResult {
  readonly totalTco2e: Exact;
  readonly biogenicCo2T: Exact;
  readonly gasAmounts: readonly CalculationOutput[];
  readonly fingerprint: string;
}

export type CalcError = 'INVALID_FACTOR' | 'INVALID_GWP' | 'ZERO_CONVERSION';

/**
 * Calculate emissions for a single activity-factor pair.
 * All arithmetic is Decimal (no floating-point).
 *
 * Formula: tCO2e = activity × NCV(if applicable) × factor × GWP
 */
export function calculateEmission(
  input: CalculationInput
): Result<EmissionCalculationResult, CalcError> {
  if (input.factorValue.isZero() || input.factorValue.isNeg()) {
    return err('INVALID_FACTOR');
  }
  if (input.gwpValue.isZero() || input.gwpValue.isNeg()) {
    return err('INVALID_GWP');
  }
  if (input.unitConversionFactor.isZero()) {
    return err('ZERO_CONVERSION');
  }

  // Step 1: Apply unit conversion
  const convertedActivity = input.canonicalValue.times(input.unitConversionFactor) as Exact;

  // Step 2: Apply NCV if required
  const afterNcv = input.netCalorificValue
    ? (convertedActivity.times(input.netCalorificValue) as Exact)
    : convertedActivity;

  // Step 3: Apply emission factor → mass of gas in tonnes
  const massT = afterNcv.times(input.factorValue) as Exact;

  // Step 4: Apply GWP → tCO2e
  const tco2e = massT.times(input.gwpValue) as Exact;

  const isBiogenic = input.gasCode === 'CO2_biogenic';

  const gasOutput: CalculationOutput = {
    gasCode: input.gasCode,
    massT: exact(massT),
    gwpApplied: exact(input.gwpValue),
    tco2e: exact(tco2e),
    isBiogenic,
  };

  // Fingerprint for deduplication
  const fingerprint = sha256Hex(
    canonicalJson({
      activityDataId: input.activityDataId,
      factorValue: input.factorValue.toString(),
      gwpValue: input.gwpValue.toString(),
      gasCode: input.gasCode,
    })
  );

  const totalTco2e = isBiogenic ? exact(0) : exact(tco2e);
  const biogenicCo2T = isBiogenic ? exact(tco2e) : exact(0);

  return ok({
    totalTco2e,
    biogenicCo2T,
    gasAmounts: [gasOutput],
    fingerprint,
  });
}

/**
 * Aggregate multiple gas results into a single emission total.
 */
export function aggregateEmissions(
  results: readonly EmissionCalculationResult[]
): { totalTco2e: Exact; biogenicCo2T: Exact } {
  return {
    totalTco2e: sumExact(results.map((r) => r.totalTco2e)),
    biogenicCo2T: sumExact(results.map((r) => r.biogenicCo2T)),
  };
}
