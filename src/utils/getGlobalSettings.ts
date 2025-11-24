import getDb from "@/app/database/db";

let cache = {
  settings: null,
  timestamp: 0,
  ttl: 5000 // refresh every 5 sec
};

export async function getGlobalSettings() {
  const now = Date.now();

  if (cache.settings && now - cache.timestamp < cache.ttl) {
    // console.log('✅ Using cached settings:', cache.settings);
    // console.log('⏰ Cache age:', (now - cache.timestamp) + 'ms');
    return cache.settings;
  }

  const db = await getDb();
  const row = db.prepare("SELECT * FROM global_settings LIMIT 1").get();

  const parsed = {
    ...row,
    site_password_enabled: !!row.site_password_enabled,
    site_under_construction: !!row.site_under_construction,
    site_password: row.site_password ?? "",
  };

  // console.log('🔄 Refreshing cache with:', parsed);
  
  cache.settings = parsed;
  cache.timestamp = now;

  return parsed;
}
