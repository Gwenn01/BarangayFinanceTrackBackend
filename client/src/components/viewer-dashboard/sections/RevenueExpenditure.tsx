import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import { formatCurrency } from "../../../utils/formatters";
import { PIE_CHART_COLORS } from "../../../utils/constants";

type PieDataItem = { name: string; value: number };

type RevenueExpenditureProps = {
  collectionsPieData: PieDataItem[];
  disbursementsPieData: PieDataItem[];
};

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "none",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  padding: "8px 12px",
};

export default function RevenueExpenditure({
  collectionsPieData,
  disbursementsPieData,
}: RevenueExpenditureProps) {
  return (
    <section id="revenue">
      <SectionHeader
        title="Revenue & Expenditure"
        subtitle="Comprehensive financial flow analysis"
        gradientFrom="from-emerald-500"
        gradientTo="to-emerald-600"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Revenue Sources</h3>
              <p className="text-sm text-slate-600">Distribution of income</p>
            </div>
            <PieChartIcon className="w-6 h-6 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={collectionsPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                label={({ name, percent }) =>
                  `${name.substring(0, 12)}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
              >
                {collectionsPieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={tooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                Expenditure Categories
              </h3>
              <p className="text-sm text-slate-600">Distribution of spending</p>
            </div>
            <PieChartIcon className="w-6 h-6 text-amber-600" />
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={disbursementsPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                label={({ name, percent }) =>
                  `${name.substring(0, 12)}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
              >
                {disbursementsPieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={tooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}