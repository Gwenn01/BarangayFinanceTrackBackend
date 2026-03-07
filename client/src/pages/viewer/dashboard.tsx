import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Shield, 
  BarChart3, 
  FileText, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Wallet,
  PieChart as PieChartIcon,
  MessageSquare,
  LogIn,
} from "lucide-react";

import { useLocation } from "wouter";

// Import API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://barangayfinancetrackbackenddeployment.onrender.com/api";

// Backend types (matching the actual API response)
type BackendCollection = {
  id: number;
  transaction_id: string;
  transaction_date: string;
  nature_of_collection: string;
  category: string;
  subcategory: string;
  purpose?: string;
  fund_source: string;
  amount: number;
  payor: string;
  or_number: string;
  remarks?: string;
};

type BackendDisbursement = {
  id: number;
  transaction_id: string;
  transaction_date: string;
  nature_of_disbursement: string;
  category: string;
  subcategory: string;
  program_description?: string;
  fund_source: string;
  amount: number;
  payee: string;
  or_number: string;
  remarks?: string;
};

// Frontend types for display
export type Collection = {
  id: number;
  transaction_date: string | null;
  category: string;
  nature_of_collection?: string;
  payor: string;
  amount: string;
  created_at?: string;
};

export type Disbursement = {
  id: number;
  transaction_date: string | null;
  category: string;
  nature_of_disbursement?: string;
  payee: string;
  amount: string;
  created_at?: string;
};

export type DfurProject = {
  id: number;
  transaction_id: string;
  transaction_date: string | null;
  name_of_collection: string;
  project: string;
  location: string;
  total_cost_approved: string;
  total_cost_incurred: string;
  date_started: string | null;
  target_completion_date: string | null;
  status: string;
  no_extensions: number;
  remarks?: string;
  review_status?: "pending" | "approved" | "flagged";
  review_comment?: string;
};

export type DfurApiResponse = {
  data: DfurProject[];
  message: string;
};

type Comment = {
  id: number;
  name: string;
  email: string;
  comment: string;
  created_at?: string;
};

// Convert backend to frontend format
export function backendCollectionToFrontend(backend: BackendCollection): Collection {
  return {
    id: backend.id,
    transaction_date: backend.transaction_date,
    category: backend.category,
    nature_of_collection: backend.nature_of_collection,
    payor: backend.payor,
    amount: backend.amount.toString(),
  };
}

export function backendDisbursementToFrontend(backend: BackendDisbursement): Disbursement {
  return {
    id: backend.id,
    transaction_date: backend.transaction_date,
    category: backend.category,
    nature_of_disbursement: backend.nature_of_disbursement,
    payee: backend.payee,
    amount: backend.amount.toString(),
  };
}

// Consistent color palette
const COLORS = {
  primary: "#3b82f6",      // blue-500
  primaryLight: "#60a5fa", // blue-400
  primaryDark: "#2563eb",  // blue-600
  success: "#10b981",      // emerald-500
  successLight: "#34d399", // emerald-400
  successDark: "#059669",  // emerald-600
  warning: "#f59e0b",      // amber-500
  warningLight: "#fbbf24", // amber-400
  warningDark: "#d97706",  // amber-600
  danger: "#ef4444",       // red-500
  dangerLight: "#f87171",  // red-400
  dangerDark: "#dc2626",   // red-600
  purple: "#8b5cf6",       // violet-500
  purpleLight: "#a78bfa",  // violet-400
  purpleDark: "#7c3aed",   // violet-600
};

// API fetch functions (using the same pattern as SRE page)
const fetchCollections = async (): Promise<Collection[]> => {
  const response = await fetch(`${API_BASE_URL}/get-collection`);
  if (!response.ok) throw new Error('Failed to fetch collections');
  const data = await response.json();
  
  // Handle the response structure: { data: [...] } or just [...]
  const backendData = data.data || data || [];
  
  if (Array.isArray(backendData)) {
    return backendData.map(backendCollectionToFrontend);
  }
  
  return [];
};

const fetchDisbursements = async (): Promise<Disbursement[]> => {
  const response = await fetch(`${API_BASE_URL}/get-disbursement`);
  if (!response.ok) throw new Error('Failed to fetch disbursements');
  const data = await response.json();
  
  // Handle the response structure: { data: [...] } or just [...]
  const backendData = data.data || data || [];
  
  if (Array.isArray(backendData)) {
    return backendData.map(backendDisbursementToFrontend);
  }
  
  return [];
};

const fetchDfurProjects = async (): Promise<DfurProject[]> => {
  const response = await fetch(`${API_BASE_URL}/get-dfur-project`);
  if (!response.ok) throw new Error('Failed to fetch DFUR projects');
  const data: DfurApiResponse = await response.json();
  return data.data || [];
};

const fetchComments = async (): Promise<Comment[]> => {
  const response = await fetch(`${API_BASE_URL}/get-all-comments`);
  if (!response.ok) throw new Error('Failed to fetch comments');

  const data: Comment[] = await response.json();

  if (!Array.isArray(data)) return [];

  // Sort descending by date (newest first)
  return data.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
};


export default function ViewerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const currentYear = new Date().getFullYear();

  const [, navigate] = useLocation();

  // Comment form state
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data using the same pattern as SRE page
  const { data: collections, isLoading: isLoadingCollections } = useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    select: (data) => {
      return [...data].sort((a, b) => {
        const dateA = a.transaction_date ? new Date(a.transaction_date).getTime() : 
                     (a.created_at ? new Date(a.created_at).getTime() : Date.now());
        const dateB = b.transaction_date ? new Date(b.transaction_date).getTime() : 
                     (b.created_at ? new Date(b.created_at).getTime() : Date.now());
        return dateB - dateA;
      });
    },
  });

  const { data: disbursements, isLoading: isLoadingDisbursements } = useQuery<Disbursement[]>({
    queryKey: ['disbursements'],
    queryFn: fetchDisbursements,
    select: (data) => {
      return [...data].sort((a, b) => {
        const dateA = a.transaction_date ? new Date(a.transaction_date).getTime() : 
                     (a.created_at ? new Date(a.created_at).getTime() : Date.now());
        const dateB = b.transaction_date ? new Date(b.transaction_date).getTime() : 
                     (b.created_at ? new Date(b.created_at).getTime() : Date.now());
        return dateB - dateA;
      });
    },
  });

  const { data: dfurProjects, isLoading: isLoadingDfurProjects } = useQuery<DfurProject[]>({
    queryKey: ['dfurProjects'],
    queryFn: fetchDfurProjects,
  });

  const { data: comments, isLoading: isLoadingComments, refetch: refetchComments } = useQuery<Comment[]>({
    queryKey: ['comments'],
    queryFn: fetchComments,
  });

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
    return `₱${value.toFixed(0)}`;
  };

  const safeParseAmount = (amount: string | null | undefined): number => {
    if (!amount) return 0;
    const num = Number(amount);
    return isNaN(num) ? 0 : num;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleDateString('en-PH', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/insert-comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: commentName || "Anonymous",
          email: commentEmail,
          comment: commentText,
        }),
      });
      
      if (response.ok) {
        alert("Thank you for your feedback! Your comment has been submitted for review.");
        setCommentName("");
        setCommentEmail("");
        setCommentText("");
        // Refetch comments to show the new one
        refetchComments();
      } else {
        throw new Error("Failed to submit comment");
      }
    } catch (error) {
      alert("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations based on actual API data
  const totalCollections = collections?.reduce((sum, c) => sum + safeParseAmount(c.amount), 0) || 0;
  const totalDisbursements = disbursements?.reduce((sum, d) => sum + safeParseAmount(d.amount), 0) || 0;
  const surplus = totalCollections - totalDisbursements;
  const totalApprovedCost = (dfurProjects || []).reduce((sum, p) => sum + safeParseAmount(p.total_cost_approved), 0);
  const totalIncurredCost = (dfurProjects || []).reduce((sum, p) => sum + safeParseAmount(p.total_cost_incurred), 0);
  const utilizationRate = totalCollections > 0 ? ((totalDisbursements / totalCollections) * 100).toFixed(1) : "0";

  // Group collections and disbursements by category for budget breakdown
  const collectionsByCategory = collections?.reduce((acc, c) => {
    const category = c.nature_of_collection || c.category || "Other";
    acc[category] = (acc[category] || 0) + safeParseAmount(c.amount);
    return acc;
  }, {} as Record<string, number>);

  const disbursementsByCategory = disbursements?.reduce((acc, d) => {
    const category = d.nature_of_disbursement || d.category || "Other";
    acc[category] = (acc[category] || 0) + safeParseAmount(d.amount);
    return acc;
  }, {} as Record<string, number>);

  // Create budget breakdown data combining collections (as planned) and disbursements (as actual)
  const allCategories = new Set([
    ...Object.keys(collectionsByCategory || {}),
    ...Object.keys(disbursementsByCategory || {})
  ]);

  const budgetBreakdownData = Array.from(allCategories).map(category => ({
    category: category.length > 25 ? category.substring(0, 25) + '...' : category,
    fullCategory: category,
    planned: collectionsByCategory?.[category] || 0,
    actual: disbursementsByCategory?.[category] || 0,
    variance: (collectionsByCategory?.[category] || 0) - (disbursementsByCategory?.[category] || 0),
  })).sort((a, b) => b.planned - a.planned); // Sort by planned budget descending

  const collectionsPieData = Object.entries(collectionsByCategory || {}).map(([name, value]) => ({
    name,
    value,
  })).slice(0, 5);

  const disbursementsPieData = Object.entries(disbursementsByCategory || {}).map(([name, value]) => ({
    name,
    value,
  })).slice(0, 5);

  const dfurByStatus = (dfurProjects || []).reduce((acc, p) => {
    const status = p.review_status === "approved" ? "Approved" : p.review_status === "flagged" ? "Flagged" : "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dfurStatusPieData = Object.entries(dfurByStatus || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const pieChartColors = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.danger];

  return (
    <div className="min-h-screen bg-white relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }


      `}</style>
      <header className="fixed w-full h-20 z-10 backdrop-blur-md bg-white/90 flex items-center justify-between px-6 sm:px-12 lg:px-20 shadow">
          <h1 className="text-xl sm:text-2xl font-black gradient-text">FundSight</h1>
            <button
              onClick={() => navigate("/login")}
              className="group  px-5 bg-blue-600 sm:px-7 py-1.5 sm:py-2 rounded-lg 
                        border-2 border-blue-600 font-semibold sm:font-bold 
                        text-base sm:text-lg hover:bg-blue-50 transition-all duration-300 
                        shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transform hover:-translate-y-1 text-white hover:text-blue-700"
            >
              <span className="flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-blue-700 transition-colors duration-300" />
                Login
                
              </span>
            </button>
      </header>
      <div className=" overflow-hidden">

        {/* <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div> */}
        
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center animate-fadeInUp">
            
 
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 glass-card rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-lg">
              <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
              </div>
              <span className="gradient-text text-center">
                Live Transparency Portal {currentYear}
              </span>
            </div>
            

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-6 leading-tight">
              <span className="block text-slate-900 mb-1 sm:mb-2">Barangay</span>
              <span className="gradient-text">Financial Dashboard</span>
            </h1>
            

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto leading-relaxed font-medium px-2">
              Empowering communities through{" "}
              <span className="text-blue-600 font-semibold">
                complete transparency
              </span>
              , real-time data, and verified accountability.
            </p>
          </div>


          {/* <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-6xl mx-auto">
{[
  { 
    icon: Wallet, 
    value: formatCurrencyCompact(totalCollections), 
    label: "Total Collections", 
    color: "blue",
    link: "#revenue"
  },
  { 
    icon: TrendingDown, 
    value: formatCurrencyCompact(totalDisbursements), 
    label: "Total Disbursements", 
    color: "amber",
    link: "#revenue"
  },
  { 
    icon: TrendingUp, 
    value: formatCurrencyCompact(surplus), 
    label: surplus >= 0 ? "Surplus" : "Deficit", 
    color: surplus >= 0 ? "emerald" : "red",
    link: "#revenue"
  },
  { 
    icon: Target, 
    value: `${dfurProjects?.length || 0}`, 
    label: "Projects", 
    color: "violet",
    link: "#projects"
  },
].map((metric, index) => {
  const Icon = metric.icon;

  const handleClick = () => {
    if (!metric.link) return;

    const element = document.querySelector(metric.link) as HTMLElement | null;

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div
      key={metric.label}
      className="stat-card glass-card rounded-2xl p-4 sm:p-6 border cursor-pointer hover:scale-[1.02] transition-all duration-300"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleClick}
    >
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-${metric.color}-100 mb-3 sm:mb-4 shadow-lg`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 text-${metric.color}-600`} />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1 break-words">
                    {metric.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                    {metric.label}
                  </div>
                </div>
              );
            })}
          </div> */}
        </div>
        
        {/* Financial Overview Section */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-xl md:text-4xl font-bold text-slate-900">Financial Overview</h2>
              <p className="text-slate-600 mt-1 text-sm md:text-base">Real-time budget tracking and utilization</p>
            </div>
          </div>

          {/* Budget Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="glass-card rounded-2xl p-6 border border-blue-200 ">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">Collections</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {formatCurrencyCompact(totalCollections)}
              </div>
              <div className="text-sm text-slate-600 font-medium">Total Income</div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-amber-200">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0">Disbursements</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {formatCurrencyCompact(totalDisbursements)}
              </div>
              <div className="text-sm text-slate-600 font-medium">Total Spending</div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-emerald-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  surplus >= 0 
                    ? 'bg-emerald-100' 
                    : 'bg-red-100'
                }`}>
                  {surplus >= 0 ? (
                    <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <Badge className={`border-0 ${
                  surplus >= 0 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {surplus >= 0 ? 'Surplus' : 'Deficit'}
                </Badge>
              </div>
              <div className={`text-3xl font-bold mb-1 ${
                surplus >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {formatCurrencyCompact(Math.abs(surplus))}
              </div>
              <div className="text-sm text-slate-600 font-medium">Net Position</div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-violet-200">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-violet-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-violet-600" />
                </div>
                <Badge className="bg-violet-100 text-violet-700 border-0">Rate</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {utilizationRate}%
              </div>
              <div className="text-sm text-slate-600 font-medium">Utilization Rate</div>
            </div>
          </div>

          {/* Budget Chart */}
          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Budget Analysis by Category</h3>
                <p className="text-slate-600 text-xs md:text-base">Collections (planned) vs disbursements (actual) by category</p>
              </div>
              <div className="p-2 md:p-4 bg-blue-100 rounded-2xl">
                <BarChart3 className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart 
                data={budgetBreakdownData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <defs>
                  <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={COLORS.primaryDark} stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={COLORS.successDark} stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                  tickFormatter={formatCurrencyCompact} 
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 16px'
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="planned" 
                  name="Collections (Planned)" 
                  fill="url(#plannedGradient)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
                <Bar 
                  dataKey="actual" 
                  name="Disbursements (Actual)" 
                  fill="url(#actualGradient)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Revenue & Expenditure Section */}
        <section id="revenue">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-xl md:text-4xl font-bold text-slate-900">Revenue & Expenditure</h2>
              <p className="text-slate-600 mt-1 text-sm md:text-base">Comprehensive financial flow analysis</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">

            {/* INCOME */}
            <div className="bg-emerald-200/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-lg">
              
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-emerald-400/20 rounded-full blur-2xl sm:blur-3xl" />
              
              <div className="relative">
                
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  
                  <div className="p-2 sm:p-3 lg:p-4 bg-emerald-100 rounded-xl sm:rounded-2xl">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-600" />
                  </div>
                  
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                    Income
                  </Badge>

                </div>

                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 sm:mb-2 break-words">
                  {formatCurrencyCompact(totalCollections)}
                </div>

                <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                  Total Collections
                </div>

              </div>
            </div>


            {/* EXPENSE */}
            <div className="bg-amber-200/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-lg">
              
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-amber-400/20 rounded-full blur-2xl sm:blur-3xl" />
              
              <div className="relative">
                
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  
                  <div className="p-2 sm:p-3 lg:p-4 bg-amber-100 rounded-xl sm:rounded-2xl">
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-600" />
                  </div>
                  
                  <Badge className="bg-amber-100 text-amber-700 border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                    Expense
                  </Badge>

                </div>

                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-amber-600 mb-1 sm:mb-2 break-words">
                  {formatCurrencyCompact(totalDisbursements)}
                </div>

                <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                  Total Disbursements
                </div>

              </div>
            </div>


            {/* SURPLUS / DEFICIT */}
            <div className={`stat-card glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border ${
              surplus >= 0 ? 'border-emerald-200' : 'border-red-200'
            }`}>
              
              <div className={`absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 rounded-full blur-2xl sm:blur-3xl ${
                surplus >= 0 ? 'bg-emerald-400/20' : 'bg-red-400/20'
              }`} />
              
              <div className="relative">
                
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  
                  <div className={`p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl ${
                    surplus >= 0 ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    
                    {surplus >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-600" />
                    )}

                  </div>

                  <Badge className={`border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm ${
                    surplus >= 0 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {surplus >= 0 ? 'Surplus' : 'Deficit'}
                  </Badge>

                </div>

                <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 break-words ${
                  surplus >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatCurrencyCompact(Math.abs(surplus))}
                </div>

                <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                  Net Position
                </div>

              </div>
            </div>

          </div>

          {/* Charts */}
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
                    label={({ name, percent }) => `${name.substring(0, 12)}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {collectionsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Expenditure Categories</h3>
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
                    label={({ name, percent }) => `${name.substring(0, 12)}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {disbursementsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Transaction Records */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-xl md:text-4xl font-bold text-slate-900">Transaction Records</h2>
              <p className="text-slate-600 mt-1 text-sm md:text-base">Recent financial activities</p>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Collections */}
          <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl">
            
            {/* Header */}
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

            {/* Table */}
            <div className="overflow-x-auto max-h-[320px] sm:max-h-96 overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs sm:text-sm">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 z-10">
                  <tr className="uppercase text-slate-600">
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">
                      Date
                    </th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">
                      Category
                    </th>
                    <th className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingCollections ? (
                    <tr>
                      <td colSpan={3} className="py-8 sm:py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                          <span className="text-xs sm:text-sm">
                            Loading collections...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : collections?.length > 0 ? (
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
                          {formatCurrencyCompact(
                            safeParseAmount(collection.amount)
                          )}
                        </td>
                      </tr>

                    ))

                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 sm:py-12 text-center text-slate-500 text-xs sm:text-sm">
                        No collections data available
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>

            </div>

          </div>


          {/* Disbursements */}
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
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">
                      Date
                    </th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">
                      Category
                    </th>
                    <th className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDisbursements ? (
                    <tr>
                      <td colSpan={3} className="py-8 sm:py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                          <span className="text-xs sm:text-sm">
                            Loading disbursements...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : disbursements?.length > 0 ? (
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
                          {formatCurrencyCompact(
                            safeParseAmount(disbursement.amount)
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 sm:py-12 text-center text-slate-500 text-xs sm:text-sm">
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

        {/* Development Projects */}
        <section id="projects">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-xl md:text-4xl font-bold text-slate-900">Development Projects</h2>
              <p className="text-slate-600 mt-1 text-sm md:text-base">Infrastructure and community initiatives</p>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {/* Active Projects */}
            <div className="stat-card glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-blue-200">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-blue-400/20 rounded-full blur-2xl sm:blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-5 lg:mb-6">
                  <div className="p-2 sm:p-3 lg:p-4 bg-blue-100 rounded-xl sm:rounded-2xl">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                    Total
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2 break-words">
                  {dfurProjects?.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                  Active Projects
                </div>
              </div>
            </div>


            {/* Approved Cost */}
            <div className="stat-card glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-emerald-200">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-emerald-400/20 rounded-full blur-2xl sm:blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-5 lg:mb-6">
                  <div className="p-2 sm:p-3 lg:p-4 bg-emerald-100 rounded-xl sm:rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                    Approved
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-emerald-600 mb-1 sm:mb-2 break-words">
                  {formatCurrencyCompact(totalApprovedCost)}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                  Approved Cost
                </div>
              </div>
            </div>


            {/* Actual Cost */}
            <div className="stat-card glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden border border-amber-200">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-amber-400/20 rounded-full blur-2xl sm:blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-5 lg:mb-6">
                  <div className="p-2 sm:p-3 lg:p-4 bg-amber-100 rounded-xl sm:rounded-2xl">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-0 px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 text-xs sm:text-sm">
                    Incurred
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-amber-600 mb-1 sm:mb-2 break-words">
                  {formatCurrencyCompact(totalIncurredCost)}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                  Actual Cost
                </div>
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Project Status</h3>
                  <p className="text-sm text-slate-600">Approval distribution</p>
                </div>
                <PieChartIcon className="w-6 h-6 text-violet-600" />
              </div>
              {isLoadingDfurProjects ? (
                <div className="flex items-center justify-center h-[320px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    <p className="text-slate-500">Loading project data...</p>
                  </div>
                </div>
              ) : dfurStatusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={dfurStatusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                    >
                      {dfurStatusPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === "Approved" ? COLORS.success : 
                            entry.name === "Flagged" ? COLORS.danger : 
                            "#94a3b8"
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[320px]">
                  <p className="text-slate-500">No project data available</p>
                </div>
              )}
            </div>

            {/* Featured Projects */}
            <div className="glass-card rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Recent Projects</h3>
                  <p className="text-sm text-slate-600">Latest initiatives</p>
                </div>
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
                {dfurProjects && dfurProjects.length > 0 ? (
                  dfurProjects.slice(0, 5).map((project) => (
                    <div key={project.id} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 mb-1 line-clamp-1" title={project.project}>
                            {project.project}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {project.location}
                          </p>
                        </div>
                        <Badge className={`shrink-0 ${
                          project.review_status === "approved" 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                            : project.review_status === "flagged"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {project.review_status === "approved" ? "Approved" : project.review_status === "flagged" ? "Flagged" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-600">
                          {formatCurrencyCompact(safeParseAmount(project.total_cost_approved))}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(project.transaction_date)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No projects available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Projects Table */}
          <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">All Projects</h3>
                  <p className="text-violet-100 text-sm">Complete project listing</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 backdrop-blur-sm border-b-2 border-slate-200">
                  <tr className="text-xs uppercase text-slate-600">
                    <th className="text-left py-4 px-6 font-bold">Project</th>
                    <th className="text-left py-4 px-6 font-bold">Location</th>
                    <th className="text-right py-4 px-6 font-bold">Approved</th>
                    <th className="text-right py-4 px-6 font-bold">Incurred</th>
                    <th className="text-center py-4 px-6 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingDfurProjects ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                          <span>Loading projects...</span>
                        </div>
                      </td>
                    </tr>
                  ) : dfurProjects && dfurProjects.length > 0 ? (
                    dfurProjects.map((project) => (
                      <tr key={project.id} className="border-b border-slate-100 hover:bg-violet-50/30 transition-all duration-200">
                        <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate" title={project.project}>
                          {project.project}
                        </td>
                        <td className="py-4 px-6 text-slate-600 max-w-xs truncate" title={project.location}>
                          {project.location}
                        </td>
                        <td className="text-right py-4 px-6 font-bold text-slate-900">
                          {formatCurrency(safeParseAmount(project.total_cost_approved))}
                        </td>
                        <td className="text-right py-4 px-6 font-bold text-amber-600">
                          {formatCurrency(safeParseAmount(project.total_cost_incurred))}
                        </td>
                        <td className="text-center py-4 px-6">
                          <Badge className={`${
                            project.review_status === "approved" 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : project.review_status === "flagged"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}>
                            {project.review_status === "approved" ? "Approved" : project.review_status === "flagged" ? "Flagged" : "Pending"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-500">
                        No projects data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Budget Detail Table */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full shadow-lg" />
            <div>
              <h2 className="text-xl md:text-4xl font-bold text-slate-900">Budget Breakdown</h2>
              <p className="text-slate-600 mt-1 text-sm md:text-base">Detailed category analysis</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Category Analysis</h3>
                  <p className="text-blue-100 text-sm">Budget allocation and utilization</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 backdrop-blur-sm border-b-2 border-slate-200">
                  <tr className="text-xs uppercase text-slate-600">
                    <th className="text-left py-5 px-6 font-bold">Category</th>
                    <th className="text-right py-5 px-6 font-bold">Collections</th>
                    <th className="text-right py-5 px-6 font-bold">Disbursements</th>
                    <th className="text-right py-5 px-6 font-bold">Variance</th>
                    <th className="text-right py-5 px-6 font-bold">Utilized %</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetBreakdownData.map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-slate-100 hover:bg-blue-50/30 transition-all duration-200"
                    >
                      <td className="py-5 px-6 font-bold text-slate-900 w-1/3" title={item.fullCategory}>
                        <p className="text-wrap">{item.fullCategory}</p>
                        </td>
                      <td className="text-right py-5 px-6 text-slate-700 font-semibold">
                        {formatCurrency(item.planned)}
                      </td>
                      <td className="text-right py-5 px-6 text-slate-700 font-semibold">
                        {formatCurrency(item.actual)}
                      </td>
                      <td className={`text-right py-5 px-6 font-bold ${item.variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        <span className="inline-flex items-center gap-1">
                          {item.variance >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {formatCurrency(Math.abs(item.variance))}
                        </span>
                      </td>
                      <td className="text-right py-5 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex-1 max-w-[100px] h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.planned > 0 && ((item.actual / item.planned) * 100) > 90 
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                                  : 'bg-gradient-to-r from-amber-500 to-amber-600'
                              }`}
                              style={{ width: `${item.planned > 0 ? Math.min(((item.actual / item.planned) * 100), 100) : 0}%` }}
                            />
                          </div>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold min-w-[60px] justify-center ${
                            item.planned > 0 && ((item.actual / item.planned) * 100) > 90 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.planned > 0 ? ((item.actual / item.planned) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Community Feedback Section */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-12 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full shadow-lg" />
            <div>
              <h2 className="text-xl md:text-4xl font-bold text-slate-900">Community Feedback</h2>
              <p className="text-slate-600 mt-1 text-sm md:text-base">Your voice matters - share your thoughts and suggestions</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Comment Form */}
            <div className="glass-card rounded-3xl p-8 shadow-xl border border-amber-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-4 bg-amber-100 rounded-2xl">
                  <MessageSquare className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-slate-900">Submit Your Feedback</h3>
                  <p className="text-xs md:text-sm text-slate-600">Help us improve our transparency and services</p>
                </div>
              </div>

              <form onSubmit={handleCommentSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 
                             focus:ring-4 focus:ring-amber-100 transition-all duration-200 outline-none
                             text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-slate-400 font-normal">(Optional, for follow-up)</span>
                  </label>
                  <input
                    type="email"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 
                             focus:ring-4 focus:ring-amber-100 transition-all duration-200 outline-none
                             text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={5}
                    required
                    placeholder="Share your thoughts, questions, or suggestions about our financial transparency..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 
                             focus:ring-4 focus:ring-amber-100 transition-all duration-200 outline-none
                             text-slate-900 placeholder:text-slate-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 
                           text-white font-bold text-lg hover:from-amber-600 hover:to-amber-700 
                           transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                           flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Submit Feedback
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  All comments are reviewed by our admin team. Contact information is kept confidential.
                </p>
              </form>
            </div>

            {/* Info Cards */}
            <div className="space-y-6">

              {/* Feedback Importance */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-lg sm:shadow-xl border border-blue-200">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"/>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Why Your Feedback Matters</h4>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      Your comments help us understand community needs and improve our transparency initiatives. 
                      Every piece of feedback is carefully reviewed and considered in our decision-making process.
                    </p>
                  </div>
                </div>
              </div>

              {/* Commitment */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-lg sm:shadow-xl border border-emerald-200">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-xl shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600"/>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Our Commitment</h4>
                    <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base text-slate-600">
                      {[
                        "All comments reviewed within 3-5 business days",
                        "Respectful and constructive feedback encouraged",
                        "Anonymous submissions welcome",
                        "Privacy and confidentiality guaranteed"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 sm:mt-2"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-lg sm:shadow-xl border border-violet-200">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-violet-100 rounded-xl shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600"/>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Response Time</h4>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      We strive to acknowledge all feedback promptly. Complex inquiries may require additional 
                      time for thorough investigation and response.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Display Comments */}
          <div className="mt-8 sm:mt-12">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl shrink-0">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900">Community Comments</h3>
                <p className="text-xs sm:text-sm text-slate-600">Recent feedback from our community</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-xl">
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-10 sm:py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-slate-500 text-sm">Loading comments...</span>
                  </div>
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-2.5 sm:space-y-4 text-wrap custom-scrollbar pr-0.5 sm:pr-2">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 sm:p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 w-full h-auto text-wrap"
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center text-white font-bold shrink-0 text-xs sm:text-base">
                          {comment.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">
                            {comment.name}
                          </h4>
                          {comment.email && (
                            <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                              {comment.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex min-w-0">
                        <p className="w-full break-words whitespace-normal text-xs sm:text-base text-slate-700">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-12 text-slate-500">
                  <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm sm:text-base">No comments yet. Be the first to share your feedback!</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
        <footer className="relative mt-12 sm:mt-16 lg:mt-20 overflow-hidden">
          <div className="absolute inset-0 glass-card-dark"/>
          
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500 rounded-full mix-blend-multiply blur-3xl"/>
            <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-violet-500 rounded-full mix-blend-multiply blur-3xl"/>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-16">

            {/* Top section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10 lg:mb-12">

              {/* Portal Info */}
              <div className="sm:col-span-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black gradient-text">FundSight</h1>
                <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                  Transparency Portal
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4 sm:mb-6 max-w-md">
                  Building trust through complete financial transparency and accountability. Empowering our community with real-time access to public finances.
                </p>

                <div className="flex gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400"/>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400"/>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400"/>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold sm:font-bold mb-2 sm:mb-4 text-white text-base sm:text-lg">
                  Contact
                </h4>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3 sm:mb-4">
                  Visit the Barangay Hall during office hours for inquiries and concerns.
                </p>

                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 max-w-xs">
                  <p className="text-xs text-slate-400 mb-1">Office Hours</p>
                  <p className="text-sm text-white font-semibold">Mon - Fri, 8:00 AM - 5:00 PM</p>
                </div>
              </div>

            </div>

            {/* Bottom section */}
            <div className="border-t border-white/10 pt-5 sm:pt-6 lg:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">

              <p className="text-xs sm:text-sm text-slate-400">
                © {currentYear} Barangay Financial Transparency Portal.
              </p>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 flex-wrap justify-center sm:justify-end">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400"/>
                  Verified
                </span>

                <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block"/>

                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-400"/>
                  Secure
                </span>
              </div>

            </div>

          </div>
        </footer>
    </div>
  );
}