import {createClient} from '@supabase/supabase-js'

const supabaseUrl = 'https://jzxguxkrxskushsoeawl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eGd1eGtyeHNrdXNoc29lYXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMjM2MTcsImV4cCI6MjA3NTg5OTYxN30.ixKkKpNAc5NMJLZ4Z0m_or3CoyaSnri5eJCHlQTI01Q';

const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase;