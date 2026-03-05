import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        // Verify calling user
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser();
        if (userError || !callingUser) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check caller role
        const { data: callerProfile } = await userClient
            .from("profiles")
            .select("role")
            .eq("id", callingUser.id)
            .single();

        if (!callerProfile || !["superadmin", "admin"].includes(callerProfile.role)) {
            return new Response(
                JSON.stringify({ error: "Insufficient permissions." }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { userId } = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ error: "userId is required." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Prevent self-deletion
        if (userId === callingUser.id) {
            return new Response(
                JSON.stringify({ error: "You cannot delete your own account." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceKey);

        // Check the target user's role
        const { data: targetProfile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

        if (!targetProfile) {
            return new Response(
                JSON.stringify({ error: "User not found." }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate deletion permissions
        if (targetProfile.role === "superadmin") {
            return new Response(
                JSON.stringify({ error: "Cannot delete superadmin users." }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (targetProfile.role === "admin" && callerProfile.role !== "superadmin") {
            return new Response(
                JSON.stringify({ error: "Only superadmins can delete admin users." }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Delete the user from auth (cascade will delete the profile)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
        if (deleteError) {
            return new Response(
                JSON.stringify({ error: deleteError.message }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "User deleted successfully." }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
