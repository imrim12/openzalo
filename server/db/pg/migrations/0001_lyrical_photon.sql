ALTER TABLE "conversations" ADD COLUMN "assigned_user_id" uuid;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_channel_unique_idx" ON "contacts" USING btree ("user_id","channel_type","channel_contact_id");--> statement-breakpoint
CREATE INDEX "conversations_assigned_user_id_idx" ON "conversations" USING btree ("assigned_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_channel_thread_unique_idx" ON "conversations" USING btree ("channel_connection_id","channel_thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_channel_message_unique_idx" ON "messages" USING btree ("conversation_id","channel_message_id");