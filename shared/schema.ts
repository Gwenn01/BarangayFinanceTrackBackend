import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Revenue Sources
export const revenues = pgTable("revenues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  source: text("source").notNull(),
  category: text("category").notNull(), // "Real Property Tax", "Business Permits", "Fees & Charges", etc.
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  referenceNumber: text("reference_number"),
});

export const insertRevenueSchema = createInsertSchema(revenues).omit({
  id: true,
});

export type InsertRevenue = z.infer<typeof insertRevenueSchema>;
export type Revenue = typeof revenues.$inferSelect;

// Expenses/Disbursements
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // "Project Fund", "Economic Services", "General Public Services"
  subcategory: text("subcategory").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  payee: text("payee"),
  referenceNumber: text("reference_number"),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Fund Operations
export const fundOperations = pgTable("fund_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fundType: text("fund_type").notNull(), // "General Fund", "SEF", "Trust Fund", etc.
  openingBalance: numeric("opening_balance", { precision: 12, scale: 2 }).notNull(),
  receipts: numeric("receipts", { precision: 12, scale: 2 }).notNull(),
  disbursements: numeric("disbursements", { precision: 12, scale: 2 }).notNull(),
  closingBalance: numeric("closing_balance", { precision: 12, scale: 2 }).notNull(),
  period: text("period").notNull(), // "Q1 2024", "January 2024", etc.
  date: timestamp("date").notNull(),
});

export const insertFundOperationSchema = createInsertSchema(fundOperations).omit({
  id: true,
});

export type InsertFundOperation = z.infer<typeof insertFundOperationSchema>;
export type FundOperation = typeof fundOperations.$inferSelect;

// Budget Allocations
export const budgetAllocations = pgTable("budget_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  allocatedAmount: numeric("allocated_amount", { precision: 12, scale: 2 }).notNull(),
  utilizedAmount: numeric("utilized_amount", { precision: 12, scale: 2 }).notNull(),
  year: integer("year").notNull(),
});

export const insertBudgetAllocationSchema = createInsertSchema(budgetAllocations).omit({
  id: true,
});

export type InsertBudgetAllocation = z.infer<typeof insertBudgetAllocationSchema>;
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;

// Budget Entries (ABO) - Detailed budget planning transactions
export const budgetEntries = pgTable("budget_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().unique(),
  transactionDate: date("transaction_date").notNull(),
  expenditureProgram: text("expenditure_program").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  programDescription: text("program_description"),
  fundSource: text("fund_source").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  payee: text("payee").notNull(),
  dvNumber: text("dv_number").notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBudgetEntrySchema = createInsertSchema(budgetEntries).omit({
  id: true,
  createdAt: true,
}).extend({
  transactionDate: z.coerce.date(),
  amount: z.string().or(z.number()).transform(val => String(val)),
});

export type InsertBudgetEntry = z.infer<typeof insertBudgetEntrySchema>;
export type BudgetEntry = typeof budgetEntries.$inferSelect;

// Collection Transactions
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: text("transaction_id").notNull().unique(),
  transactionDate: timestamp("transaction_date").notNull(),
  natureOfCollection: text("nature_of_collection").notNull(),
  category: text("category").notNull(), // "EXTERNAL SOURCES: TAX REVENUE", "INTERNAL SOURCES: NON TAX REVENUE", "NON-INCOME RECEIPTS"
  subcategory: text("subcategory"), // "Share from Local Taxes", "Service and Business Income", etc.
  purpose: text("purpose"),
  fundSource: text("fund_source").notNull(), // "General Fund" or "Trust Fund"
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  payor: text("payor").notNull(),
  orNumber: text("or_number").notNull(),
  remarks: text("remarks"),
  reviewStatus: text("review_status").notNull().default("pending"), // "pending", "approved", "flagged"
  reviewComment: text("review_comment"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  reviewStatus: true,
  reviewComment: true,
  reviewedBy: true,
  reviewedAt: true,
}).extend({
  transactionDate: z.coerce.date(),
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

// Disbursement table for tracking expenditures
export const disbursements = pgTable("disbursements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().unique(),
  transactionDate: date("transaction_date").notNull(),
  natureOfDisbursement: text("nature_of_disbursement").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  programDescription: text("program_description"),
  fundSource: text("fund_source").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  payee: text("payee").notNull(),
  dvNumber: text("dv_number").notNull(),
  remarks: text("remarks"),
  reviewStatus: text("review_status").notNull().default("pending"), // "pending", "approved", "flagged"
  reviewComment: text("review_comment"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDisbursementSchema = createInsertSchema(disbursements).omit({
  id: true,
  createdAt: true,
  reviewStatus: true,
  reviewComment: true,
  reviewedBy: true,
  reviewedAt: true,
});

export type InsertDisbursement = z.infer<typeof insertDisbursementSchema>;
export type Disbursement = typeof disbursements.$inferSelect;

// DFUR (Development Fund Utilization Report) Projects
export const dfurProjects = pgTable("dfur_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().unique(),
  transactionDate: date("transaction_date").notNull(),
  natureOfCollection: text("nature_of_collection").notNull(), // ECONOMIC SERVICES, Infrastructure, Health, etc.
  project: text("project").notNull(),
  location: text("location").notNull(),
  totalCostApproved: numeric("total_cost_approved", { precision: 12, scale: 2 }).notNull(),
  dateStarted: date("date_started").notNull(),
  targetCompletionDate: date("target_completion_date").notNull(),
  status: text("status").notNull(), // Planned, In Progress, Completed, On Hold, Cancelled
  totalCostIncurred: numeric("total_cost_incurred", { precision: 12, scale: 2 }).notNull().default("0"),
  numberOfExtensions: integer("number_of_extensions").notNull().default(0),
  remarks: text("remarks"),
  reviewStatus: text("review_status").notNull().default("pending"), // "pending", "approved", "flagged"
  reviewComment: text("review_comment"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDfurProjectSchema = createInsertSchema(dfurProjects).omit({
  id: true,
  createdAt: true,
  reviewStatus: true,
  reviewComment: true,
  reviewedBy: true,
  reviewedAt: true,
}).extend({
  transactionDate: z.coerce.date(),
  dateStarted: z.coerce.date(),
  targetCompletionDate: z.coerce.date(),
  totalCostApproved: z.string().or(z.number()).transform(val => String(val)),
  totalCostIncurred: z.string().or(z.number()).transform(val => String(val)),
  numberOfExtensions: z.coerce.number().int().min(0),
}).refine(
  (data) => parseFloat(data.totalCostIncurred) <= parseFloat(data.totalCostApproved),
  { message: "Total cost incurred cannot exceed total cost approved", path: ["totalCostIncurred"] }
);

export type InsertDfurProject = z.infer<typeof insertDfurProjectSchema>;
export type DfurProject = typeof dfurProjects.$inferSelect;

// Users and Authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  role: text("role").notNull(), // "superadmin", "admin", "encoder", "checker", "reviewer", "approver"
  fullName: text("full_name").notNull(),
  position: text("position").notNull(), // "Kapitan", "Secretary", "Treasurer", "Bookkeeper", "Barangay Council"
  isActive: text("is_active").notNull().default("true"), // "true" or "false" as text for simplicity
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
}).extend({
  username: z.string().min(3).max(100),
  password: z.string().min(6),
  role: z.enum(["superadmin", "admin", "encoder", "checker", "reviewer", "approver"]),
  fullName: z.string().min(1),
  position: z.string().min(1),
  isActive: z.string().default("true"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User without password (for API responses)
export type UserWithoutPassword = Omit<User, 'password'>;

// Viewer Comments - Public feedback/comments from viewers
export const viewerComments = pgTable("viewer_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"), // Optional - viewer can be anonymous
  contactInfo: text("contact_info"), // Optional email or phone
  message: text("message").notNull(),
  contextType: text("context_type"), // Optional: "general", "abr", "sre", "dfur" for future categorization
  contextId: text("context_id"), // Optional: ID of related financial report
  status: text("status").notNull().default("pending"), // "pending", "published", "archived"
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertViewerCommentSchema = createInsertSchema(viewerComments).omit({
  id: true,
  createdAt: true,
  reviewedBy: true,
  reviewedAt: true,
  status: true,
}).extend({
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must not exceed 1000 characters"),
  name: z.string().max(100).optional(),
  contactInfo: z.string().max(200).optional(),
  contextType: z.enum(["general", "abr", "sre", "dfur"]).optional(),
});

export type InsertViewerComment = z.infer<typeof insertViewerCommentSchema>;
export type ViewerComment = typeof viewerComments.$inferSelect;

// Financial Summary (computed data)
export interface FinancialSummary {
  totalRevenues: number;
  totalExpenses: number;
  netBalance: number;
  currentMonthRevenues: number;
  currentMonthExpenses: number;
  revenueGrowth: number; // percentage
  expenseGrowth: number; // percentage
}

// Chart Data Types
export interface MonthlyData {
  month: string;
  revenues: number;
  expenses: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  amount: number;
}
