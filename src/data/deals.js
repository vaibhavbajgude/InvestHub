// ─── Mock Deals Dataset (75 records) ─────────────────────────────────────────
const industries = [
  'FinTech', 'HealthTech', 'EdTech', 'CleanEnergy', 'SaaS',
  'AI/ML', 'E-Commerce', 'BioTech', 'Logistics', 'Cybersecurity',
];

const riskLevels = ['Low', 'Medium', 'High'];
const stages     = ['Seed', 'Series A', 'Series B', 'Series C', 'Growth'];
const statuses   = ['Active', 'Closed', 'Pending'];

const companies = [
  'Nexus Capital','AuraVault','TrueLeap','HelioPay','MedSync',
  'LumoLearn','SolarGrid','CloudAxis','NeuroLink','ShieldByte',
  'SwiftLogix','BioNova','EduFlow','QuantEdge','GreenPulse',
  'VaultAI','DataBridge','ZenCure','PixelChain','OmniHealth',
  'RippleFinance','ClearPath','DeepRoute','FluxEnergy','StratoSaaS',
  'AlgoRisk','RetailGenius','CodeLaunch','CyberGuard','VisionAI',
  'TerraBlock','SkyNet Finance','HorizonBio','SparkLearn','PrimePay',
  'InnovateMed','NetGateway','CoreLogic','BrightEdge','FrontierAI',
  'PureEnergy','TradeCircle','SecureLayer','MicroLens','DataNest',
  'FusionPay','GlobalMedix','SmartRoute','CloudBurst','EcoVentures',
  'CipherTech','NanoLeap','MarketBridge','HealthFirst','ApexFinance',
  'QuantumIO','FlowCommerce','VaultChain','PredictaAI','ClearSight',
  'BioStream','SolarMesh','LearnPath','FinSecure','CodeNova',
  'SynapseAI','MedBridge','EcoGrid','TradeVault','LogiQuick',
  'DataSpark','TechNova','HealthBridge','SmartPay','CloudSecure',
  'AIVentures',
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateDeals() {
  const rand = seededRandom(42);
  return Array.from({ length: 75 }, (_, i) => {
    const r        = rand;
    const industry = industries[Math.floor(rand() * industries.length)];
    const risk     = riskLevels[Math.floor(rand() * riskLevels.length)];
    const stage    = stages[Math.floor(rand() * stages.length)];
    const status   = statuses[Math.floor(rand() * statuses.length)];
    const roi      = +(8 + rand() * 42).toFixed(1);           // 8–50%
    const minInv   = Math.round((50 + rand() * 450) * 1000);  // $50K–$500K
    const maxInv   = minInv + Math.round((100 + rand() * 900) * 1000);
    const raised   = Math.round(rand() * maxInv * 0.9);
    const year     = 2019 + Math.floor(rand() * 5);
    const month    = 1 + Math.floor(rand() * 12);
    const day      = 1 + Math.floor(rand() * 28);
    const score    = +(rand() * 10).toFixed(1);

    return {
      id:              `deal-${String(i + 1).padStart(3, '0')}`,
      company:         companies[i] || `Company ${i + 1}`,
      industry,
      risk,
      stage,
      status,
      roi,
      minInvestment:   minInv,
      maxInvestment:   maxInv,
      raised,
      targetAmount:    maxInv,
      foundedYear:     2010 + Math.floor(rand() * 10),
      dealDate:        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      description:     `${companies[i] || `Company ${i + 1}`} is a leading ${industry} company disrupting the market with innovative solutions and strong growth trajectory.`,
      team:            Math.floor(10 + rand() * 490),
      revenueGrowth:   +(15 + rand() * 85).toFixed(1),
      churnRate:       +(1 + rand() * 9).toFixed(1),
      arr:             Math.round((0.5 + rand() * 49.5) * 1e6),
      burnRate:        Math.round((50 + rand() * 450) * 1000),
      runway:          Math.floor(6 + rand() * 30),
      matchScore:      score,
      investors:       Math.floor(1 + rand() * 20),
    };
  });
}

export const deals = generateDeals();
