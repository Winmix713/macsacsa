export type PredictionResponse = {
  tip: "H" | "D" | "A";
  probs: {
    H: number;
    D: number;
    A: number;
  };
  "pattern_1_score (H)": number;
  confidence: number;
  rationale: {
    directed_pair: string;
    hist_n: number;
    curr_n: number;
    weights: {
      hist: number;
      curr: number;
    };
  };
  version: string;
};
