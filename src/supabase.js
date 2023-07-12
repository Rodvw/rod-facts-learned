import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jsivazpgzcmgwawwfjos.supabase.co';
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaXZhenBnemNtZ3dhd3dmam9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM2NTAwODAsImV4cCI6MTk5OTIyNjA4MH0.nD8-ltQZq9eB1-6CmEtJDJYh40YP_zeDrOVYWyAGEX0';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
// code de supabase initializing js, con la api key no oculta