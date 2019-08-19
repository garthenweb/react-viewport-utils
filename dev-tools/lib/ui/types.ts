export interface IDevToolListener {
  updatesOnScroll: boolean;
  updatesOnDimensions: boolean;
  updatesOnIdle: boolean;
  priority: string;
  type: string;
  displayName?: string;
  id: string;
  iterations: number;
  averageLayoutCost: number;
  averageExecutionCost: number;
  skippedIterations: number;
  minLayoutCost: number;
  maxLayoutCost: number;
  lastLayoutCost: number;
  minExecutionCost: number;
  maxExecutionCost: number;
  lastExecutionCost: number;
  totalSkippedIterations: number;
}
