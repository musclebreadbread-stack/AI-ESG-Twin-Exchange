/**
 * P2: Scope 3 — 15 Category Calculation Methods
 * Reference: GHG Protocol Corporate Value Chain (Scope 3) Standard
 *
 * Each category uses one of 4 methods: supplier-specific, hybrid, average-data, spend-based
 */
import { type Exact, exact } from '@/core/domain/decimal';
import { type Result, ok, err } from '@/core/domain/result';

export type Scope3Category = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export type Scope3Method = 'supplier_specific' | 'hybrid' | 'average_data' | 'spend_based';

export const SCOPE3_CATEGORY_NAMES: Record<Scope3Category, { ko: string; en: string }> = {
  1: { ko: '구매한 상품 및 서비스', en: 'Purchased goods and services' },
  2: { ko: '자본재', en: 'Capital goods' },
  3: { ko: '연료 및 에너지 관련 활동', en: 'Fuel- and energy-related activities' },
  4: { ko: '업스트림 운송·유통', en: 'Upstream transportation and distribution' },
  5: { ko: '사업에서 발생한 폐기물', en: 'Waste generated in operations' },
  6: { ko: '출장', en: 'Business travel' },
  7: { ko: '직원 통근', en: 'Employee commuting' },
  8: { ko: '업스트림 임대 자산', en: 'Upstream leased assets' },
  9: { ko: '다운스트림 운송·유통', en: 'Downstream transportation and distribution' },
  10: { ko: '판매된 제품의 가공', en: 'Processing of sold products' },
  11: { ko: '판매된 제품의 사용', en: 'Use of sold products' },
  12: { ko: '판매된 제품의 최종 처리', en: 'End-of-life treatment of sold products' },
  13: { ko: '다운스트림 임대 자산', en: 'Downstream leased assets' },
  14: { ko: '프랜차이즈', en: 'Franchises' },
  15: { ko: '투자', en: 'Investments' },
};

export interface Scope3Input {
  readonly category: Scope3Category;
  readonly method: Scope3Method;
  readonly activityData: Exact;
  readonly emissionFactor: Exact;
  readonly spendAmount?: Exact;
  readonly spendFactor?: Exact;
  readonly supplierEmission?: Exact;
  readonly allocationFactor?: Exact;
}

export type Scope3Error = 'MISSING_SPEND_DATA' | 'MISSING_SUPPLIER_DATA' | 'INVALID_ALLOCATION';

/**
 * Calculate Scope 3 emissions by category and method.
 *
 * Methods hierarchy (GHG Protocol):
 * 1. Supplier-specific: actual emission data from suppliers
 * 2. Hybrid: supplier data + secondary data for gaps
 * 3. Average-data: industry average EFs × activity quantity
 * 4. Spend-based: economic data × EEIO factors
 */
export function calculateScope3(
  input: Scope3Input
): Result<{ tco2e: Exact; method: Scope3Method; category: Scope3Category }, Scope3Error> {
  switch (input.method) {
    case 'supplier_specific': {
      if (!input.supplierEmission) return err('MISSING_SUPPLIER_DATA');
      const allocated = input.allocationFactor
        ? (input.supplierEmission.times(input.allocationFactor) as Exact)
        : input.supplierEmission;
      return ok({ tco2e: allocated, method: input.method, category: input.category });
    }

    case 'hybrid': {
      // Primary supplier data + secondary for gap
      const supplierPortion = input.supplierEmission ?? exact(0);
      const secondaryPortion = input.activityData.times(input.emissionFactor) as Exact;
      const total = supplierPortion.plus(secondaryPortion) as Exact;
      return ok({ tco2e: total, method: input.method, category: input.category });
    }

    case 'average_data': {
      // Activity quantity × average emission factor
      const tco2e = input.activityData.times(input.emissionFactor) as Exact;
      return ok({ tco2e, method: input.method, category: input.category });
    }

    case 'spend_based': {
      if (!input.spendAmount || !input.spendFactor) return err('MISSING_SPEND_DATA');
      const tco2e = input.spendAmount.times(input.spendFactor) as Exact;
      return ok({ tco2e, method: input.method, category: input.category });
    }
  }
}

/**
 * Determine if Scope 3 is material (>40% of total) per GHG Protocol.
 * If material, near-term target must cover ≥67% of Scope 3.
 */
export function assessScope3Materiality(
  scope1: Exact,
  scope2: Exact,
  scope3Total: Exact
): { isMaterial: boolean; scope3Pct: Exact; nearTermCoverageRequired: Exact } {
  const total = scope1.plus(scope2).plus(scope3Total) as Exact;
  if (total.isZero()) {
    return { isMaterial: false, scope3Pct: exact(0), nearTermCoverageRequired: exact(0) };
  }

  const scope3Pct = scope3Total.dividedBy(total).times(100) as Exact;
  const isMaterial = scope3Pct.greaterThan(40);
  const nearTermCoverageRequired = isMaterial ? exact(67) : exact(0);

  return { isMaterial, scope3Pct, nearTermCoverageRequired };
}
