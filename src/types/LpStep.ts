import type { LpScreen } from "./LpScreen";
import type { LpStatus } from "./LpStatus";

export type LpStep = {
  id: string;
  screen: LpScreen;
  title: string;
  copy: string;
  status: LpStatus;
  tab: string;
  track: number;
};
