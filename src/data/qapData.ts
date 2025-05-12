
export interface CategoryScore {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  currentPoints: number;
}

export interface QAPData {
  state: string;
  categories: CategoryScore[];
  totalMaxPoints: number;
}

export const texasQAPData: QAPData = {
  state: "Texas",
  categories: [
    {
      id: "financial",
      name: "Financial Feasibility and Cost of Development",
      description: "Points awarded based on cost per square foot and financial feasibility of the development.",
      maxPoints: 14,
      currentPoints: 0
    },
    {
      id: "location",
      name: "Development Location",
      description: "Points for developments in areas with high opportunity indices, proximity to amenities, and underserved areas.",
      maxPoints: 17,
      currentPoints: 0
    },
    {
      id: "specialNeeds",
      name: "Tenant Populations with Special Needs",
      description: "Incentivizes support for individuals with disabilities or homelessness.",
      maxPoints: 5,
      currentPoints: 0
    },
    {
      id: "incomeLevels",
      name: "Income and Rent Levels of Tenants",
      description: "Encourages deeper income targeting and reduced rents.",
      maxPoints: 16,
      currentPoints: 0
    },
    {
      id: "units",
      name: "Size and Quality of Units",
      description: "Rewards for larger unit sizes and inclusion of amenities.",
      maxPoints: 7,
      currentPoints: 0
    },
    {
      id: "services",
      name: "Tenant Services",
      description: "Points for providing supportive services like education, health, etc.",
      maxPoints: 10,
      currentPoints: 0
    },
    {
      id: "readiness",
      name: "Readiness to Proceed",
      description: "Scores readiness for construction start.",
      maxPoints: 10,
      currentPoints: 0
    },
    {
      id: "experience",
      name: "Development Team Experience",
      description: "Considers the team's history with successful LIHTC projects.",
      maxPoints: 10,
      currentPoints: 0
    },
    {
      id: "priorities",
      name: "State Housing Priorities",
      description: "Rewards alignment with state-specific goals (rural housing, preservation).",
      maxPoints: 10,
      currentPoints: 0
    },
    {
      id: "eviction",
      name: "Eviction Prevention Plans",
      description: "Incentivizes structured eviction prevention with case management.",
      maxPoints: 5,
      currentPoints: 0
    }
  ],
  totalMaxPoints: 104
};

export const californiaQAPData: QAPData = {
  state: "California",
  categories: [
    {
      id: "financial",
      name: "Financial Feasibility and Cost of Development",
      description: "Points awarded based on cost per square foot and financial feasibility of the development.",
      maxPoints: 12,
      currentPoints: 0
    },
    {
      id: "location",
      name: "Development Location",
      description: "Points for developments in areas with high opportunity indices, proximity to amenities, and underserved areas.",
      maxPoints: 15,
      currentPoints: 0
    },
    {
      id: "specialNeeds",
      name: "Tenant Populations with Special Needs",
      description: "Incentivizes support for individuals with disabilities or homelessness.",
      maxPoints: 5,
      currentPoints: 0
    },
    {
      id: "incomeLevels",
      name: "Income and Rent Levels of Tenants",
      description: "Encourages deeper income targeting and reduced rents.",
      maxPoints: 10,
      currentPoints: 0
    },
    {
      id: "units",
      name: "Size and Quality of Units",
      description: "Rewards for larger unit sizes and inclusion of amenities.",
      maxPoints: 8,
      currentPoints: 0
    },
    {
      id: "services",
      name: "Tenant Services",
      description: "Points for providing supportive services like education, health, etc.",
      maxPoints: 6,
      currentPoints: 0
    },
    {
      id: "readiness",
      name: "Readiness to Proceed",
      description: "Scores readiness for construction start.",
      maxPoints: 5,
      currentPoints: 0
    },
    {
      id: "experience",
      name: "Development Team Experience",
      description: "Considers the team's history with successful LIHTC projects.",
      maxPoints: 4,
      currentPoints: 0
    },
    {
      id: "priorities",
      name: "State Housing Priorities",
      description: "Rewards alignment with state-specific goals (rural housing, preservation).",
      maxPoints: 12,
      currentPoints: 0
    },
    {
      id: "eviction",
      name: "Eviction Prevention Plans",
      description: "Incentivizes structured eviction prevention with case management.",
      maxPoints: 4,
      currentPoints: 0
    }
  ],
  totalMaxPoints: 81
};
