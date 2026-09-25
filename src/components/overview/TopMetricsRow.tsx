import React from 'react';
import { TrendingUp, Wind, Zap, Droplets, AlertTriangle } from 'lucide-react';
import { useCityPulse } from '../../context/CityPulseContext';
import { PageView } from '../../types/citypulse';

export const TopMetricsRow: React.FC = () => {
  const { openExplainModal, setActivePage, mapIncidents, dashboardMetrics } = useCityPulse();

  const getMetricState = (type: string, fallbackVal: number, fallbackTrend: string, invertPositive: boolean = false) => {
    const list = dashboardMetrics[type];

    // If no data at all, use fallback values
    if (!list || list.length === 0) {
      return { value: fallbackVal.toString(), trend: fallbackTrend, isPositive: true, source: 'live' };
    }

    const current = list[0];
    let prevValue = fallbackVal; // use fallback as baseline if we don't have a previous record
    if (list.length > 1) {
      prevValue = list[1].value;
    }

    let trendStr = '-';
    let isPositive = true;

    if (prevValue > 0) {
      const diff = current.value - prevValue;
      const pct = (diff / prevValue) * 100;
      const sign = diff >= 0 ? '+' : '';
      trendStr = `${sign}${pct.toFixed(1)}%`;

      if (diff > 0) isPositive = !invertPositive;
      else if (diff < 0) isPositive = invertPositive;
    }

    return {
      value: current.value.toString(),
      trend: trendStr,
      isPositive,
      source: current.source
    };
  };

  const trafficState = getMetricState('traffic_flow', 87, '+5%', false);
  const aqiState = getMetricState('air_quality', 62, '-8%', true);
  const utilState = getMetricState('energy_consumption', 2.4, '+3%', true);
  const waterState = getMetricState('water_usage', 1.8, '-3%', false);

  const currentIncidents = mapIncidents.length;
  const incidentsState = {
    value: currentIncidents.toString(),
    trend: '-',
    isPositive: currentIncidents <= 5,
    source: mapIncidents[0]?.source || 'live'
  };

  const metrics = [
    {
      id: 'traffic',
      page: 'traffic' as PageView,
      label: 'Traffic Flow',
      value: trafficState.value,
      unit: '%',
      trend: trafficState.trend,
      isPositive: trafficState.isPositive,
      source: trafficState.source,
      icon: TrendingUp,
      cardClass: 'card-glow-traffic',
      iconClass: 'icon-glow-traffic',
      badgeClass: 'badge-traffic',
      explainTitle: 'Traffic Flow Density',
      explainSummary: 'Overall arterial flow throughput across primary city corridors.'
    },
    {
      id: 'aqi',
      page: 'environment' as PageView,
      label: 'Air Quality Index',
      value: aqiState.value,
      unit: 'AQI',
      trend: aqiState.trend,
      isPositive: aqiState.isPositive,
      source: aqiState.source,
      icon: Wind,
      cardClass: 'card-glow-aqi',
      iconClass: 'icon-glow-aqi',
      badgeClass: 'badge-incidents',
      explainTitle: 'Air Quality Index',
      explainSummary: 'Atmospheric particulate AQI baseline telemetry.'
    },
    {
      id: 'energy',
      page: 'utilities' as PageView,
      label: 'Energy Consumption',
      value: utilState.value,
      unit: 'GW',
      trend: utilState.trend,
      isPositive: utilState.isPositive,
      source: utilState.source,
      icon: Zap,
      cardClass: 'card-glow-utilities',
      iconClass: 'icon-glow-utilities',
      badgeClass: 'badge-utilities',
      explainTitle: 'Grid Power Usage',
      explainSummary: 'Current power grid load telemetry.'
    },
    {
      id: 'water',
      page: 'utilities' as PageView,
      label: 'Water Distribution',
      value: waterState.value,
      unit: 'ML',
      trend: waterState.trend,
      isPositive: waterState.isPositive,
      source: waterState.source,
      icon: Droplets,
      cardClass: 'card-glow-weather',
      iconClass: 'icon-glow-weather',
      badgeClass: 'badge-weather',
      explainTitle: 'Municipal Water Distribution',
      explainSummary: 'Hourly municipal water throughput.'
    },
    {
      id: 'incidents',
      page: 'public-safety' as PageView,
      label: 'Active Incidents',
      value: incidentsState.value,
      unit: '',
      trend: incidentsState.trend,
      isPositive: incidentsState.isPositive,
      source: incidentsState.source,
      icon: AlertTriangle,
      cardClass: 'card-glow-incidents',
      iconClass: 'icon-glow-incidents',
      badgeClass: 'badge-incidents',
      explainTitle: 'Active Incidents',
      explainSummary: `${currentIncidents} active incidents logged across municipal dispatch.`
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            onClick={() => {
              setActivePage(m.page);
            }}
            className={`smart-card ${m.cardClass} p-4 flex flex-col justify-between cursor-pointer group transition hover:scale-[1.02] text-[#1A2318]`}
          >
            {/* Top row icon & trend badge */}
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${m.iconClass} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
              </div>

              <span className={`px-2 py-0.5 rounded-full text-micro font-mono font-bold ${m.badgeClass}`}>
                {m.trend}
              </span>
            </div>

            {/* Label & Value */}
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-[#52604D] font-mono block truncate font-medium">{m.label}</span>
                {m.source === 'demo' && (
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#96632B', background: '#FFF3E0', border: '1px solid #FFD49A', borderRadius: 6, padding: '0px 4px', flexShrink: 0 }}>DEMO</span>
                )}
              </div>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-2xl font-extrabold text-[#1A2318] font-heading">{m.value}</span>
                {m.unit && <span className="text-xs font-mono text-[#52604D] font-bold">{m.unit}</span>}
              </div>
            </div>

            {/* Explain hint trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openExplainModal({
                  title: m.explainTitle,
                  summary: m.explainSummary,
                  detailedPoints: [
                    `Current Metric Reading: ${m.value} ${m.unit}`,
                    `Historical Trend: ${m.trend}`,
                    "Updated in real-time by CityPulse telemetry engine."
                  ]
                });
              }}
              className="mt-3 text-micro font-mono text-[#5E7352] hover:underline flex items-center justify-between font-bold"
            >
              <span>Explain signal</span>
              <span>→</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
