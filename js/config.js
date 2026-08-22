// RoadWatch Configuration

const SUPABASE_URL = 'https://rrmhrxfnakeizqbwkgdc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybWhyeGZuYWtlaXpxYndrZ2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzM2OTUsImV4cCI6MjEwMjk0OTY5NX0.dngDwQGHif4nsdI62PeNwpJTnAXBhMK3pxaXcjjEDbk';

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client ready');