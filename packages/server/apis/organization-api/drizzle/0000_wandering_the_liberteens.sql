CREATE TYPE "public"."account_standing" AS ENUM('GOOD', 'WARNING', 'SUSPENDED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."account_tier" AS ENUM('FREE', 'STARTER', 'PRO', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."agent_status" AS ENUM('ACTIVE', 'PAUSED', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."agent_type" AS ENUM('RESPONSE_RECOMMENDATION', 'CUSTOMER_SPEND', 'SENTIMENT_ANALYSIS', 'ESCALATION_PREDICTOR', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."billing_cycle" AS ENUM('MONTHLY', 'QUARTERLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."budget_period" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."budget_type" AS ENUM('REFUND', 'COMPENSATION', 'DISCOUNT', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."decision_rule_action" AS ENUM('AUTO_RESOLVE', 'ESCALATE_TO_HUMAN', 'REQUEST_MORE_INFO', 'ROUTE_TO_SENIOR', 'AUTO_APPROVE_REFUND', 'DENY_REFUND', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."escalation_priority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."escalation_reason" AS ENUM('AI_UNABLE_TO_RESOLVE', 'CUSTOMER_REQUEST', 'NEGATIVE_SENTIMENT', 'TECHNICAL_ISSUE', 'BILLING_DISPUTE', 'HIGH_VALUE_CUSTOMER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."escalation_status" AS ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."metric_period" AS ENUM('HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR');--> statement-breakpoint
CREATE TYPE "public"."organization_plan" AS ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."performance_trend" AS ENUM('UP', 'DOWN', 'STABLE');--> statement-breakpoint
CREATE TYPE "public"."refund_reason" AS ENUM('AI_BUG', 'SERVICE_DOWNTIME', 'UX_ISSUE', 'BILLING_ERROR', 'CUSTOMER_REQUEST', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."representative_role" AS ENUM('JUNIOR_SUPPORT', 'SENIOR_SUPPORT', 'TEAM_LEAD', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."representative_status" AS ENUM('ONLINE', 'AWAY', 'OFFLINE');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('TECHNICAL_ISSUE', 'BILLING_PAYMENT', 'ACCOUNT_MANAGEMENT', 'FEATURE_REQUEST', 'BUG_REPORT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CUSTOMER', 'REPRESENTATIVE', 'ADMIN');--> statement-breakpoint
CREATE TABLE "agent_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "agent_type" NOT NULL,
	"description" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"status" "agent_status" DEFAULT 'ACTIVE' NOT NULL,
	"assertions" integer DEFAULT 0 NOT NULL,
	"accuracy" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"avg_latency" integer DEFAULT 0 NOT NULL,
	"data_sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"thresholds" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_run_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "budget_usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budget_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"refund_id" uuid,
	"reason" text,
	"approved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"type" "budget_type" NOT NULL,
	"period" "budget_period" NOT NULL,
	"limit" numeric(12, 2) NOT NULL,
	"spent" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"remaining" numeric(12, 2) NOT NULL,
	"alert_thresholds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"auto_alerts_enabled" boolean DEFAULT true NOT NULL,
	"refund_limit_per_user" numeric(10, 2),
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" "account_tier" DEFAULT 'FREE' NOT NULL,
	"standing" "account_standing" DEFAULT 'GOOD' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"lifetime_value" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"last_billing_date" timestamp,
	"next_billing_date" timestamp,
	"billing_cycle" "billing_cycle",
	"billing_amount" numeric(10, 2),
	"token_balance" integer DEFAULT 0 NOT NULL,
	"token_limit" integer DEFAULT 1000 NOT NULL,
	"active_sites" integer DEFAULT 0 NOT NULL,
	"sites_limit" integer DEFAULT 1 NOT NULL,
	"context" jsonb,
	"preferences" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "decision_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"priority" integer NOT NULL,
	"conditions" jsonb NOT NULL,
	"action" "decision_rule_action" NOT NULL,
	"action_params" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_triggered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"assigned_to" uuid,
	"priority" "escalation_priority" DEFAULT 'NORMAL' NOT NULL,
	"status" "escalation_status" DEFAULT 'PENDING' NOT NULL,
	"reason" "escalation_reason" NOT NULL,
	"issue_description" text NOT NULL,
	"wait_time" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"ai_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"assigned_at" timestamp,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"plan" "organization_plan" DEFAULT 'FREE' NOT NULL,
	"status" "organization_status" DEFAULT 'TRIAL' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"trial_ends_at" timestamp,
	"suspended_at" timestamp,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"period" "metric_period" NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_chats" integer DEFAULT 0 NOT NULL,
	"active_chats" integer DEFAULT 0 NOT NULL,
	"avg_response_time" integer DEFAULT 0 NOT NULL,
	"first_contact_resolution" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"customer_satisfaction" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"escalation_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"ai_resolution_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"tickets_resolved" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"order_id" varchar(255) NOT NULL,
	"customer_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reason" "refund_reason" NOT NULL,
	"status" "refund_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"approved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "representatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "representative_role" DEFAULT 'JUNIOR_SUPPORT' NOT NULL,
	"status" "representative_status" DEFAULT 'OFFLINE' NOT NULL,
	"active_chats" integer DEFAULT 0 NOT NULL,
	"max_chats" integer DEFAULT 10 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp,
	CONSTRAINT "representatives_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "team_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"representative_id" uuid NOT NULL,
	"period" "metric_period" NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"tickets_handled" integer DEFAULT 0 NOT NULL,
	"avg_response_time" integer DEFAULT 0 NOT NULL,
	"resolution_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"customer_satisfaction" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"trend" "performance_trend" DEFAULT 'STABLE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"ticket_number" varchar(50) NOT NULL,
	"conversation_id" uuid,
	"customer_id" uuid NOT NULL,
	"assigned_to" uuid,
	"subject" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'OPEN' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'NORMAL' NOT NULL,
	"category" "ticket_category" NOT NULL,
	"tags" jsonb,
	"ai_handled" boolean DEFAULT false NOT NULL,
	"sentiment" numeric(3, 2),
	"estimated_resolution_time" integer,
	"actual_resolution_time" integer,
	"customer_satisfaction_score" numeric(2, 1),
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'CUSTOMER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_configurations" ADD CONSTRAINT "agent_configurations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_usage_records" ADD CONSTRAINT "budget_usage_records_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_usage_records" ADD CONSTRAINT "budget_usage_records_refund_id_refunds_id_fk" FOREIGN KEY ("refund_id") REFERENCES "public"."refunds"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_usage_records" ADD CONSTRAINT "budget_usage_records_approved_by_representatives_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."representatives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_rules" ADD CONSTRAINT "decision_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_assigned_to_representatives_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."representatives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_approved_by_representatives_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."representatives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "representatives" ADD CONSTRAINT "representatives_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "representatives" ADD CONSTRAINT "representatives_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_performance" ADD CONSTRAINT "team_performance_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_performance" ADD CONSTRAINT "team_performance_representative_id_representatives_id_fk" FOREIGN KEY ("representative_id") REFERENCES "public"."representatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_representatives_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."representatives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_configurations_org_id_idx" ON "agent_configurations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "agent_configurations_type_idx" ON "agent_configurations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "agent_configurations_status_idx" ON "agent_configurations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "budget_usage_records_budget_id_idx" ON "budget_usage_records" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "budget_usage_records_refund_id_idx" ON "budget_usage_records" USING btree ("refund_id");--> statement-breakpoint
CREATE INDEX "budget_usage_records_created_at_idx" ON "budget_usage_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "budgets_org_id_idx" ON "budgets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "budgets_type_idx" ON "budgets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "budgets_period_idx" ON "budgets" USING btree ("period");--> statement-breakpoint
CREATE INDEX "budgets_period_start_idx" ON "budgets" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "customer_profiles_user_id_idx" ON "customer_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customer_profiles_org_id_idx" ON "customer_profiles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_profiles_tier_idx" ON "customer_profiles" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "decision_rules_org_id_idx" ON "decision_rules" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "decision_rules_priority_idx" ON "decision_rules" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "decision_rules_enabled_idx" ON "decision_rules" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "escalations_conversation_id_idx" ON "escalations" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "escalations_customer_id_idx" ON "escalations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "escalations_assigned_to_idx" ON "escalations" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "escalations_status_idx" ON "escalations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "escalations_priority_idx" ON "escalations" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "escalations_org_id_idx" ON "escalations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "performance_metrics_org_id_idx" ON "performance_metrics" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "performance_metrics_period_idx" ON "performance_metrics" USING btree ("period");--> statement-breakpoint
CREATE INDEX "performance_metrics_period_start_idx" ON "performance_metrics" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "refunds_order_id_idx" ON "refunds" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "refunds_customer_id_idx" ON "refunds" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "refunds_status_idx" ON "refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "refunds_org_id_idx" ON "refunds" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "refunds_created_at_idx" ON "refunds" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "representatives_user_id_idx" ON "representatives" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "representatives_org_id_idx" ON "representatives" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "representatives_status_idx" ON "representatives" USING btree ("status");--> statement-breakpoint
CREATE INDEX "team_performance_org_id_idx" ON "team_performance" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "team_performance_rep_id_idx" ON "team_performance" USING btree ("representative_id");--> statement-breakpoint
CREATE INDEX "team_performance_period_idx" ON "team_performance" USING btree ("period");--> statement-breakpoint
CREATE INDEX "team_performance_period_start_idx" ON "team_performance" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "tickets_ticket_number_idx" ON "tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "tickets_customer_id_idx" ON "tickets" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "tickets_assigned_to_idx" ON "tickets" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_priority_idx" ON "tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tickets_org_id_idx" ON "tickets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tickets_created_at_idx" ON "tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_org_id_idx" ON "users" USING btree ("organization_id");