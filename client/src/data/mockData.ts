export interface DomainScores {
  Access: number;
  Equity: number;
  Quality: number;
  Infrastructure: number;
  Governance: number;
  Outcomes: number;
}

export interface StateData {
  id: string; // ISO Code e.g. KL, MH, DL
  name: string;
  type: "STATE" | "UT";
  region: "North" | "South" | "East" | "West" | "Northeast" | "Central";
  scores: DomainScores;
  baseScore: number;
  baseRank: number;
  stateOfSchooling?: string;
  regulatoryFramework?: string;
  indicators: {
    [domainKey: string]: {
      name: string;
      score: number;
      indicatorsList: { name: string; score: number; status: "Yes" | "Limited" | "No" | string }[];
    }[];
  };
}

export const DOMAINS = [
  { id: "Access", name: "Domain-1", defaultWeight: 16, icon: "gavel" },
  { id: "Equity", name: "Domain-2", defaultWeight: 17, icon: "groups" },
  { id: "Quality", name: "Domain-3", defaultWeight: 17, icon: "verified" },
  { id: "Infrastructure", name: "Domain-4", defaultWeight: 16, icon: "school" },
  { id: "Governance", name: "Domain-5", defaultWeight: 17, icon: "account_balance" },
  { id: "Outcomes", name: "Domain-6", defaultWeight: 17, icon: "leaderboard" },
];

export const STATES_RAW_DATA: Omit<StateData, "baseScore" | "baseRank">[] = [
  {
    id: "KL",
    name: "Kerala",
    type: "STATE",
    region: "South",
    scores: { Access: 96, Equity: 94, Quality: 90, Infrastructure: 92, Governance: 88, Outcomes: 92 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "GA",
    name: "Goa",
    type: "STATE",
    region: "West",
    scores: { Access: 94, Equity: 91, Quality: 89, Infrastructure: 95, Governance: 84, Outcomes: 90 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "TN",
    name: "Tamil Nadu",
    type: "STATE",
    region: "South",
    scores: { Access: 91, Equity: 89, Quality: 88, Infrastructure: 90, Governance: 86, Outcomes: 87 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "HP",
    name: "Himachal Pradesh",
    type: "STATE",
    region: "North",
    scores: { Access: 92, Equity: 92, Quality: 84, Infrastructure: 88, Governance: 82, Outcomes: 85 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "MH",
    name: "Maharashtra",
    type: "STATE",
    region: "West",
    scores: { Access: 88, Equity: 87, Quality: 86, Infrastructure: 85, Governance: 84, Outcomes: 84 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "GJ",
    name: "Gujarat",
    type: "STATE",
    region: "West",
    scores: { Access: 89, Equity: 82, Quality: 83, Infrastructure: 87, Governance: 89, Outcomes: 80 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "PB",
    name: "Punjab",
    type: "STATE",
    region: "North",
    scores: { Access: 90, Equity: 85, Quality: 81, Infrastructure: 86, Governance: 80, Outcomes: 82 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "KA",
    name: "Karnataka",
    type: "STATE",
    region: "South",
    scores: { Access: 86, Equity: 83, Quality: 82, Infrastructure: 84, Governance: 82, Outcomes: 83 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "HR",
    name: "Haryana",
    type: "STATE",
    region: "North",
    scores: { Access: 87, Equity: 81, Quality: 80, Infrastructure: 82, Governance: 79, Outcomes: 81 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "AP",
    name: "Andhra Pradesh",
    type: "STATE",
    region: "South",
    scores: { Access: 84, Equity: 80, Quality: 78, Infrastructure: 81, Governance: 80, Outcomes: 79 },
    stateOfSchooling: "Andhra Pradesh has a large school-going population of nearly 8.45 million students, of which 55.6% are enrolled in private schools. Although there is a high enrolment share in private schools, these schools account for only 25.2% of total schools, suggesting a very high concentration of enrolment in private institutions.\n\nAndhra Pradesh performs best in Ease of Financial Sustainability & Resource Mobilization, indicating that the regulatory framework provides schools greatest flexibility in matters relating to fee regulation and financial management. The large gap between the State's scores and national averages in Domain 6 also indicates that the state education laws provide a degree of flexibility in internal management. At the same time, the State's relatively weak performance in Domain 3 suggests that procedural safeguards against discretionary regulatory action remain limited, especially in areas relating to inspections and adverse administrative powers.",
    regulatoryFramework: "The regulatory framework requires prior permission to establish a school, which is granted based on applications invited through official notifications. Permission is contingent on multiple conditions, including infrastructure norms, availability of endowment funds, demonstration of educational need, and obtaining NoCs from relevant authorities. Recognition follows a stage-wise process, beginning with a provisional recognition-cum-registration certificate, renewable every three years up to nine years, after which permanent recognition may be granted subject to continued compliance. Schools are required to operate on a not-for-profit basis, meet RTE norms, reserve 25% seats for EWS students, form PTAs, and maintain prescribed endowment funds.\n\nOperational regulations include prior approval for upgradation of classes, mandatory approval of appointments by the competent authority, and restrictions on dismissal of staff without enquiry and approval. Teacher recruitment must be publicly advertised, and salary structures are guided by a state-level committee. Curriculum and textbooks are prescribed by the government unless the school affiliates with a non-state board, and a three-language formula is mandated.\n\nThe government has the authority to conduct inspections as deemed necessary. The state has two boards, the Andhra Pradesh Board of Secondary Education and the Andhra Pradesh Board of Intermediate Education, for affiliation purposes. Fee regulation involves school-level governing bodies and advisory bodies that determine fee structures based on prescribed criteria. Regulations also specify the distribution of school revenues across salaries, maintenance, development, and other heads.\n\nUnder RTE provisions, reimbursements are determined by a state-level committee and disbursed in two installments through designated bank accounts, subject to verification of enrollment, attendance, and learning outcomes. Recognition and permission may be withdrawn in case of non-compliance after due notice. Appeals lie with the collector, and revision powers rest with the Commissioner and Director of School Education.",
    indicators: {},
  },
  {
    id: "TG",
    name: "Telangana",
    type: "STATE",
    region: "South",
    scores: { Access: 85, Equity: 79, Quality: 77, Infrastructure: 80, Governance: 78, Outcomes: 78 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "SK",
    name: "Sikkim",
    type: "STATE",
    region: "Northeast",
    scores: { Access: 88, Equity: 86, Quality: 76, Infrastructure: 78, Governance: 75, Outcomes: 76 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "UT",
    name: "Uttarakhand",
    type: "STATE",
    region: "North",
    scores: { Access: 82, Equity: 80, Quality: 75, Infrastructure: 77, Governance: 74, Outcomes: 75 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "RJ",
    name: "Rajasthan",
    type: "STATE",
    region: "North",
    scores: { Access: 80, Equity: 74, Quality: 78, Infrastructure: 76, Governance: 78, Outcomes: 72 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "MP",
    name: "Madhya Pradesh",
    type: "STATE",
    region: "Central",
    scores: { Access: 78, Equity: 72, Quality: 74, Infrastructure: 73, Governance: 75, Outcomes: 70 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "WB",
    name: "West Bengal",
    type: "STATE",
    region: "East",
    scores: { Access: 81, Equity: 79, Quality: 71, Infrastructure: 72, Governance: 70, Outcomes: 72 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "OD",
    name: "Odisha",
    type: "STATE",
    region: "East",
    scores: { Access: 79, Equity: 73, Quality: 72, Infrastructure: 70, Governance: 74, Outcomes: 69 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "CG",
    name: "Chhattisgarh",
    type: "STATE",
    region: "Central",
    scores: { Access: 77, Equity: 71, Quality: 70, Infrastructure: 71, Governance: 72, Outcomes: 68 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "UP",
    name: "Uttar Pradesh",
    type: "STATE",
    region: "North",
    scores: { Access: 74, Equity: 65, Quality: 68, Infrastructure: 69, Governance: 71, Outcomes: 64 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "JH",
    name: "Jharkhand",
    type: "STATE",
    region: "East",
    scores: { Access: 72, Equity: 66, Quality: 65, Infrastructure: 67, Governance: 68, Outcomes: 62 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "BR",
    name: "Bihar",
    type: "STATE",
    region: "East",
    scores: { Access: 70, Equity: 63, Quality: 64, Infrastructure: 65, Governance: 66, Outcomes: 60 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "AS",
    name: "Assam",
    type: "STATE",
    region: "Northeast",
    scores: { Access: 76, Equity: 72, Quality: 67, Infrastructure: 68, Governance: 69, Outcomes: 65 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "TR",
    name: "Tripura",
    type: "STATE",
    region: "Northeast",
    scores: { Access: 80, Equity: 78, Quality: 70, Infrastructure: 72, Governance: 71, Outcomes: 70 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "ML",
    name: "Meghalaya",
    type: "STATE",
    region: "Northeast",
    scores: { Access: 72, Equity: 70, Quality: 63, Infrastructure: 64, Governance: 67, Outcomes: 61 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "MN",
    name: "Manipur",
    type: "STATE",
    region: "Northeast",
    scores: { Access: 79, Equity: 77, Quality: 69, Infrastructure: 68, Governance: 70, Outcomes: 67 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "NL",
    name: "Nagaland",
    type: "STATE",
    region: "Northeast",
    scores: { Access: 75, Equity: 73, Quality: 66, Infrastructure: 65, Governance: 68, Outcomes: 63 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "MZ",
    name: "Mizoram",
    type: "STATE",
    region: "Northeast",
    scores: { Access: 85, Equity: 84, Quality: 75, Infrastructure: 76, Governance: 74, Outcomes: 75 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "AR",
    name: "Arunachal Pradesh",
    type: "STATE",
    region: "Northeast",
    scores: { Access: 71, Equity: 68, Quality: 62, Infrastructure: 63, Governance: 65, Outcomes: 60 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  // UTs
  {
    id: "DL",
    name: "Delhi",
    type: "UT",
    region: "North",
    scores: { Access: 95, Equity: 87, Quality: 88, Infrastructure: 96, Governance: 84, Outcomes: 89 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "CH",
    name: "Chandigarh",
    type: "UT",
    region: "North",
    scores: { Access: 97, Equity: 90, Quality: 89, Infrastructure: 97, Governance: 85, Outcomes: 91 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "PY",
    name: "Puducherry",
    type: "UT",
    region: "South",
    scores: { Access: 93, Equity: 88, Quality: 86, Infrastructure: 91, Governance: 82, Outcomes: 85 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "JK",
    name: "Jammu & Kashmir",
    type: "UT",
    region: "North",
    scores: { Access: 80, Equity: 76, Quality: 74, Infrastructure: 78, Governance: 73, Outcomes: 72 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "LA",
    name: "Ladakh",
    type: "UT",
    region: "North",
    scores: { Access: 78, Equity: 75, Quality: 71, Infrastructure: 74, Governance: 72, Outcomes: 70 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "DN",
    name: "Dadra & Nagar Haveli and Daman & Diu",
    type: "UT",
    region: "West",
    scores: { Access: 84, Equity: 78, Quality: 77, Infrastructure: 82, Governance: 76, Outcomes: 75 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "LD",
    name: "Lakshadweep",
    type: "UT",
    region: "South",
    scores: { Access: 87, Equity: 83, Quality: 76, Infrastructure: 80, Governance: 75, Outcomes: 74 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
  {
    id: "AN",
    name: "Andaman & Nicobar Islands",
    type: "UT",
    region: "East",
    scores: { Access: 86, Equity: 82, Quality: 78, Infrastructure: 83, Governance: 77, Outcomes: 76 },
    stateOfSchooling: "Data for this state is currently being compiled...",
    regulatoryFramework: "Data for this state is currently being compiled...",
    indicators: {},
  },
];

// Precompute baseline ranks and indicator sub-hierarchies
export const STATES_DATA: StateData[] = (() => {
  const defaultWeights = { Access: 0.16, Equity: 0.17, Quality: 0.17, Infrastructure: 0.16, Governance: 0.17, Outcomes: 0.17 };
  
  const calculated = STATES_RAW_DATA.map((state) => {
    let score = 0;
    for (const d in defaultWeights) {
      const key = d as keyof DomainScores;
      score += state.scores[key] * defaultWeights[key];
    }
    
    // Generate mock structural sub-indicators
    const stateIndicators: StateData["indicators"] = {
      Access: [
        {
          name: "School Proximity",
          score: Math.round(state.scores.Access * 0.98),
          indicatorsList: [
            { name: "Primary school within 1km", score: 1.0, status: "Yes" },
            { name: "Upper primary school within 3km", score: 1.0, status: "Yes" },
            { name: "Secondary school within 5km", score: state.scores.Access > 80 ? 1.0 : 0.5, status: state.scores.Access > 80 ? "Yes" : "Limited" },
          ],
        },
        {
          name: "Enrolment Ease",
          score: Math.round(state.scores.Access * 1.02 > 100 ? 100 : state.scores.Access * 1.02),
          indicatorsList: [
            { name: "Single-window admission portal active", score: state.scores.Access > 85 ? 1.0 : 0.0, status: state.scores.Access > 85 ? "Yes" : "No" },
            { name: "Zero documentation requirement for homeless children", score: state.scores.Access > 75 ? 0.5 : 0.0, status: state.scores.Access > 75 ? "Limited" : "No" },
          ],
        },
      ],
      Equity: [
        {
          name: "Gender Parity",
          score: Math.round(state.scores.Equity * 1.01 > 100 ? 100 : state.scores.Equity * 1.01),
          indicatorsList: [
            { name: "Gender parity index in enrolment >= 0.98", score: 1.0, status: "Yes" },
            { name: "Specialized girls' transport allowances in place", score: state.scores.Equity > 82 ? 1.0 : 0.5, status: state.scores.Equity > 82 ? "Yes" : "Limited" },
          ],
        },
        {
          name: "Social Group Inclusion",
          score: Math.round(state.scores.Equity * 0.97),
          indicatorsList: [
            { name: "SC/ST enrolment ratio matches demographic ratio", score: state.scores.Equity > 85 ? 1.0 : 0.5, status: state.scores.Equity > 85 ? "Yes" : "Limited" },
            { name: "Bilingual instruction textbooks distributed", score: state.scores.Equity > 88 ? 1.0 : 0.0, status: state.scores.Equity > 88 ? "Yes" : "No" },
          ],
        },
      ],
      Quality: [
        {
          name: "Teacher Pupil Ratio",
          score: Math.round(state.scores.Quality * 0.95),
          indicatorsList: [
            { name: "PTR <= 30:1 in all primary schools", score: state.scores.Quality > 85 ? 1.0 : 0.5, status: state.scores.Quality > 85 ? "Yes" : "Limited" },
            { name: "PTR <= 35:1 in all secondary schools", score: state.scores.Quality > 90 ? 1.0 : 0.0, status: state.scores.Quality > 90 ? "Yes" : "No" },
          ],
        },
        {
          name: "Pedagogic Effectiveness",
          score: Math.round(state.scores.Quality * 1.05 > 100 ? 100 : state.scores.Quality * 1.05),
          indicatorsList: [
            { name: "Continuous evaluation frameworks operational", score: 1.0, status: "Yes" },
            { name: "Remedial teaching programmes for slow learners", score: state.scores.Quality > 78 ? 1.0 : 0.5, status: state.scores.Quality > 78 ? "Yes" : "Limited" },
          ],
        },
      ],
      Infrastructure: [
        {
          name: "Sanitation Facilities",
          score: Math.round(state.scores.Infrastructure * 1.03 > 100 ? 100 : state.scores.Infrastructure * 1.03),
          indicatorsList: [
            { name: "Functional boys toilets in all schools", score: 1.0, status: "Yes" },
            { name: "Functional, secure girls toilets with incineration facilities", score: state.scores.Infrastructure > 85 ? 1.0 : 0.5, status: state.scores.Infrastructure > 85 ? "Yes" : "Limited" },
          ],
        },
        {
          name: "Classroom Conditions",
          score: Math.round(state.scores.Infrastructure * 0.96),
          indicatorsList: [
            { name: "Electricity connection active in all classrooms", score: state.scores.Infrastructure > 80 ? 1.0 : 0.5, status: state.scores.Infrastructure > 80 ? "Yes" : "Limited" },
            { name: "Ramps and handrails for disabled children (CwSN)", score: state.scores.Infrastructure > 75 ? 1.0 : 0.0, status: state.scores.Infrastructure > 75 ? "Yes" : "No" },
          ],
        },
      ],
      Governance: [
        {
          name: "Fund Utilization",
          score: Math.round(state.scores.Governance * 0.98),
          indicatorsList: [
            { name: "Samagra Shiksha funds utilization > 90%", score: state.scores.Governance > 83 ? 1.0 : 0.5, status: state.scores.Governance > 83 ? "Yes" : "Limited" },
            { name: "Direct benefit transfers (DBT) matching schedule", score: 1.0, status: "Yes" },
          ],
        },
        {
          name: "Policy Implementation",
          score: Math.round(state.scores.Governance * 1.02 > 100 ? 100 : state.scores.Governance * 1.02),
          indicatorsList: [
            { name: "School Management Committees meeting monthly", score: state.scores.Governance > 80 ? 1.0 : 0.5, status: state.scores.Governance > 80 ? "Yes" : "Limited" },
            { name: "Public disclosure of school audits active", score: state.scores.Governance > 88 ? 1.0 : 0.0, status: state.scores.Governance > 88 ? "Yes" : "No" },
          ],
        },
      ],
      Outcomes: [
        {
          name: "Retention Metrics",
          score: Math.round(state.scores.Outcomes * 0.97),
          indicatorsList: [
            { name: "Transition rate from Primary to Upper Primary > 95%", score: state.scores.Outcomes > 85 ? 1.0 : 0.5, status: state.scores.Outcomes > 85 ? "Yes" : "Limited" },
            { name: "Dropout rate at secondary level < 5%", score: state.scores.Outcomes > 90 ? 1.0 : 0.0, status: state.scores.Outcomes > 90 ? "Yes" : "No" },
          ],
        },
        {
          name: "Literacy & Numeracy",
          score: Math.round(state.scores.Outcomes * 1.03 > 100 ? 100 : state.scores.Outcomes * 1.03),
          indicatorsList: [
            { name: "Basic reading proficiency grade 3 pupils > 75%", score: state.scores.Outcomes > 82 ? 1.0 : 0.5, status: state.scores.Outcomes > 82 ? "Yes" : "Limited" },
            { name: "Basic math/division proficiency grade 5 pupils > 70%", score: state.scores.Outcomes > 85 ? 1.0 : 0.5, status: state.scores.Outcomes > 85 ? "Yes" : "Limited" },
          ],
        },
      ],
    };

    return {
      ...state,
      baseScore: parseFloat(score.toFixed(2)),
      indicators: stateIndicators,
    } as StateData;
  });

  // Sort and assign base rank
  calculated.sort((a, b) => b.baseScore - a.baseScore);
  return calculated.map((state, index) => ({
    ...state,
    baseRank: index + 1,
  }));
})();
