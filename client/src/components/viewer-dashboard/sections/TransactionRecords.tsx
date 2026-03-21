import { TrendingUp, TrendingDown } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import { formatDate, formatCurrencyCompact, safeParseAmount } from "../../../utils/formatters";
import type { Collection, Disbursement } from "../../../types";

type TransactionRecordsProps = {
  collections: Collection[] | undefined;
  disbursements: Disbursement[] | undefined;
  isLoadingCollections: boolean;
  isLoadingDisbursements: boolean;
};

export default function TransactionRecords({
  collections,
  disbursements,
  isLoadingCollections,
  isLoadingDisbursements,
}: TransactionRecordsProps) {
  return (
    <section>
      <SectionHeader
        title="Transaction Records"
        subtitle="Recent financial activities"
        gradientFrom="from-violet-500"
        gradientTo="to-violet-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Collections Table */}
        <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                  Collections
                </h3>
                <p className="text-emerald-100 text-xs sm:text-sm truncate">
                  Recent income transactions
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[320px] sm:max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 z-10">
                <tr className="uppercase text-slate-600">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">Date</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">Category</th>
                  <th className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingCollections ? (
                  <tr>
                    <td colSpan={3} className="py-8 sm:py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <span className="text-xs sm:text-sm">Loading collections...</span>
                      </div>
                    </td>
                  </tr>
                ) : collections && collections.length > 0 ? (
                  collections.slice(0, 10).map((collection) => (
                    <tr
                      key={collection.id}
                      className="border-b border-slate-100 hover:bg-emerald-50/50 transition-all"
                    >
                      <td className="py-2 sm:py-3 px-3 sm:px-6 text-slate-600 whitespace-nowrap font-medium">
                        {formatDate(collection.transaction_date)}
                      </td>
                      <td
                        className="py-2 sm:py-3 px-3 sm:px-6 font-semibold text-slate-900 max-w-[120px] sm:max-w-xs truncate"
                        title={collection.nature_of_collection || collection.category}
                      >
                        {collection.nature_of_collection || collection.category}
                      </td>
                      <td className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold text-emerald-600 whitespace-nowrap">
                        {formatCurrencyCompact(safeParseAmount(collection.amount))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 sm:py-12 text-center text-slate-500 text-xs sm:text-sm"
                    >
                      No collections data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disbursements Table */}
        <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
                  Disbursements
                </h3>
                <p className="text-amber-100 text-xs sm:text-sm truncate">
                  Recent expense transactions
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[320px] sm:max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 z-10">
                <tr className="uppercase text-slate-600">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">Date</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">Category</th>
                  <th className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingDisbursements ? (
                  <tr>
                    <td colSpan={3} className="py-8 sm:py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                        <span className="text-xs sm:text-sm">Loading disbursements...</span>
                      </div>
                    </td>
                  </tr>
                ) : disbursements && disbursements.length > 0 ? (
                  disbursements.slice(0, 10).map((disbursement) => (
                    <tr
                      key={disbursement.id}
                      className="border-b border-slate-100 hover:bg-amber-50/50 transition-all"
                    >
                      <td className="py-2 sm:py-3 px-3 sm:px-6 text-slate-600 whitespace-nowrap font-medium">
                        {formatDate(disbursement.transaction_date)}
                      </td>
                      <td
                        className="py-2 sm:py-3 px-3 sm:px-6 font-semibold text-slate-900 max-w-[120px] sm:max-w-xs truncate"
                        title={disbursement.nature_of_disbursement || disbursement.category}
                      >
                        {disbursement.nature_of_disbursement || disbursement.category}
                      </td>
                      <td className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold text-amber-600 whitespace-nowrap">
                        {formatCurrencyCompact(safeParseAmount(disbursement.amount))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 sm:py-12 text-center text-slate-500 text-xs sm:text-sm"
                    >
                      No disbursements data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}