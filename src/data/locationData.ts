
export interface CityOption {
  name: string;
  zipCodes: string[];
}

export interface StateOption {
  name: string;
  cities: CityOption[];
}

export const stateData: StateOption[] = [
  {
    name: "Texas",
    cities: [
      {
        name: "Austin",
        zipCodes: ["78701", "78702", "78703", "78704", "78705"]
      },
      {
        name: "Dallas",
        zipCodes: ["75201", "75202", "75203", "75204", "75205"]
      },
      {
        name: "Houston",
        zipCodes: ["77001", "77002", "77003", "77004", "77005"]
      },
      {
        name: "San Antonio",
        zipCodes: ["78201", "78202", "78203", "78204", "78205"]
      },
      {
        name: "Fort Worth",
        zipCodes: ["76101", "76102", "76103", "76104", "76105"]
      }
    ]
  },
  {
    name: "California",
    cities: [
      {
        name: "Los Angeles",
        zipCodes: ["90001", "90002", "90003", "90004", "90005"]
      },
      {
        name: "San Francisco",
        zipCodes: ["94102", "94103", "94104", "94105", "94107"]
      },
      {
        name: "San Diego",
        zipCodes: ["92101", "92102", "92103", "92104", "92105"]
      },
      {
        name: "Sacramento",
        zipCodes: ["95811", "95814", "95816", "95818", "95820"]
      },
      {
        name: "San Jose",
        zipCodes: ["95110", "95111", "95112", "95113", "95116"]
      }
    ]
  }
];

export const getStateOptions = () => {
  return stateData.map(state => state.name);
};

export const getCityOptions = (stateName: string) => {
  const state = stateData.find(s => s.name === stateName);
  return state ? state.cities.map(city => city.name) : [];
};

export const getZipCodeOptions = (stateName: string, cityName: string) => {
  const state = stateData.find(s => s.name === stateName);
  if (!state) return [];
  
  const city = state.cities.find(c => c.name === cityName);
  return city ? city.zipCodes : [];
};
