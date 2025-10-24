/* eslint-disable @typescript-eslint/no-explicit-any */
export class DataProcessorService {
  static getTotalPassedChecks(scanData: any): number {
    if (!scanData.accessibility?.results) return 0;
    return scanData.accessibility.results.reduce(
      (total: number, result: any) => {
        return total + (result.passes?.length || 0);
      },
      0
    );
  }

  static getTotalViolations(scanData: any): number {
    if (!scanData.accessibility?.results) return 0;
    return scanData.accessibility.results.reduce(
      (total: number, result: any) => {
        return total + (result.violations?.length || 0);
      },
      0
    );
  }

  static getSuccessfulPages(pages: any[]): number {
    if (!pages || pages.length === 0) return 0;
    return pages.filter((page) => page.statusCode === 200).length;
  }

  static getTotalPassedChecksMultiple(results: any[]): number {
    if (!results || results.length === 0) return 0;
    return results.reduce((total, result) => {
      return total + (result.passes?.length || 0);
    }, 0);
  }

  static getTotalViolationsMultiple(results: any[]): number {
    if (!results || results.length === 0) return 0;
    return results.reduce((total, result) => {
      return total + (result.violations?.length || 0);
    }, 0);
  }
}
