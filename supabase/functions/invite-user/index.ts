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
        // Get the authorization header from the request
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create a Supabase client with the user's JWT to verify identity
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify the calling user and check their role
        const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser();
        if (userError || !callingUser) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { data: callerProfile } = await userClient
            .from("profiles")
            .select("role")
            .eq("id", callingUser.id)
            .single();

        if (!callerProfile || !["superadmin", "admin"].includes(callerProfile.role)) {
            return new Response(
                JSON.stringify({ error: "Insufficient permissions. Only admins can invite users." }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse request body
        const { email, role } = await req.json();

        if (!email || !role) {
            return new Response(
                JSON.stringify({ error: "Email and role are required." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate role assignment permissions
        if (role === "superadmin") {
            return new Response(
                JSON.stringify({ error: "Cannot invite superadmin users." }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (role === "admin" && callerProfile.role !== "superadmin") {
            return new Response(
                JSON.stringify({ error: "Only superadmins can invite admin users." }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create admin client with service role key
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);

        // Invite the user via Supabase Auth
        const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
            data: { role },
            redirectTo: `${req.headers.get("origin") || supabaseUrl}`,
        });

        if (inviteError) {
            return new Response(
                JSON.stringify({ error: inviteError.message }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Create profile for the invited user
        const { error: profileError } = await adminClient
            .from("profiles")
            .upsert({
                id: inviteData.user.id,
                email,
                role,
                must_change_password: true,
            });

        if (profileError) {
            console.error("Profile creation error:", profileError);
            // User was created but profile failed — log but don't fail the invite
        }

        return new Response(
            JSON.stringify({ success: true, message: `Invitation sent to ${email}` }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
