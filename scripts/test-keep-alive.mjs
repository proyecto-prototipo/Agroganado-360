import fs from 'node:fs';
import path from 'node:path';

function readEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    throw new Error('No se encontró el archivo .env.local en la raíz del proyecto.');
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};

  for (const line of content.split('\n')) {
    const cleanLine = line.trim();

    if (!cleanLine || cleanLine.startsWith('#')) continue;

    const [key, ...valueParts] = cleanLine.split('=');
    const value = valueParts.join('=').trim();

    env[key.trim()] = value.replace(/^["']|["']$/g, '');
  }

  return env;
}

async function testKeepAlive() {
  const env = readEnvFile();

  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local.');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/keep_alive_logs`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      source: 'visual-studio-code-test',
      status: 'ok'
    })
  });

  const text = await response.text();

  console.log('Código HTTP:', response.status);
  console.log('Respuesta:', text || 'Sin contenido');

  if (!response.ok) {
    throw new Error('La prueba falló. Revisa la tabla, las políticas RLS o tus variables de Supabase.');
  }

  console.log('✅ Keep alive probado correctamente desde Visual Studio Code.');
}

testKeepAlive().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});