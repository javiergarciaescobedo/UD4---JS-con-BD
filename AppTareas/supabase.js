// *** CONFIGURACIÓN DE SUPABASE ***
const supabaseUrl = 'https://rinlymrxxvfzrtxihwfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbmx5bXJ4eHZmenJ0eGlod2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NzY1MzcsImV4cCI6MjA1ODI1MjUzN30.jWgIAcyFJ2cflaj-5vpwvzxQQ89ooCfekLRHtJiod9I';

// Inicializar el cliente de Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Puedes exportar el cliente si lo necesitas en otros archivos (aunque aquí no es estrictamente necesario)
// Por ejemplo:
// export { supabase };